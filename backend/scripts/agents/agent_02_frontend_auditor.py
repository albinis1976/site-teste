"""
=============================================================
  AGENT 02 — FRONTEND AUDITOR AGENT
=============================================================
Purpose : Audits the React frontend source code — checks file
          existence, API service wiring, authentication usage,
          and route completeness.  Produces a structured JSON report.
Usage   : python scripts/agents/agent_02_frontend_auditor.py
          (Can be run from any directory; no Django env needed)
=============================================================
"""

import os
import sys
import json
import re
from datetime import datetime

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))          # .../scripts/agents
DJANGO_DIR = os.path.dirname(os.path.dirname(SCRIPT_DIR))        # .../django_backend
PROJECT_ROOT = os.path.dirname(DJANGO_DIR)                        # .../ENGLISH-GEMINI-CLI
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend_react", "src")


report = {
    "agent": "Frontend Auditor",
    "timestamp": datetime.now().isoformat(),
    "sections": {}
}

def section(name):
    report["sections"][name] = {}
    return report["sections"][name]

# ─────────────────────────────────────────────────────────────────────────────
# 1. KEY FILE EXISTENCE
# ─────────────────────────────────────────────────────────────────────────────
files_section = section("key_file_existence")
EXPECTED_FILES = {
    "App.jsx":                 "src/App.jsx",
    "main.jsx":                "src/main.jsx",
    "Login.jsx":               "src/pages/Login.jsx",
    "Register.jsx":            "src/pages/Register.jsx",
    "Courses.jsx":             "src/pages/Courses.jsx",
    "CoursePlayer.jsx":        "src/pages/CoursePlayer.jsx",
    "Plans.jsx":               "src/pages/Plans.jsx",
    "ForgotPassword.jsx":      "src/pages/ForgotPassword.jsx",
    "ResetPassword.jsx":       "src/pages/ResetPassword.jsx",
    "api.js":                  "src/services/api.js",
    "authService.js":          "src/services/authService.js",
    "courseService.js":        "src/services/courseService.js",
    "userService.js":          "src/services/userService.js",
}
base = os.path.join(PROJECT_ROOT, "frontend_react")

file_results = {}
for label, rel in EXPECTED_FILES.items():
    full = os.path.join(base, rel)
    exists = os.path.isfile(full)
    size = os.path.getsize(full) if exists else 0
    file_results[label] = {"exists": exists, "size_bytes": size}

files_section["checks"] = file_results
missing = [k for k, v in file_results.items() if not v["exists"]]
files_section["missing_files"] = missing
files_section["status"] = "OK" if not missing else "CRITICAL"

# ─────────────────────────────────────────────────────────────────────────────
# 2. API BASE URL
# ─────────────────────────────────────────────────────────────────────────────
api_section = section("api_configuration")
api_js_path = os.path.join(base, "src", "services", "api.js")
if os.path.isfile(api_js_path):
    api_content = open(api_js_path, encoding="utf-8").read()
    # Extract baseURL
    match = re.search(r'baseURL\s*[:=]\s*["\']([^"\']+)["\']', api_content)
    api_section["base_url"] = match.group(1) if match else "NOT FOUND"
    api_section["has_interceptor"] = "interceptors" in api_content
    api_section["has_auth_header"] = "Authorization" in api_content
    api_section["status"] = "OK" if match else "WARN"
else:
    api_section["status"] = "ERROR"
    api_section["error"] = "api.js not found"

# ─────────────────────────────────────────────────────────────────────────────
# 3. AUTH CONTEXT / PROTECTED ROUTES
# ─────────────────────────────────────────────────────────────────────────────
auth_section = section("auth_context")
context_dir = os.path.join(FRONTEND_DIR, "context")
context_files = os.listdir(context_dir) if os.path.isdir(context_dir) else []
auth_section["context_files"] = context_files

app_path = os.path.join(FRONTEND_DIR, "App.jsx")
if os.path.isfile(app_path):
    app_content = open(app_path, encoding="utf-8").read()
    auth_section["has_protected_route"] = "PrivateRoute" in app_content or "RequireAuth" in app_content or "AuthContext" in app_content
    auth_section["uses_react_router"] = "BrowserRouter" in app_content or "Routes" in app_content or "Route" in app_content
    auth_section["routes_count"] = app_content.count("<Route")
    auth_section["status"] = "OK"
else:
    auth_section["status"] = "ERROR"
    auth_section["error"] = "App.jsx not found"

# ─────────────────────────────────────────────────────────────────────────────
# 4. PAGE ANALYSIS — Check for API calls and localStorage token usage
# ─────────────────────────────────────────────────────────────────────────────
pages_section = section("page_analysis")
pages_dir = os.path.join(FRONTEND_DIR, "pages")
page_results = {}

for fname in os.listdir(pages_dir):
    if not fname.endswith(".jsx"):
        continue
    fpath = os.path.join(pages_dir, fname)
    if not os.path.isfile(fpath):
        continue
    content = open(fpath, encoding="utf-8").read()
    page_results[fname] = {
        "size_bytes": os.path.getsize(fpath),
        "uses_api": "api" in content.lower() or "axios" in content.lower() or "fetch(" in content,
        "uses_auth_token": "localStorage" in content or "useAuth" in content or "AuthContext" in content,
        "has_error_handling": "catch" in content or ".catch" in content,
        "has_loading_state": "loading" in content.lower() or "isLoading" in content,
    }

pages_section["pages"] = page_results
pages_section["total_pages"] = len(page_results)

# ─────────────────────────────────────────────────────────────────────────────
# 5. ENVIRONMENT CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────
env_section = section("environment")
env_path = os.path.join(base, ".env")
if os.path.isfile(env_path):
    env_content = open(env_path, encoding="utf-8").read()
    env_section["env_file_exists"] = True
    env_section["has_vite_api_url"] = "VITE_API_URL" in env_content
    env_section["has_vite_stripe_key"] = "VITE_STRIPE" in env_content
else:
    env_section["env_file_exists"] = False
    env_section["status"] = "WARN"

# ─────────────────────────────────────────────────────────────────────────────
# 6. PLANS / PAYMENT PAGE CHECK
# ─────────────────────────────────────────────────────────────────────────────
plans_section = section("payment_integration")
plans_path = os.path.join(pages_dir, "Plans.jsx")
if os.path.isfile(plans_path):
    plans_content = open(plans_path, encoding="utf-8").read()
    plans_section["has_checkout_call"] = "checkout" in plans_content.lower() or "stripe" in plans_content.lower()
    plans_section["has_redirect"] = "window.location" in plans_content or "navigate" in plans_content
    plans_section["handles_errors"] = "catch" in plans_content
    plans_section["status"] = "OK" if plans_section["has_checkout_call"] else "WARN"
else:
    plans_section["status"] = "MISSING"

# ─────────────────────────────────────────────────────────────────────────────
# 7. OVERALL VERDICT
# ─────────────────────────────────────────────────────────────────────────────
statuses = [
    files_section.get("status"),
    api_section.get("status"),
    auth_section.get("status"),
    plans_section.get("status"),
]
if "CRITICAL" in statuses:
    report["overall_status"] = "CRITICAL"
elif "WARN" in statuses or "ERROR" in statuses:
    report["overall_status"] = "WARN"
elif "MISSING" in statuses:
    report["overall_status"] = "WARN"
else:
    report["overall_status"] = "PASS"

# ─────────────────────────────────────────────────────────────────────────────
# OUTPUT
# ─────────────────────────────────────────────────────────────────────────────
reports_dir = os.path.join(SCRIPT_DIR, "reports")
os.makedirs(reports_dir, exist_ok=True)
output_path = os.path.join(reports_dir, "report_02_frontend_auditor.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2, default=str)

print(json.dumps(report, indent=2, default=str))
print(f"\n[Agent 02] Report saved → {output_path}")
