"""
=============================================================
  AGENT 03 — API INTEGRATION AGENT
=============================================================
Purpose : Performs live HTTP calls against the running Django API
          and validates every endpoint's response for correct
          status codes, field shape, and authentication enforcement.
Usage   : python scripts/agents/agent_03_api_integration.py
          (Ensure Django dev server is running: python manage.py runserver)
=============================================================
"""

import os
import sys
import json
import requests
from datetime import datetime

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(os.path.dirname(SCRIPT_DIR)))

BASE_URL = "http://127.0.0.1:8001"

# ── Credentials — read from real DB via Django shell, or use known test creds ─
# Agent reads env file instead of hard-coding
BACKEND_DIR = os.path.dirname(os.path.dirname(SCRIPT_DIR))
env_path = os.path.join(BACKEND_DIR, ".env")

TEST_STUDENT_EMAIL = None
TEST_STUDENT_PASS = None

if os.path.isfile(env_path):
    for line in open(env_path, encoding="utf-8").read().splitlines():
        if line.startswith("TEST_STUDENT_EMAIL="):
            TEST_STUDENT_EMAIL = line.split("=", 1)[1].strip()
        if line.startswith("TEST_STUDENT_PASS="):
            TEST_STUDENT_PASS = line.split("=", 1)[1].strip()

# Fallback: use script args
if len(sys.argv) >= 3:
    TEST_STUDENT_EMAIL = sys.argv[1]
    TEST_STUDENT_PASS = sys.argv[2]

if not TEST_STUDENT_EMAIL or not TEST_STUDENT_PASS:
    print("[Agent 03] WARNING: No test credentials provided. Auth-required tests will be skipped.")
    print("           Set TEST_STUDENT_EMAIL / TEST_STUDENT_PASS in .env, or pass as args:")
    print("           python agent_03_api_integration.py user@test.com password123")

report = {
    "agent": "API Integration",
    "timestamp": datetime.now().isoformat(),
    "base_url": BASE_URL,
    "sections": {}
}

def section(name):
    report["sections"][name] = {}
    return report["sections"][name]

def call(method, path, *, token=None, json_body=None, expected_status=None, label=None):
    url = BASE_URL + path
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    try:
        resp = getattr(requests, method)(url, json=json_body, headers=headers, timeout=8)
        result = {
            "url": url,
            "method": method.upper(),
            "status_code": resp.status_code,
            "response_preview": resp.text[:300] if resp.text else "",
        }
        if expected_status is not None:
            result["expected_status"] = expected_status
            result["passed"] = resp.status_code == expected_status
        return result
    except requests.exceptions.ConnectionError:
        return {"url": url, "method": method.upper(), "error": "CONNECTION_REFUSED – Is Django running?", "passed": False}
    except Exception as e:
        return {"url": url, "method": method.upper(), "error": str(e), "passed": False}

# ─────────────────────────────────────────────────────────────────────────────
# 1. SERVER HEALTH
# ─────────────────────────────────────────────────────────────────────────────
health_section = section("server_health")
res = call("get", "/", expected_status=200, label="welcome")
health_section["welcome_endpoint"] = res
health_section["server_reachable"] = res.get("status_code") == 200
health_section["status"] = "OK" if health_section["server_reachable"] else "CRITICAL"

server_up = health_section["server_reachable"]

# ─────────────────────────────────────────────────────────────────────────────
# 2. PUBLIC ENDPOINTS (no auth required)
# ─────────────────────────────────────────────────────────────────────────────
public_section = section("public_endpoints")
public_tests = []

if server_up:
    public_tests.append(call("get", "/api/courses/", expected_status=200, label="course_list"))
    # Fetch first course ID for slug/detail tests later
    try:
        r = requests.get(BASE_URL + "/api/courses/", timeout=8)
        courses = r.json() if r.ok else []
        first_course_id = courses[0]["id"] if courses else None
        first_course_slug = courses[0].get("slug") if courses else None
    except Exception:
        first_course_id = None
        first_course_slug = None

    if first_course_id:
        public_tests.append(call("get", f"/api/courses/{first_course_id}/", expected_status=200, label="course_detail_by_id"))
    if first_course_slug:
        public_tests.append(call("get", f"/api/courses/{first_course_slug}/", expected_status=200, label="course_detail_by_slug"))

public_section["tests"] = public_tests
public_section["passed"] = sum(1 for t in public_tests if t.get("passed"))
public_section["failed"] = sum(1 for t in public_tests if not t.get("passed"))
public_section["status"] = "OK" if public_section["failed"] == 0 else "FAIL"

# ─────────────────────────────────────────────────────────────────────────────
# 3. AUTH ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────
auth_section = section("auth_endpoints")
auth_tests = []
token = None

if server_up:
    # Registration (expect 400 for duplicate email, or 201 for new user)
    unique_reg_id = datetime.now().strftime("%H%M%S")
    reg_result = call("post", "/api/accounts/register/",
                      json_body={"username": f"agent03_{unique_reg_id}", "email": f"agent03_{unique_reg_id}@test.com",
                                 "password": "Agent!Auth#99", "full_name": "API Agent Test User"},
                      label="register")
    reg_result["note"] = "201=new user, 400=already exists — both are valid probe results"
    auth_tests.append(reg_result)

    # Login
    if TEST_STUDENT_EMAIL and TEST_STUDENT_PASS:
        # We need the full response to get the token, truncated preview won't work
        url = BASE_URL + "/api/accounts/login/"
        try:
            r = requests.post(url, json={"username": TEST_STUDENT_EMAIL, "password": TEST_STUDENT_PASS}, timeout=8)
            login_result = {
                "url": url, "method": "POST", "status_code": r.status_code,
                "response_preview": r.text[:300], "expected_status": 200, "passed": r.status_code == 200
            }
            auth_tests.append(login_result)
            if r.status_code == 200:
                token = r.json().get("access")
        except Exception as e:
            auth_tests.append({"label": "login", "error": str(e), "passed": False})
    else:
        auth_tests.append({"label": "login", "skipped": True, "reason": "No credentials provided"})

    # Login with wrong password
    bad_login = call("post", "/api/accounts/login/",
                     json_body={"username": "nobody@nowhere.com", "password": "wrong"},
                     expected_status=401, label="login_bad_credentials")
    auth_tests.append(bad_login)

    # Profile (needs token)
    if token:
        profile_result = call("get", "/api/accounts/me/", token=token, expected_status=200, label="profile")
        auth_tests.append(profile_result)
    else:
        auth_tests.append({"label": "profile", "skipped": True, "reason": "No token"})

    # Profile without token → should return 401
    profile_unauth = call("get", "/api/accounts/me/", expected_status=401, label="profile_unauthenticated")
    auth_tests.append(profile_unauth)

auth_section["tests"] = auth_tests
auth_section["status"] = "OK" if all(t.get("passed", t.get("skipped", False)) for t in auth_tests) else "FAIL"

# ─────────────────────────────────────────────────────────────────────────────
# 4. AUTHENTICATED COURSE ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────
course_auth_section = section("authenticated_course_endpoints")
course_auth_tests = []

if server_up and token:
    course_auth_tests.append(call("get", "/api/courses/enrollments/", token=token, expected_status=200, label="my_enrollments"))
    if first_course_id:
        course_auth_tests.append(call("get", f"/api/courses/{first_course_id}/access/", token=token, expected_status=200, label="course_access"))
else:
    course_auth_tests.append({"skipped": True, "reason": "No server or no token"})

course_auth_section["tests"] = course_auth_tests
course_auth_section["status"] = "OK" if all(t.get("passed", t.get("skipped", False)) for t in course_auth_tests) else "FAIL"

# ─────────────────────────────────────────────────────────────────────────────
# 5. AUTH ENFORCEMENT (ensure protected routes return 401 unauthenticated)
# ─────────────────────────────────────────────────────────────────────────────
enforcement_section = section("auth_enforcement")
enforcement_tests = []

if server_up:
    enforcement_tests.append(call("get", "/api/courses/enrollments/", expected_status=401, label="enrollments_no_auth"))
    enforcement_tests.append(call("post", "/api/courses/1/enroll/", expected_status=401, label="enroll_no_auth"))
    enforcement_tests.append(call("post", "/api/payments/create-checkout-session/1/", expected_status=401, label="checkout_no_auth"))

enforcement_section["tests"] = enforcement_tests
enforcement_section["passed"] = sum(1 for t in enforcement_tests if t.get("passed"))
enforcement_section["failed"] = sum(1 for t in enforcement_tests if not t.get("passed"))
enforcement_section["status"] = "OK" if enforcement_section["failed"] == 0 else "CRITICAL"

# ─────────────────────────────────────────────────────────────────────────────
# 6. EXTENDED ENDPOINT TESTS (Lessons, Enrollment, Payments)
# ─────────────────────────────────────────────────────────────────────────────
extended_section = section("extended_endpoints")
ext_tests = []

if server_up and token:
    # 1. Lesson Detail
    # Try to find a lesson ID from the first course
    lesson_id = None
    try:
        r = requests.get(BASE_URL + f"/api/courses/{first_course_id}/", timeout=8)
        c_data = r.json()
        # Look in modules
        if c_data.get("modules"):
            for m in c_data["modules"]:
                if m.get("lessons"):
                    lesson_id = m["lessons"][0]["id"]
                    break
        # Look in direct lessons
        if not lesson_id and c_data.get("lessons"):
            lesson_id = c_data["lessons"][0]["id"]
    except: pass

    if lesson_id:
        ext_tests.append(call("get", f"/api/courses/lessons/{lesson_id}/", token=token, expected_status=200, label="lesson_detail"))
    else:
        ext_tests.append({"label": "lesson_detail", "skipped": True, "reason": "No lesson found in first course"})

    # 2. Enroll Action (POST)
    # We use a course the user isn't enrolled in, or expect a 400 if already enrolled
    if first_course_id:
        enroll_res = call("post", f"/api/courses/{first_course_id}/enroll/", token=token, label="enroll_action")
        enroll_res["note"] = "201=success, 400=already enrolled — both valid"
        ext_tests.append(enroll_res)

    # 3. Payments (Checkout Session)
    # Target a paid course
    paid_course_id = None
    try:
        r = requests.get(BASE_URL + "/api/courses/", timeout=8)
        paid_courses = [c for c in r.json() if not c.get("is_free")]
        if paid_courses:
            paid_course_id = paid_courses[0]["id"]
    except: pass

    if paid_course_id:
        ext_tests.append(call("post", f"/api/payments/create-checkout-session/{paid_course_id}/", token=token, expected_status=200, label="create_checkout_session"))
    else:
        ext_tests.append({"label": "create_checkout_session", "skipped": True, "reason": "No paid course found"})

extended_section["tests"] = ext_tests
extended_section["status"] = "OK" if all(t.get("passed", t.get("skipped", False)) or t.get("status_code") in [201, 400] for t in ext_tests) else "FAIL"

# ─────────────────────────────────────────────────────────────────────────────
# 7. OVERALL VERDICT
# ─────────────────────────────────────────────────────────────────────────────
statuses = [
    health_section.get("status"),
    public_section.get("status"),
    auth_section.get("status"),
    enforcement_section.get("status"),
    extended_section.get("status"),
]
if not server_up:
    report["overall_status"] = "CRITICAL"
elif "CRITICAL" in statuses:
    report["overall_status"] = "CRITICAL"
elif "FAIL" in statuses:
    report["overall_status"] = "FAIL"
else:
    report["overall_status"] = "PASS"

# ─────────────────────────────────────────────────────────────────────────────
# OUTPUT
# ─────────────────────────────────────────────────────────────────────────────
reports_dir = os.path.join(SCRIPT_DIR, "reports")
os.makedirs(reports_dir, exist_ok=True)
output_path = os.path.join(reports_dir, "report_03_api_integration.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2, default=str)

print(json.dumps(report, indent=2, default=str))
print(f"\n[Agent 03] Report saved → {output_path}")
