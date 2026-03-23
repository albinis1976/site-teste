"""
=============================================================
  AGENT 07 — SECURITY & INTEGRITY AGENT
=============================================================
Purpose : Performs a comprehensive security audit of the Django
          backend — checks configuration, secret keys, permissions,
          webhook signature validation, dangerous endpoints,
          and SQL injection exposure.
Usage   : python scripts/agents/agent_07_security_integrity.py
          (Run from django_backend/ directory with venv active)
=============================================================
"""

import os
import sys
import json
import re
from datetime import datetime

# ── Django env ────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(os.path.dirname(SCRIPT_DIR))
sys.path.insert(0, BACKEND_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
import django
django.setup()

from django.conf import settings
from django.contrib.auth.models import User

report = {
    "agent": "Security & Integrity",
    "timestamp": datetime.now().isoformat(),
    "sections": {}
}

def section(name):
    report["sections"][name] = {}
    return report["sections"][name]

def check(label, condition, severity="WARN"):
    return {"check": label, "passed": condition, "severity": severity if not condition else "OK"}

# ─────────────────────────────────────────────────────────────────────────────
# 1. DJANGO SETTINGS SECURITY
# ─────────────────────────────────────────────────────────────────────────────
config_section = section("django_configuration")
checks = []

checks.append(check("DEBUG is False in production",
    not settings.DEBUG, "CRITICAL"))
checks.append(check("SECRET_KEY is not the insecure default",
    "django-insecure" not in settings.SECRET_KEY and len(settings.SECRET_KEY) >= 40, "CRITICAL"))
checks.append(check("ALLOWED_HOSTS is not wildcard",
    "*" not in settings.ALLOWED_HOSTS, "HIGH"))
checks.append(check("CORS origins are not wildcard",
    not getattr(settings, "CORS_ALLOW_ALL_ORIGINS", False), "HIGH"))
checks.append(check("CSRF_COOKIE_SECURE is True",
    getattr(settings, "CSRF_COOKIE_SECURE", False), "MEDIUM"))
checks.append(check("SESSION_COOKIE_SECURE is True",
    getattr(settings, "SESSION_COOKIE_SECURE", False), "MEDIUM"))
checks.append(check("SECURE_SSL_REDIRECT is True",
    getattr(settings, "SECURE_SSL_REDIRECT", False), "MEDIUM"))
checks.append(check("SECURE_HSTS_SECONDS > 0",
    getattr(settings, "SECURE_HSTS_SECONDS", 0) > 0, "LOW"))
checks.append(check("X_FRAME_OPTIONS is set",
    getattr(settings, "X_FRAME_OPTIONS", "") != "", "LOW"))

# Note: DEBUG=True in dev is expected — label it as DEV EXPECTED
for c in checks:
    if c["check"] == "DEBUG is False in production" and settings.DEBUG:
        c["note"] = "DEV_EXPECTED — Set DEBUG=False for production deployment"
    if "SECURE" in c["check"] or "COOKIE" in c["check"]:
        if settings.DEBUG:
            c["note"] = "DEV_EXPECTED — These should be True on HTTPS/production"

config_section["checks"] = checks
critical_fails = [c for c in checks if not c["passed"] and c["severity"] == "CRITICAL"]
config_section["critical_failures"] = len(critical_fails)
config_section["status"] = "CRITICAL" if critical_fails else (
    "WARN" if any(not c["passed"] for c in checks) else "OK")

# ─────────────────────────────────────────────────────────────────────────────
# 2. STRIPE KEYS
# ─────────────────────────────────────────────────────────────────────────────
stripe_section = section("stripe_key_configuration")
stripe_key = getattr(settings, "STRIPE_SECRET_KEY", "")
webhook_secret = getattr(settings, "STRIPE_WEBHOOK_SECRET", "")

stripe_checks = []
stripe_checks.append(check("Stripe secret key is configured",
    stripe_key and not stripe_key.startswith("sk_test_your"), "CRITICAL"))
stripe_checks.append(check("Stripe key is test key (not live) in dev",
    stripe_key.startswith("sk_test_"), "INFO"))
stripe_checks.append(check("Stripe webhook secret is configured",
    webhook_secret and not webhook_secret.startswith("whsec_your"), "HIGH"))
stripe_checks.append(check("Live key not used in DEBUG mode",
    not (settings.DEBUG and stripe_key.startswith("sk_live_")), "CRITICAL"))

stripe_section["checks"] = stripe_checks
unconfigured = [c for c in stripe_checks if not c["passed"] and c["severity"] in ("CRITICAL", "HIGH")]
stripe_section["unconfigured_keys"] = len(unconfigured)
stripe_section["status"] = "WARN" if unconfigured else "OK"
stripe_section["note"] = "Configure real keys in .env before going to production"

# ─────────────────────────────────────────────────────────────────────────────
# 3. WEBHOOK SIGNATURE VALIDATION
# ─────────────────────────────────────────────────────────────────────────────
webhook_section = section("webhook_signature_validation")
payments_views = os.path.join(BACKEND_DIR, "payments", "views.py")
if os.path.isfile(payments_views):
    content = open(payments_views, encoding="utf-8").read()
    webhook_checks = []
    webhook_checks.append(check("Webhook validates Stripe signature",
        "construct_event" in content and "SignatureVerificationError" in content, "CRITICAL"))
    webhook_checks.append(check("Webhook checks raw payload (not parsed)",
        "request.body" in content, "CRITICAL"))
    webhook_checks.append(check("Webhook checks sig_header presence",
        "sig_header" in content and "if not sig_header" in content, "HIGH"))
    webhook_checks.append(check("Webhook endpoint is AllowAny (required by Stripe)",
        "AllowAny" in content, "INFO"))
    webhook_checks.append(check("Webhook handles invalid payload gracefully",
        "ValueError" in content, "MEDIUM"))
    webhook_section["checks"] = webhook_checks
    failed = [c for c in webhook_checks if not c["passed"] and c["severity"] == "CRITICAL"]
    webhook_section["status"] = "CRITICAL" if failed else "OK"
else:
    webhook_section["status"] = "ERROR"
    webhook_section["error"] = "payments/views.py not found"

# ─────────────────────────────────────────────────────────────────────────────
# 4. ENDPOINT PERMISSION AUDIT
# ─────────────────────────────────────────────────────────────────────────────
perm_section = section("endpoint_permission_audit")

views_to_check = {
    "courses/views.py": {
        "CourseListView": "AllowAny",
        "EnrollView": "IsAuthenticated",
        "MyEnrollmentsView": "IsAuthenticated",
        "LessonDetailView": "IsAuthenticated",
        "CourseAccessView": "IsAuthenticated",
        "CourseCreateView": "IsTeacherOrAdmin",
        "TeacherCourseListView": "IsTeacherOrAdmin",
    },
    "accounts/views.py": {
        "RegisterView": "AllowAny",
        "ProfileView": "IsAuthenticated",
        "TeacherCreateView": "IsAdminUser",
    },
    "payments/views.py": {
        "CreateCheckoutSessionView": "IsAuthenticated",
        "StripeWebhookView": "AllowAny",
    }
}

perm_checks = {}
for rel_path, view_perms in views_to_check.items():
    fpath = os.path.join(BACKEND_DIR, rel_path)
    if not os.path.isfile(fpath):
        perm_checks[rel_path] = {"error": "File not found"}
        continue
    content = open(fpath, encoding="utf-8").read()
    file_checks = {}
    for view_name, expected_perm in view_perms.items():
        view_found = view_name in content
        perm_found = expected_perm in content
        file_checks[view_name] = {
            "view_found": view_found,
            "expected_permission": expected_perm,
            "permission_class_present": perm_found,
            "passed": view_found and perm_found,
        }
    perm_checks[rel_path] = file_checks

perm_section["checks"] = perm_checks
failed_perms = [v for fc in perm_checks.values() if isinstance(fc, dict)
                for v in fc.values() if isinstance(v, dict) and not v.get("passed")]
perm_section["failed_checks"] = len(failed_perms)
perm_section["status"] = "OK" if not failed_perms else "WARN"

# ─────────────────────────────────────────────────────────────────────────────
# 5. SUPERUSER / ADMIN ACCOUNTS
# ─────────────────────────────────────────────────────────────────────────────
accounts_section = section("privileged_account_audit")
superusers = User.objects.filter(is_superuser=True)
staff_users = User.objects.filter(is_staff=True)
accounts_section["superuser_count"] = superusers.count()
accounts_section["staff_count"] = staff_users.count()
accounts_section["superusers"] = [u.email for u in superusers]
accounts_section["staff_users"] = [u.email for u in staff_users]

# Warn if any superuser has a weak or obvious username
obvious = ["admin", "root", "test", "user", "administrator"]
weak_accounts = [u.username for u in superusers if u.username.lower() in obvious]
accounts_section["weak_usernames"] = weak_accounts
accounts_section["status"] = "WARN" if weak_accounts else "OK"

# ─────────────────────────────────────────────────────────────────────────────
# 6. SOURCE CODE INSPECTION — SQL INJECTION / RAW QUERIES
# ─────────────────────────────────────────────────────────────────────────────
injection_section = section("raw_query_inspection")
raw_query_files = {}
search_dirs = ["courses", "accounts", "payments"]
dangerous_patterns = ["raw(", ".extra(", "cursor.execute(", "RawSQL(", "format("]

for app in search_dirs:
    for fname in ["views.py", "models.py", "serializers.py"]:
        fpath = os.path.join(BACKEND_DIR, app, fname)
        if not os.path.isfile(fpath):
            continue
        content = open(fpath, encoding="utf-8").read()
        found = [p for p in dangerous_patterns if p in content]
        if found:
            raw_query_files[f"{app}/{fname}"] = found

injection_section["files_with_raw_queries"] = raw_query_files
injection_section["status"] = "WARN" if raw_query_files else "OK"
injection_section["note"] = "Raw queries are not always dangerous but should be reviewed"

# ─────────────────────────────────────────────────────────────────────────────
# 7. PASSWORD RESET TOKEN SECURITY
# ─────────────────────────────────────────────────────────────────────────────
reset_section = section("password_reset_security")
accts_views = os.path.join(BACKEND_DIR, "accounts", "views.py")
if os.path.isfile(accts_views):
    content = open(accts_views, encoding="utf-8").read()
    reset_checks = []
    reset_checks.append(check("Uses Django default_token_generator", "default_token_generator" in content, "HIGH"))
    reset_checks.append(check("Uses UID base64 encoding", "urlsafe_base64_encode" in content, "HIGH"))
    reset_checks.append(check("Token validation on confirm", "check_token" in content, "CRITICAL"))
    reset_checks.append(check("Does not reveal if email exists", "Se o email estiver cadastrado" in content or
                               "instruções" in content, "MEDIUM"))
    reset_section["checks"] = reset_checks
    failed = [c for c in reset_checks if not c["passed"] and c["severity"] in ("CRITICAL", "HIGH")]
    reset_section["status"] = "OK" if not failed else "CRITICAL"
else:
    reset_section["status"] = "SKIP"

# ─────────────────────────────────────────────────────────────────────────────
# 8. SECURITY LOG ANALYSIS (scan existing security.log)
# ─────────────────────────────────────────────────────────────────────────────
log_section = section("security_log_analysis")
log_path = os.path.join(BACKEND_DIR, "security.log")
if os.path.isfile(log_path):
    log_size = os.path.getsize(log_path)
    log_content = open(log_path, encoding="utf-8", errors="replace").read()
    critical_keywords = ["CRITICAL", "Tentativa", "forja", "Webhook rejeitado", "SignatureVerification"]
    findings = {}
    for kw in critical_keywords:
        count = log_content.count(kw)
        if count > 0:
            findings[kw] = count
    log_section["log_size_bytes"] = log_size
    log_section["critical_keywords_found"] = findings
    log_section["suspicious_events"] = sum(findings.values())
    log_section["status"] = "WARN" if findings else "OK"
else:
    log_section["status"] = "SKIP"
    log_section["note"] = "security.log not found"

# ─────────────────────────────────────────────────────────────────────────────
# 9. OVERALL VERDICT
# ─────────────────────────────────────────────────────────────────────────────
all_statuses = [
    config_section.get("status"),
    webhook_section.get("status"),
    perm_section.get("status"),
    reset_section.get("status"),
]
real = [s for s in all_statuses if s not in ("SKIP", "INFO", None)]
if "CRITICAL" in real:
    report["overall_status"] = "CRITICAL"
elif "WARN" in real or "HIGH" in real:
    report["overall_status"] = "WARN"
else:
    report["overall_status"] = "PASS"

# Dev note
if settings.DEBUG:
    report["dev_mode_note"] = (
        "Running in DEBUG=True. Many security flags (SSL, HTTPS cookies) are expected to be False "
        "in local development. Review CRITICAL items carefully."
    )

# ─────────────────────────────────────────────────────────────────────────────
# OUTPUT
# ─────────────────────────────────────────────────────────────────────────────
reports_dir = os.path.join(SCRIPT_DIR, "reports")
os.makedirs(reports_dir, exist_ok=True)
output_path = os.path.join(reports_dir, "report_07_security_integrity.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2, default=str)

print(json.dumps(report, indent=2, default=str))
print(f"\n[Agent 07] Report saved → {output_path}")
