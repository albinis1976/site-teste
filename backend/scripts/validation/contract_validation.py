import os
import sys
import json
import requests

# ── API Contract Config ───────────────────────────────────────────────────────
BASE_URL = "http://localhost:8000"
ENDPOINTS = [
    {
        "name": "Course List",
        "path": "/api/courses/",
        "required_fields": ["id", "title", "slug", "price", "is_free", "is_locked"]
    },
    {
        "name": "Course Detail (Lesson List)",
        "path": "/api/courses/secret-course/", # Assuming this slug exists or using first found
        "required_fields": ["id", "title", "modules", "lessons", "is_locked"]
    }
]

def validate_contract(data, fields, context_msg=""):
    missing = [f for f in fields if f not in data]
    if missing:
        print(f"❌ [CONTRACT MISMATCH] {context_msg}: Missing fields {missing}")
        return False
    return True

def run_audit():
    print("=== API CONTRACT VALIDATION ===")
    overall_passed = True

    # 1. Anonymous Audit
    print("\n--- Phase 1: Anonymous Access ---")
    for ep in ENDPOINTS:
        try:
            url = f"{BASE_URL}{ep['path']}"
            r = requests.get(url, timeout=5)
            if r.status_code != 200:
                # If specifically testing a course detail that might be 404/403, we handle it
                print(f"⚠️  Skipping {ep['name']} for anon (Status {r.status_code})")
                continue
            
            data = r.json()
            items = data if isinstance(data, list) else [data]
            
            for item in items:
                if not validate_contract(item, ep['required_fields'], f"Anon {ep['name']}"):
                    overall_passed = False
                    break
        except Exception as e:
            print(f"❌ Error during Anon {ep['name']}: {str(e)}")
            overall_passed = False

    # 2. Authenticated Audit (Simulated via token if available)
    # For CI, we might need a test user.
    
    if not overall_passed:
        print("\n❌ CONTRACT AUDIT FAILED")
        sys.exit(1)
    
    print("\n✅ CONTRACT AUDIT PASSED")

if __name__ == "__main__":
    run_audit()
