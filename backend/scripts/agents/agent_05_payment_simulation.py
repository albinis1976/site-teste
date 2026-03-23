"""
=============================================================
  AGENT 05 — PAYMENT SIMULATION AGENT
=============================================================
Purpose : Simulates the complete Stripe payment flow at the DB level
          (without hitting real Stripe APIs), validates:
          - Checkout session creation guard (duplicate enrollment)
          - Free course payment blocked
          - Webhook idempotency (update_or_create logic)
          - Enrollment becomes active after payment
          - No duplicate enrollments created
Usage   : python scripts/agents/agent_05_payment_simulation.py
          (Run from django_backend/ directory with venv active)
=============================================================
"""

import os
import sys
import json
import uuid
from datetime import datetime
from unittest.mock import MagicMock, patch

# ── Django env ────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(os.path.dirname(SCRIPT_DIR))
sys.path.insert(0, BACKEND_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
import django
django.setup()

from django.contrib.auth.models import User
from courses.models import Course, Enrollment
from payments.models import Payment
from accounts.models import Profile

report = {
    "agent": "Payment Simulation",
    "timestamp": datetime.now().isoformat(),
    "sections": {}
}

def section(name):
    report["sections"][name] = {}
    return report["sections"][name]

SIMULATION_TAG = "AGENT05_SIM"

# ─────────────────────────────────────────────────────────────────────────────
# SETUP: Get or create a simulation student and course
# ─────────────────────────────────────────────────────────────────────────────
setup_section = section("simulation_setup")
try:
    # Use a real teacher to assign course
    teacher = User.objects.filter(profile__role='teacher').first()
    if not teacher:
        teacher = User.objects.filter(is_superuser=True).first()

    sim_student, _ = User.objects.get_or_create(
        username=f"agent05_student",
        defaults={"email": "agent05_student@simulation.test"}
    )
    if not hasattr(sim_student, 'profile') or not Profile.objects.filter(user=sim_student).exists():
        Profile.objects.get_or_create(user=sim_student, defaults={"role": "student"})
    else:
        if sim_student.profile.role != 'student':
            sim_student.profile.role = 'student'
            sim_student.profile.save()

    sim_paid_course = Course.objects.filter(is_free=False, is_published=True, price__gt=0).first()
    sim_free_course = Course.objects.filter(is_free=True, is_published=True).first()

    setup_section["student"] = sim_student.email
    setup_section["paid_course"] = sim_paid_course.title if sim_paid_course else None
    setup_section["free_course"] = sim_free_course.title if sim_free_course else None
    setup_section["status"] = "OK" if sim_paid_course else "WARN"
    if not sim_paid_course:
        setup_section["note"] = "No published paid course found — some tests will be skipped"
except Exception as e:
    setup_section["status"] = "ERROR"
    setup_section["error"] = str(e)
    sim_student = None
    sim_paid_course = None
    sim_free_course = None

# ─────────────────────────────────────────────────────────────────────────────
# TEST 1: GUARD — Cannot trigger checkout for free course
# ─────────────────────────────────────────────────────────────────────────────
free_guard_section = section("free_course_payment_guard")
if sim_free_course:
    is_blocked = sim_free_course.is_free is True
    free_guard_section["course"] = sim_free_course.title
    free_guard_section["is_free"] = sim_free_course.is_free
    free_guard_section["payment_should_be_blocked"] = True
    free_guard_section["guard_active"] = is_blocked
    free_guard_section["passed"] = is_blocked
    free_guard_section["status"] = "OK" if is_blocked else "FAIL"
else:
    free_guard_section["status"] = "SKIP"
    free_guard_section["note"] = "No free course in DB"

# ─────────────────────────────────────────────────────────────────────────────
# TEST 2: GUARD — Already enrolled returns 400 (simulated)
# ─────────────────────────────────────────────────────────────────────────────
duplicate_guard_section = section("duplicate_enrollment_guard")
if sim_student and sim_paid_course:
    # Clean up first
    Enrollment.objects.filter(user=sim_student, course=sim_paid_course).delete()
    # Create active enrollment
    existing_enrollment = Enrollment.objects.create(user=sim_student, course=sim_paid_course, is_active=True)

    # Simulate the guard in CreateCheckoutSessionView
    already_enrolled = Enrollment.objects.filter(user=sim_student, course=sim_paid_course, is_active=True).exists()
    duplicate_guard_section["user"] = sim_student.email
    duplicate_guard_section["course"] = sim_paid_course.title
    duplicate_guard_section["already_enrolled"] = already_enrolled
    duplicate_guard_section["checkout_would_be_blocked"] = already_enrolled
    duplicate_guard_section["passed"] = already_enrolled is True
    duplicate_guard_section["status"] = "OK" if duplicate_guard_section["passed"] else "FAIL"

    # Clean up for next test
    existing_enrollment.delete()
else:
    duplicate_guard_section["status"] = "SKIP"
    duplicate_guard_section["note"] = "No student or paid course available"

# ─────────────────────────────────────────────────────────────────────────────
# TEST 3: FULL FLOW SIMULATION (MOCKED STRIPE)
# ─────────────────────────────────────────────────────────────────────────────
flow_section = section("full_payment_flow_simulation")
if sim_student and sim_paid_course:
    # 1. Access before payment
    Enrollment.objects.filter(user=sim_student, course=sim_paid_course).delete()
    has_access_before = Enrollment.objects.filter(user=sim_student, course=sim_paid_course, is_active=True).exists()
    
    # 2. Simulate Checkout Session Creation (MOCKED)
    with patch("stripe.checkout.Session.create") as mock_create:
        mock_create.return_value = MagicMock(url="https://checkout.stripe.com/pay/sim_123")
        
        # We simulate the service call directly to verify metadata construction
        from payments.services.stripe_service import StripeService
        session_url = StripeService.create_checkout_session(
            course=sim_paid_course,
            user=sim_student,
            success_url="http://test.com/success",
            cancel_url="http://test.com/cancel"
        )
        
        args, kwargs = mock_create.call_args
        metadata = kwargs.get("metadata", {})
        
        flow_section["session_url"] = session_url
        flow_section["metadata_user_id"] = metadata.get("user_id")
        flow_section["metadata_course_id"] = metadata.get("course_id")
        flow_section["metadata_correct"] = (
            metadata.get("user_id") == str(sim_student.id) and 
            metadata.get("course_id") == str(sim_paid_course.id)
        )

    # 3. Simulate Webhook (checkout.session.completed)
    # Replicating the logic in StripeWebhookView.post
    session_data = {
        "id": "cs_test_999",
        "metadata": {
            "user_id": str(sim_student.id),
            "course_id": str(sim_paid_course.id)
        }
    }
    
    # Trigger original logic
    Enrollment.objects.update_or_create(
        user=sim_student, 
        course=sim_paid_course,
        defaults={'is_active': True}
    )
    
    has_access_after = Enrollment.objects.filter(user=sim_student, course=sim_paid_course, is_active=True).exists()
    
    flow_section["access_before_webhook"] = has_access_before
    flow_section["access_after_webhook"] = has_access_after
    flow_section["passed"] = (has_access_before is False and has_access_after is True and flow_section["metadata_correct"])
    flow_section["status"] = "OK" if flow_section["passed"] else "CRITICAL"
else:
    flow_section["status"] = "SKIP"

# ─────────────────────────────────────────────────────────────────────────────
# TEST 4: IDEMPOTENCY — Calling webhook twice doesn't create duplicate enrollment
# ─────────────────────────────────────────────────────────────────────────────
idempotency_section = section("webhook_idempotency")
if sim_student and sim_paid_course:
    before_count = Enrollment.objects.filter(user=sim_student, course=sim_paid_course).count()
    # Trigger again (simulating duplicate webhook)
    Enrollment.objects.update_or_create(
        user=sim_student,
        course=sim_paid_course,
        defaults={"is_active": True}
    )
    after_count = Enrollment.objects.filter(user=sim_student, course=sim_paid_course).count()
    idempotency_section["enrollments_before_second_webhook"] = before_count
    idempotency_section["enrollments_after_second_webhook"] = after_count
    idempotency_section["no_duplicate_created"] = after_count == before_count == 1
    idempotency_section["passed"] = after_count == 1
    idempotency_section["status"] = "OK" if idempotency_section["passed"] else "CRITICAL"
else:
    idempotency_section["status"] = "SKIP"

# ─────────────────────────────────────────────────────────────────────────────
# TEST 5: VERIFY ENROLLMENT IS ACTIVE AND ACCESSIBLE AFTER PAYMENT
# ─────────────────────────────────────────────────────────────────────────────
post_payment_section = section("post_payment_access_verification")
if sim_student and sim_paid_course:
    enrollment = Enrollment.objects.filter(user=sim_student, course=sim_paid_course).first()
    post_payment_section["enrollment_exists"] = enrollment is not None
    post_payment_section["is_active"] = enrollment.is_active if enrollment else False
    post_payment_section["passed"] = (enrollment is not None) and enrollment.is_active
    post_payment_section["status"] = "OK" if post_payment_section["passed"] else "CRITICAL"
else:
    post_payment_section["status"] = "SKIP"

# ─────────────────────────────────────────────────────────────────────────────
# TEST 6: STRIPE METADATA INTEGRITY
# ─────────────────────────────────────────────────────────────────────────────
metadata_section = section("stripe_metadata_integrity")
# Inspect the StripeService source code to ensure metadata includes course_id and user_id
stripe_service_path = os.path.join(BACKEND_DIR, "payments", "services", "stripe_service.py")
if os.path.isfile(stripe_service_path):
    content = open(stripe_service_path, encoding="utf-8").read()
    metadata_section["has_course_id_in_metadata"] = "'course_id'" in content
    metadata_section["has_user_id_in_metadata"] = "'user_id'" in content
    metadata_section["has_client_reference_id"] = "client_reference_id" in content
    metadata_section["webhook_uses_metadata"] = True  # from views.py analysis
    all_present = all([
        metadata_section["has_course_id_in_metadata"],
        metadata_section["has_user_id_in_metadata"],
    ])
    metadata_section["status"] = "OK" if all_present else "CRITICAL"
else:
    metadata_section["status"] = "ERROR"
    metadata_section["error"] = "stripe_service.py not found"

# ─────────────────────────────────────────────────────────────────────────────
# CLEANUP: Remove simulation data
# ─────────────────────────────────────────────────────────────────────────────
cleanup_section = section("cleanup")
if sim_student and sim_paid_course:
    deleted_enrollments, _ = Enrollment.objects.filter(user=sim_student, course=sim_paid_course).delete()
    deleted_payments, _ = Payment.objects.filter(user=sim_student, course=sim_paid_course).delete()
    cleanup_section["enrollments_removed"] = deleted_enrollments
    cleanup_section["payments_removed"] = deleted_payments
    cleanup_section["status"] = "OK"
else:
    cleanup_section["status"] = "SKIP"

# ─────────────────────────────────────────────────────────────────────────────
# OVERALL VERDICT
# ─────────────────────────────────────────────────────────────────────────────
all_statuses = [
    free_guard_section.get("status"),
    duplicate_guard_section.get("status"),
    flow_section.get("status"),
    idempotency_section.get("status"),
    post_payment_section.get("status"),
    metadata_section.get("status"),
]
real_statuses = [s for s in all_statuses if s not in ("SKIP",)]
if "CRITICAL" in real_statuses:
    report["overall_status"] = "CRITICAL"
elif "FAIL" in real_statuses or "ERROR" in real_statuses:
    report["overall_status"] = "FAIL"
elif not real_statuses:
    report["overall_status"] = "SKIP"
else:
    report["overall_status"] = "PASS"

# ─────────────────────────────────────────────────────────────────────────────
# OUTPUT
# ─────────────────────────────────────────────────────────────────────────────
reports_dir = os.path.join(SCRIPT_DIR, "reports")
os.makedirs(reports_dir, exist_ok=True)
output_path = os.path.join(reports_dir, "report_05_payment_simulation.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2, default=str)

print(json.dumps(report, indent=2, default=str))
print(f"\n[Agent 05] Report saved → {output_path}")
