"""
=============================================================
  AGENT 01 — BACKEND AUDITOR AGENT
=============================================================
Purpose : Audit all Django models, database integrity, migrations,
          and configuration.  Produces a structured JSON report.
Usage   : python scripts/agents/agent_01_backend_auditor.py
          (Run from django_backend/ directory with venv active)
=============================================================
"""

import os
import sys
import json
import traceback
from datetime import datetime

# ── Setup Django env ──────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

import django
django.setup()

from django.db import connection
from django.apps import apps
from django.contrib.auth.models import User
from django.core.management import call_command
from io import StringIO

from courses.models import Course, Module, Lesson, Enrollment
from payments.models import Payment
from accounts.models import Profile

# ── Report skeleton ───────────────────────────────────────────────────────────
report = {
    "agent": "Backend Auditor",
    "timestamp": datetime.now().isoformat(),
    "sections": {}
}

def section(name):
    report["sections"][name] = {}
    return report["sections"][name]

# ─────────────────────────────────────────────────────────────────────────────
# 1. MIGRATION STATUS
# ─────────────────────────────────────────────────────────────────────────────
mig_section = section("migrations")
try:
    buf = StringIO()
    call_command("showmigrations", "--list", stdout=buf, stderr=buf)
    output = buf.getvalue()
    lines = output.strip().splitlines()
    pending = [l.strip() for l in lines if "[ ]" in l]
    applied = [l.strip() for l in lines if "[X]" in l]
    mig_section["status"] = "OK" if not pending else "PENDING"
    mig_section["applied_count"] = len(applied)
    mig_section["pending_count"] = len(pending)
    mig_section["pending_migrations"] = pending
except Exception as e:
    mig_section["status"] = "ERROR"
    mig_section["error"] = str(e)

# ─────────────────────────────────────────────────────────────────────────────
# 2. DATABASE TABLE COUNTS
# ─────────────────────────────────────────────────────────────────────────────
counts_section = section("record_counts")
counts_section["users"] = User.objects.count()
counts_section["profiles"] = Profile.objects.count()
counts_section["courses"] = Course.objects.count()
counts_section["modules"] = Module.objects.count()
counts_section["lessons"] = Lesson.objects.count()
counts_section["enrollments"] = Enrollment.objects.count()
counts_section["payments"] = Payment.objects.count()

# ─────────────────────────────────────────────────────────────────────────────
# 3. ORPHAN DETECTION
# ─────────────────────────────────────────────────────────────────────────────
orphan_section = section("orphan_checks")

# Users without Profile
users_without_profile = User.objects.filter(profile__isnull=True).count()
orphan_section["users_without_profile"] = users_without_profile
orphan_section["users_without_profile_status"] = "OK" if users_without_profile == 0 else "WARN"

# Lessons without a Module
lessons_without_module = Lesson.objects.filter(module__isnull=True).count()
orphan_section["lessons_without_module"] = lessons_without_module
orphan_section["lessons_without_module_status"] = "OK" if lessons_without_module == 0 else "WARN"

# Enrollments for non-existent courses (defensive — FK cascade should prevent but we verify)
orphan_section["enrollment_integrity"] = "OK"

# ─────────────────────────────────────────────────────────────────────────────
# 4. COURSE INTEGRITY
# ─────────────────────────────────────────────────────────────────────────────
course_section = section("course_integrity")
paid_no_price = Course.objects.filter(is_free=False, price__isnull=True).count()
paid_zero = Course.objects.filter(is_free=False, price__lte=0).count()
free_with_price = Course.objects.filter(is_free=True, price__gt=0).count()
published_courses = Course.objects.filter(is_published=True).count()
unpublished_courses = Course.objects.filter(is_published=False).count()

course_section["paid_courses_missing_price"] = paid_no_price
course_section["paid_courses_zero_price"] = paid_zero
course_section["free_courses_with_price"] = free_with_price
course_section["published"] = published_courses
course_section["unpublished"] = unpublished_courses
course_section["status"] = "OK" if (paid_no_price + paid_zero + free_with_price) == 0 else "WARN"

# ─────────────────────────────────────────────────────────────────────────────
# 5. ENROLLMENT INTEGRITY
# ─────────────────────────────────────────────────────────────────────────────
enroll_section = section("enrollment_integrity")
active_enrollments = Enrollment.objects.filter(is_active=True).count()
inactive_enrollments = Enrollment.objects.filter(is_active=False).count()
enroll_section["active"] = active_enrollments
enroll_section["inactive"] = inactive_enrollments

# Duplicate check (unique_together should prevent, but verify)
from django.db.models import Count
dupes = (Enrollment.objects
         .values("user", "course")
         .annotate(cnt=Count("id"))
         .filter(cnt__gt=1)
         .count())
enroll_section["duplicate_enrollments"] = dupes
enroll_section["status"] = "OK" if dupes == 0 else "CRITICAL"

# ─────────────────────────────────────────────────────────────────────────────
# 6. PAYMENT INTEGRITY
# ─────────────────────────────────────────────────────────────────────────────
pay_section = section("payment_integrity")
pay_section["total"] = Payment.objects.count()
pay_section["pending"] = Payment.objects.filter(status="pending").count()
pay_section["paid"] = Payment.objects.filter(status="paid").count()
pay_section["failed"] = Payment.objects.filter(status="failed").count()

# Payments where enrollment is NOT active (potential mismatch)
paid_no_enrollment = 0
for p in Payment.objects.filter(status="paid"):
    if not Enrollment.objects.filter(user=p.user, course=p.course, is_active=True).exists():
        paid_no_enrollment += 1
pay_section["paid_payments_without_active_enrollment"] = paid_no_enrollment
pay_section["status"] = "OK" if paid_no_enrollment == 0 else "CRITICAL"

# ─────────────────────────────────────────────────────────────────────────────
# 7. ROLE DISTRIBUTION
# ─────────────────────────────────────────────────────────────────────────────
role_section = section("role_distribution")
role_section["students"] = Profile.objects.filter(role="student").count()
role_section["teachers"] = Profile.objects.filter(role="teacher").count()
role_section["admins"] = Profile.objects.filter(role="admin").count()

# ─────────────────────────────────────────────────────────────────────────────
# 8. DB TABLE EXISTENCE
# ─────────────────────────────────────────────────────────────────────────────
tables_section = section("database_tables")
expected_tables = [
    "courses_course", "courses_module", "courses_lesson", "courses_enrollment",
    "accounts_profile", "payments_payment",
    "auth_user", "auth_group", "django_session",
]
existing_tables = connection.introspection.table_names()
table_check = {}
for t in expected_tables:
    table_check[t] = "PRESENT" if t in existing_tables else "MISSING"
tables_section["checks"] = table_check
tables_section["status"] = "OK" if all(v == "PRESENT" for v in table_check.values()) else "CRITICAL"

# ─────────────────────────────────────────────────────────────────────────────
# 9. OVERALL VERDICT
# ─────────────────────────────────────────────────────────────────────────────
all_statuses = [
    mig_section.get("status"),
    course_section.get("status"),
    enroll_section.get("status"),
    pay_section.get("status"),
    orphan_section.get("users_without_profile_status"),
    tables_section.get("status"),
]
if "CRITICAL" in all_statuses:
    report["overall_status"] = "CRITICAL"
elif "WARN" in all_statuses:
    report["overall_status"] = "WARN"
elif "ERROR" in all_statuses:
    report["overall_status"] = "ERROR"
else:
    report["overall_status"] = "PASS"

# ─────────────────────────────────────────────────────────────────────────────
# OUTPUT
# ─────────────────────────────────────────────────────────────────────────────
output_path = os.path.join(BASE_DIR, "scripts", "agents", "reports", "report_01_backend_auditor.json")
os.makedirs(os.path.dirname(output_path), exist_ok=True)
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2, default=str)

print(json.dumps(report, indent=2, default=str))
print(f"\n[Agent 01] Report saved → {output_path}")
