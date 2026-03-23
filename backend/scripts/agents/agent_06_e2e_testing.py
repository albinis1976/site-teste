"""
=============================================================
  AGENT 06 — END-TO-END TESTING AGENT
=============================================================
Purpose : Orchestrates a full E2E flow test using live HTTP calls:
          1. Register a new user
          2. Login and obtain JWT
          3. List courses
          4. Check course access (should be denied before enrollment)
          5. Simulate enrollment via webhook (DB-level)
          6. Check course access again (should be granted)
          7. Access lesson (should be granted if enrolled)
          8. Cleanup all simulation data
Usage   : python scripts/agents/agent_06_e2e_testing.py
          (Ensure Django dev server is running: python manage.py runserver)
=============================================================
"""

import os
import sys
import json
import uuid
import requests
import time
from datetime import datetime

# ── Django env (needed for DB cleanup and webhook simulation) ─────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(os.path.dirname(SCRIPT_DIR))
sys.path.insert(0, BACKEND_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
import django
django.setup()

from django.contrib.auth.models import User
from courses.models import Course, Enrollment, Lesson
from payments.models import Payment

BASE_URL = "http://localhost:8000"

report = {
    "agent": "End-to-End Testing",
    "timestamp": datetime.now().isoformat(),
    "flow_steps": [],
    "sections": {}
}

def section(name):
    report["sections"][name] = {}
    return report["sections"][name]

def step(name, passed, details=None, note=None):
    entry = {"step": name, "passed": passed, "details": details or {}}
    if note:
        entry["note"] = note
    report["flow_steps"].append(entry)
    status = "✓ PASS" if passed else "✗ FAIL"
    print(f"  [{status}] {name}")
    return entry

def api(method, path, *, token=None, data=None):
    url = BASE_URL + path
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    try:
        r = getattr(requests, method)(url, json=data, headers=headers, timeout=10)
        return r
    except requests.exceptions.ConnectionError:
        return None

# ─────────────────────────────────────────────────────────────────────────────
# SETUP
# ─────────────────────────────────────────────────────────────────────────────
sim_id = uuid.uuid4().hex[:8]
sim_email = f"e2e_{sim_id}@test.simulation"
sim_username = f"e2e_{sim_id}"
sim_pass = "E2eTestPass99!"

print(f"\n{'='*60}")
print(f"  AGENT 06 — END-TO-END TESTING AGENT")
print(f"  Flow ID: {sim_id}")
print(f"{'='*60}\n")

setup_section = section("setup")
paid_course = Course.objects.filter(is_free=False, is_published=True, price__gt=0).first()
paid_lesson = Lesson.objects.filter(course=paid_course, is_free=False, is_preview=False).first() if paid_course else None
setup_section["paid_course"] = paid_course.title if paid_course else None
setup_section["paid_lesson"] = paid_lesson.id if paid_lesson else None
setup_section["sim_email"] = sim_email
server_up = api("get", "/") is not None
setup_section["server_reachable"] = server_up

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1: REGISTER NEW USER
# ─────────────────────────────────────────────────────────────────────────────
token = None
if server_up:
    r = api("post", "/api/accounts/register/", data={
        "username": sim_username,
        "email": sim_email,
        "password": sim_pass,
        "full_name": "E2E Test User"
    })
    passed = r is not None and r.status_code == 201
    step("1. Register new user", passed,
         details={"status_code": r.status_code if r else None,
                  "email": sim_email})

    # ─────────────────────────────────────────────────────────────────────────
    # STEP 2: LOGIN AND GET TOKEN
    # ─────────────────────────────────────────────────────────────────────────
    time.sleep(1)
    r2 = api("post", "/api/accounts/login/", data={"username": sim_email, "password": sim_pass})
    login_passed = r2 is not None and r2.status_code == 200
    if login_passed:
        try:
            token = r2.json().get("access")
        except Exception:
            login_passed = False
    step("2. Login and obtain JWT token", login_passed,
         details={"status_code": r2.status_code if r2 else None, "token_obtained": token is not None})

    # ─────────────────────────────────────────────────────────────────────────
    # STEP 3: LIST COURSES
    # ─────────────────────────────────────────────────────────────────────────
    r3 = api("get", "/api/courses/")
    courses_passed = r3 is not None and r3.status_code == 200
    course_count = 0
    if courses_passed:
        try:
            course_count = len(r3.json())
        except Exception:
            pass
    step("3. List all published courses", courses_passed,
         details={"status_code": r3.status_code if r3 else None, "course_count": course_count})

    # ─────────────────────────────────────────────────────────────────────────
    # STEP 4: CHECK COURSE ACCESS (before enrollment → should be False)
    # ─────────────────────────────────────────────────────────────────────────
    if paid_course and token:
        r4 = api("get", f"/api/courses/{paid_course.id}/access/", token=token)
        if r4 and r4.status_code == 200:
            has_access = r4.json().get("has_access", True)
            passed4 = has_access is False
            step("4. Verify access DENIED before enrollment", passed4,
                 details={"course": paid_course.title, "has_access": has_access,
                           "expected": False, "status_code": r4.status_code})
        else:
            step("4. Verify access DENIED before enrollment", False,
                 details={"status_code": r4.status_code if r4 else None, "error": "Unexpected response"})
    else:
        step("4. Verify access DENIED before enrollment", None,
             details={}, note="SKIP — No paid course or no token")

    # ─────────────────────────────────────────────────────────────────────────
    # STEP 5: MY ENROLLMENTS (should be empty)
    # ─────────────────────────────────────────────────────────────────────────
    if token:
        r5 = api("get", "/api/courses/enrollments/", token=token)
        pers_passed = r5 is not None and r5.status_code == 200
        enrollment_count = 0
        if pers_passed:
            try:
                enrollment_count = len(r5.json())
            except Exception:
                pass
        step("5. My enrollments (empty before payment)", pers_passed and enrollment_count == 0,
             details={"enrollment_count": enrollment_count, "expected": 0})
    else:
        step("5. My enrollments check", None, note="SKIP — No token")

    # ─────────────────────────────────────────────────────────────────────────
    # STEP 6: SIMULATE WEBHOOK (activate enrollment at DB level)
    # ─────────────────────────────────────────────────────────────────────────
    sim_user = User.objects.filter(email=sim_email).first()
    if sim_user and paid_course:
        enrollment, created = Enrollment.objects.update_or_create(
            user=sim_user,
            course=paid_course,
            defaults={"is_active": True}
        )
        Payment.objects.create(
            user=sim_user,
            course=paid_course,
            stripe_session_id=f"cs_e2e_{sim_id}",
            amount=paid_course.price,
            status="paid"
        )
        step("6. Simulate webhook → enrollment activated", enrollment.is_active,
             details={"enrollment_id": enrollment.id, "is_active": enrollment.is_active,
                       "was_newly_created": created})
    else:
        step("6. Simulate webhook → enrollment activated", None,
             note="SKIP — User or course not found in DB")

    # ─────────────────────────────────────────────────────────────────────────
    # STEP 7: CHECK COURSE ACCESS (after enrollment → should be True)
    # ─────────────────────────────────────────────────────────────────────────
    if paid_course and token and sim_user:
        r7 = api("get", f"/api/courses/{paid_course.id}/access/", token=token)
        if r7 and r7.status_code == 200:
            has_access = r7.json().get("has_access", False)
            step("7. Verify access GRANTED after enrollment", has_access is True,
                 details={"course": paid_course.title, "has_access": has_access, "expected": True})
        else:
            step("7. Verify access GRANTED after enrollment", False,
                 details={"status_code": r7.status_code if r7 else None})
    else:
        step("7. Verify access GRANTED after enrollment", None, note="SKIP")

    # ─────────────────────────────────────────────────────────────────────────
    # STEP 8: LESSON ACCESS (for enrolled user)
    # ─────────────────────────────────────────────────────────────────────────
    if paid_lesson and token:
        r8 = api("get", f"/api/courses/lessons/{paid_lesson.id}/", token=token)
        lesson_passed = r8 is not None and r8.status_code == 200
        step("8. Access paid lesson (enrolled user)", lesson_passed,
             details={"lesson_id": paid_lesson.id, "status_code": r8.status_code if r8 else None})
    else:
        step("8. Access paid lesson (enrolled user)", None, note="SKIP — No paid lesson or token")

    # ─────────────────────────────────────────────────────────────────────────
    # STEP 9: MY ENROLLMENTS (should now show 1 active enrollment)
    # ─────────────────────────────────────────────────────────────────────────
    if token:
        r9 = api("get", "/api/courses/enrollments/", token=token)
        if r9 and r9.status_code == 200:
            try:
                enrollments = r9.json()
                count = len(enrollments)
                has_active = any(e.get("is_active") for e in enrollments)
                step("9. My enrollments shows active enrollment", count >= 1 and has_active,
                     details={"count": count, "has_active": has_active})
            except Exception:
                step("9. My enrollments shows active enrollment", False,
                     details={"error": "Could not parse response"})
        else:
            step("9. My enrollments shows active enrollment", False,
                 details={"status_code": r9.status_code if r9 else None})
    else:
        step("9. My enrollments shows active enrollment", None, note="SKIP — No token")

else:
    step("ALL STEPS", False, details={},
         note="Server is not reachable. Start with: python manage.py runserver")

# ─────────────────────────────────────────────────────────────────────────────
# CLEANUP
# ─────────────────────────────────────────────────────────────────────────────
cleanup_section = section("cleanup")
try:
    sim_user = User.objects.filter(email=sim_email).first()
    if sim_user:
        if paid_course:
            Enrollment.objects.filter(user=sim_user, course=paid_course).delete()
            Payment.objects.filter(user=sim_user, course=paid_course).delete()
        sim_user.delete()
        cleanup_section["user_deleted"] = True
    cleanup_section["status"] = "OK"
except Exception as e:
    cleanup_section["status"] = "ERROR"
    cleanup_section["error"] = str(e)

# ─────────────────────────────────────────────────────────────────────────────
# OVERALL VERDICT
# ─────────────────────────────────────────────────────────────────────────────
real_steps = [s for s in report["flow_steps"] if s["passed"] is not None]
failed_steps = [s for s in real_steps if s["passed"] is False]
passed_steps = [s for s in real_steps if s["passed"] is True]

report["summary"] = {
    "total_steps": len(report["flow_steps"]),
    "executed": len(real_steps),
    "passed": len(passed_steps),
    "failed": len(failed_steps),
    "skipped": len(report["flow_steps"]) - len(real_steps),
}
report["overall_status"] = "PASS" if not failed_steps else "FAIL"
if not server_up:
    report["overall_status"] = "CRITICAL"

# ─────────────────────────────────────────────────────────────────────────────
# OUTPUT
# ─────────────────────────────────────────────────────────────────────────────
reports_dir = os.path.join(SCRIPT_DIR, "reports")
os.makedirs(reports_dir, exist_ok=True)
output_path = os.path.join(reports_dir, "report_06_e2e_testing.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2, default=str)

print(f"\n{'='*60}")
print(f"  Summary: {len(passed_steps)} passed, {len(failed_steps)} failed, "
      f"{len(report['flow_steps']) - len(real_steps)} skipped")
print(f"  Overall: {report['overall_status']}")
print(f"{'='*60}\n")
print(f"[Agent 06] Report saved → {output_path}")
