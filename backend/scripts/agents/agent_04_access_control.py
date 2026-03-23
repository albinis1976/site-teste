"""
=============================================================
  AGENT 04 — ACCESS CONTROL AGENT
=============================================================
Purpose : Validates the access control logic for courses and lessons:
          - Free vs paid course access
          - Active vs inactive enrollment gating
          - Role-based access (student / teacher / admin / superuser)
          - Preview/free lesson access without enrollment
          - Unauthorized users blocked on paid content
Usage   : python scripts/agents/agent_04_access_control.py
          (Run from django_backend/ directory with venv active)
=============================================================
"""

import os
import sys
import json
from datetime import datetime

# ── Django env ────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(os.path.dirname(SCRIPT_DIR))
sys.path.insert(0, BACKEND_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
import django
django.setup()

from django.contrib.auth.models import User, AnonymousUser
from courses.models import Course, Lesson, Enrollment, Module
from accounts.models import Profile

report = {
    "agent": "Access Control",
    "timestamp": datetime.now().isoformat(),
    "sections": {}
}

def section(name):
    report["sections"][name] = {}
    return report["sections"][name]

# ─────────────────────────────────────────────────────────────────────────────
# HELPER: simulate LessonDetailView access logic
# ─────────────────────────────────────────────────────────────────────────────
def check_lesson_access(user, lesson):
    """Replicates the exact access logic from courses/views.py LessonDetailView"""
    
    # Simulate AnonymousUser check (None or AnonymousUser object)
    is_anon = user is None or not user.is_authenticated
    
    has_access = False
    
    # 1. Preview ou Curso Gratuito
    if getattr(lesson, 'is_free', False) or getattr(lesson, 'is_preview', False):
        has_access = True
    elif getattr(lesson.course, 'is_free', False):
        has_access = True
    
    # Stop here if we're only checking "Public" access first
    if has_access:
        return True

    # Anonymous users cannot access paid content
    if is_anon:
        return False

    # 2. Superuser, Staff ou Admin/Professor
    if user.is_superuser or user.is_staff:
        has_access = True
    elif hasattr(user, 'profile'):
        if user.profile.role == 'admin':
            has_access = True
        elif user.profile.role == 'teacher' and lesson.course.teacher == user:
            has_access = True

    if not has_access:
        if Enrollment.objects.filter(user=user, course=lesson.course, is_active=True).exists():
            has_access = True

    return has_access

def check_course_access(user, course):
    """Replicates the exact access logic from courses/views.py CourseAccessView"""
    is_anon = user is None or not user.is_authenticated
    
    if not is_anon:
        if user.is_superuser or user.is_staff:
            return True
        if hasattr(user, 'profile'):
            if user.profile.role == 'admin':
                return True
            if user.profile.role == 'teacher' and course.teacher == user:
                return True
                
    if getattr(course, 'is_free', False):
        return True
        
    if not is_anon:
        if Enrollment.objects.filter(user=user, course=course, is_active=True).exists():
            return True
            
    return False

# ─────────────────────────────────────────────────────────────────────────────
# 1. DATA SNAPSHOT
# ─────────────────────────────────────────────────────────────────────────────
data_section = section("data_snapshot")
free_courses = list(Course.objects.filter(is_free=True, is_published=True))
paid_courses = list(Course.objects.filter(is_free=False, is_published=True))
free_lessons = list(Lesson.objects.filter(is_free=True)[:5])
preview_lessons = list(Lesson.objects.filter(is_preview=True)[:5])
paid_lessons = list(Lesson.objects.filter(is_free=False, is_preview=False)[:5])
students = list(User.objects.filter(profile__role='student', is_superuser=False, is_staff=False)[:3])
teachers = list(User.objects.filter(profile__role='teacher')[:2])
admins = list(User.objects.filter(profile__role='admin')[:1])
superusers = list(User.objects.filter(is_superuser=True)[:1])

data_section["free_courses"] = len(free_courses)
data_section["paid_courses"] = len(paid_courses)
data_section["free_lessons"] = len(free_lessons)
data_section["preview_lessons"] = len(preview_lessons)
data_section["paid_lessons"] = len(paid_lessons)
data_section["students_available"] = len(students)
data_section["teachers_available"] = len(teachers)
data_section["admins_available"] = len(admins)
data_section["superusers_available"] = len(superusers)

# ─────────────────────────────────────────────────────────────────────────────
# 2. ANONYMOUS ACCESS (Rule: Free Course -> Allow Access)
# ─────────────────────────────────────────────────────────────────────────────
anon_section = section("anonymous_access")
anon_tests = []
anon_user = AnonymousUser()

for course in Course.objects.filter(is_published=True)[:5]:
    lessons = Lesson.objects.filter(course=course)[:2]
    for lesson in lessons:
        has_access = check_lesson_access(anon_user, lesson)
        expected = course.is_free or lesson.is_free or lesson.is_preview
        anon_tests.append({
            "course": course.title,
            "course_is_free": course.is_free,
            "lesson": lesson.title,
            "lesson_is_free": lesson.is_free,
            "has_access": has_access,
            "expected": expected,
            "passed": has_access == expected
        })

anon_section["tests"] = anon_tests
anon_section["passed"] = sum(1 for t in anon_tests if t["passed"])
anon_section["failed"] = sum(1 for t in anon_tests if not t["passed"])
anon_section["status"] = "OK" if anon_section["failed"] == 0 else "FAIL"


# ─────────────────────────────────────────────────────────────────────────────
# 3. FREE LESSON ACCESS (already handles logged users)
# ─────────────────────────────────────────────────────────────────────────────
free_lesson_section = section("free_and_preview_lesson_access")
free_lesson_tests = []

test_users = students[:1] + teachers[:1] + admins[:1]
for lesson in free_lessons[:3]:
    for user in test_users:
        has_access = check_lesson_access(user, lesson)
        free_lesson_tests.append({
            "lesson_id": lesson.id,
            "lesson_title": lesson.title,
            "is_free": lesson.is_free,
            "is_preview": lesson.is_preview,
            "user": user.email,
            "role": user.profile.role,
            "has_access": has_access,
            "passed": has_access is True,
        })

for lesson in preview_lessons[:3]:
    for user in students[:1]:
        has_access = check_lesson_access(user, lesson)
        free_lesson_tests.append({
            "lesson_id": lesson.id,
            "lesson_title": lesson.title,
            "is_free": lesson.is_free,
            "is_preview": lesson.is_preview,
            "user": user.email,
            "role": "student",
            "has_access": has_access,
            "passed": has_access is True,
        })

free_lesson_section["tests"] = free_lesson_tests
free_lesson_section["passed"] = sum(1 for t in free_lesson_tests if t["passed"])
free_lesson_section["failed"] = sum(1 for t in free_lesson_tests if not t["passed"])
free_lesson_section["status"] = "OK" if free_lesson_section["failed"] == 0 else "FAIL"
if not free_lesson_tests:
    free_lesson_section["status"] = "SKIP"
    free_lesson_section["note"] = "No free/preview lessons or test users found in DB"

# ─────────────────────────────────────────────────────────────────────────────
# 3. PAID LESSON — SHOULD BE BLOCKED WITHOUT ACTIVE ENROLLMENT
# ─────────────────────────────────────────────────────────────────────────────
paid_block_section = section("paid_lesson_blocking")
paid_block_tests = []

for lesson in paid_lessons[:5]:
    if lesson.course.is_free:
        continue
    for student in students[:2]:
        # Ensure no active enrollment
        has_enrollment = Enrollment.objects.filter(user=student, course=lesson.course, is_active=True).exists()
        if has_enrollment:
            paid_block_tests.append({
                "lesson_id": lesson.id,
                "user": student.email,
                "note": "SKIP — student has active enrollment (access expected)",
                "passed": None
            })
            continue
        has_access = check_lesson_access(student, lesson)
        paid_block_tests.append({
            "lesson_id": lesson.id,
            "lesson_title": lesson.title,
            "course_is_free": lesson.course.is_free,
            "lesson_is_free": lesson.is_free,
            "user": student.email,
            "has_active_enrollment": False,
            "has_access": has_access,
            "passed": has_access is False,  # should NOT have access
        })

paid_block_section["tests"] = paid_block_tests
paid_block_section["passed"] = sum(1 for t in paid_block_tests if t.get("passed") is True)
paid_block_section["failed"] = sum(1 for t in paid_block_tests if t.get("passed") is False)
paid_block_section["status"] = "OK" if paid_block_section["failed"] == 0 else "CRITICAL"
if not paid_block_tests:
    paid_block_section["status"] = "SKIP"
    paid_block_section["note"] = "No unenrolled paid lessons or test students found"

# ─────────────────────────────────────────────────────────────────────────────
# 4. ACTIVE ENROLLMENT GRANTS ACCESS
# ─────────────────────────────────────────────────────────────────────────────
enrolled_section = section("enrolled_student_access")
enrolled_tests = []

active_enrollments = Enrollment.objects.filter(is_active=True).select_related("user", "course")[:5]
for enrollment in active_enrollments:
    paid_lessons_for_course = Lesson.objects.filter(
        course=enrollment.course, is_free=False, is_preview=False)[:2]
    for lesson in paid_lessons_for_course:
        has_access = check_lesson_access(enrollment.user, lesson)
        enrolled_tests.append({
            "enrollment_id": enrollment.id,
            "user": enrollment.user.email,
            "course": enrollment.course.title,
            "lesson_id": lesson.id,
            "lesson_title": lesson.title,
            "has_access": has_access,
            "passed": has_access is True,
        })

enrolled_section["tests"] = enrolled_tests
enrolled_section["passed"] = sum(1 for t in enrolled_tests if t["passed"])
enrolled_section["failed"] = sum(1 for t in enrolled_tests if not t["passed"])
enrolled_section["status"] = "OK" if enrolled_section["failed"] == 0 else "CRITICAL"
if not enrolled_tests:
    enrolled_section["status"] = "SKIP"
    enrolled_section["note"] = "No active enrollments with paid lessons found"

# ─────────────────────────────────────────────────────────────────────────────
# 5. ROLE-BASED ACCESS
# ─────────────────────────────────────────────────────────────────────────────
role_section = section("role_based_access")
role_tests = []

if paid_courses and paid_lessons:
    course = paid_courses[0]
    lesson = Lesson.objects.filter(course=course, is_free=False).first()
    if lesson:
        for su in superusers:
            role_tests.append({"role": "superuser", "user": su.email, "course": course.title,
                                "course_access": check_course_access(su, course),
                                "lesson_access": check_lesson_access(su, lesson),
                                "expected": True,
                                "passed": check_course_access(su, course) and check_lesson_access(su, lesson)})
        for admin in admins:
            role_tests.append({"role": "admin", "user": admin.email,
                                "course_access": check_course_access(admin, course),
                                "lesson_access": check_lesson_access(admin, lesson),
                                "expected": True,
                                "passed": check_course_access(admin, course) and check_lesson_access(admin, lesson)})
        for teacher in teachers:
            # Teacher should access only their own course
            owns = course.teacher == teacher
            ca = check_course_access(teacher, course)
            la = check_lesson_access(teacher, lesson)
            expected_result = owns  # should access only if is the teacher
            role_tests.append({"role": "teacher", "user": teacher.email,
                                "owns_course": owns,
                                "course_access": ca, "lesson_access": la,
                                "expected": expected_result,
                                "passed": (ca == expected_result) and (la == expected_result)})

role_section["tests"] = role_tests
role_section["passed"] = sum(1 for t in role_tests if t["passed"])
role_section["failed"] = sum(1 for t in role_tests if not t["passed"])
role_section["status"] = "OK" if role_section["failed"] == 0 else "FAIL"
if not role_tests:
    role_section["status"] = "SKIP"
    role_section["note"] = "Insufficient users or courses to run role checks"

# ─────────────────────────────────────────────────────────────────────────────
# 6. INACTIVE ENROLLMENT SHOULD NOT GRANT ACCESS
# ─────────────────────────────────────────────────────────────────────────────
inactive_section = section("inactive_enrollment_blocking")
inactive_tests = []

inactive_enrollments = Enrollment.objects.filter(is_active=False).select_related("user", "course")[:5]
for enrollment in inactive_enrollments:
    paid_lessons_for_course = Lesson.objects.filter(
        course=enrollment.course, is_free=False, is_preview=False)[:2]
    for lesson in paid_lessons_for_course:
        has_access = check_lesson_access(enrollment.user, lesson)
        inactive_tests.append({
            "enrollment_id": enrollment.id,
            "user": enrollment.user.email,
            "course": enrollment.course.title,
            "lesson_id": lesson.id,
            "has_access": has_access,
            "passed": has_access is False,  # inactive enrollment = no access
        })

inactive_section["tests"] = inactive_tests
inactive_section["passed"] = sum(1 for t in inactive_tests if t["passed"])
inactive_section["failed"] = sum(1 for t in inactive_tests if not t["passed"])
inactive_section["status"] = "OK" if inactive_section["failed"] == 0 else "CRITICAL"
if not inactive_tests:
    inactive_section["status"] = "SKIP"
    inactive_section["note"] = "No inactive enrollments with paid lessons found"

# ─────────────────────────────────────────────────────────────────────────────
# 7. OVERALL VERDICT
# ─────────────────────────────────────────────────────────────────────────────
statuses = [
    free_lesson_section.get("status"),
    paid_block_section.get("status"),
    enrolled_section.get("status"),
    role_section.get("status"),
    inactive_section.get("status"),
]
real_statuses = [s for s in statuses if s not in ("SKIP", None)]
if "CRITICAL" in real_statuses:
    report["overall_status"] = "CRITICAL"
elif "FAIL" in real_statuses:
    report["overall_status"] = "FAIL"
elif not real_statuses:
    report["overall_status"] = "SKIP"
    report["note"] = "No data in DB to test — populate courses/users/lessons first"
else:
    report["overall_status"] = "PASS"

# ─────────────────────────────────────────────────────────────────────────────
# OUTPUT
# ─────────────────────────────────────────────────────────────────────────────
reports_dir = os.path.join(SCRIPT_DIR, "reports")
os.makedirs(reports_dir, exist_ok=True)
output_path = os.path.join(reports_dir, "report_04_access_control.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2, default=str)

print(json.dumps(report, indent=2, default=str))
print(f"\n[Agent 04] Report saved → {output_path}")
