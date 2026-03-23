"""
=============================================================
  MASTER RUNNER — RUN ALL AGENTS
=============================================================
Purpose : Runs all 7 specialized agents sequentially, collects
          their reports, and produces a consolidated summary.
Usage   : python scripts/agents/run_all_agents.py
          (Run from django_backend/ directory with venv active)
          
          Optional: pass test credentials for live API tests:
          python scripts/agents/run_all_agents.py user@test.com password123
=============================================================
"""

import os
import sys
import json
import subprocess
import time
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(os.path.dirname(SCRIPT_DIR))
REPORTS_DIR = os.path.join(SCRIPT_DIR, "reports")

# ── Python executable (use same venv) ────────────────────────────────────────
PYTHON = sys.executable

# ── Agents list ───────────────────────────────────────────────────────────────
AGENTS = [
    {
        "id": "01",
        "name": "Backend Auditor",
        "script": os.path.join(SCRIPT_DIR, "agent_01_backend_auditor.py"),
        "report": "report_01_backend_auditor.json",
        "requires_server": False,
        "args": [],
    },
    {
        "id": "02",
        "name": "Frontend Auditor",
        "script": os.path.join(SCRIPT_DIR, "agent_02_frontend_auditor.py"),
        "report": "report_02_frontend_auditor.json",
        "requires_server": False,
        "args": [],
    },
    {
        "id": "03",
        "name": "API Integration",
        "script": os.path.join(SCRIPT_DIR, "agent_03_api_integration.py"),
        "report": "report_03_api_integration.json",
        "requires_server": True,
        "args": sys.argv[1:3] if len(sys.argv) >= 3 else [],  # email, password
    },
    {
        "id": "04",
        "name": "Access Control",
        "script": os.path.join(SCRIPT_DIR, "agent_04_access_control.py"),
        "report": "report_04_access_control.json",
        "requires_server": False,
        "args": [],
    },
    {
        "id": "05",
        "name": "Payment Simulation",
        "script": os.path.join(SCRIPT_DIR, "agent_05_payment_simulation.py"),
        "report": "report_05_payment_simulation.json",
        "requires_server": False,
        "args": [],
    },
    {
        "id": "06",
        "name": "End-to-End Testing",
        "script": os.path.join(SCRIPT_DIR, "agent_06_e2e_testing.py"),
        "report": "report_06_e2e_testing.json",
        "requires_server": True,
        "args": [],
    },
    {
        "id": "07",
        "name": "Security & Integrity",
        "script": os.path.join(SCRIPT_DIR, "agent_07_security_integrity.py"),
        "report": "report_07_security_integrity.json",
        "requires_server": False,
        "args": [],
    },
]

os.makedirs(REPORTS_DIR, exist_ok=True)

# ── Subprocess environment with UTF-8 encoding for Windows ────────────────────
import copy as _copy
_env = _copy.copy(os.environ)
_env["PYTHONIOENCODING"] = "utf-8"

# ─────────────────────────────────────────────────────────────────────────────
# RUN EACH AGENT
# ─────────────────────────────────────────────────────────────────────────────
results = []
print(f"\n{'='*60}")
print(f"  MASTER AGENT RUNNER")
print(f"  Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"  Working dir: {BACKEND_DIR}")
print(f"{'='*60}\n")

for agent in AGENTS:
    print(f"\n{'─'*60}")
    print(f"  Running Agent {agent['id']}: {agent['name']}")
    print(f"{'─'*60}")
    
    t_start = time.time()
    cmd = [PYTHON, agent["script"]] + agent["args"]
    try:
        proc = subprocess.run(
            cmd,
            cwd=BACKEND_DIR,
            capture_output=True,
            text=True,
            timeout=120,
            env=_env,
        )
        t_elapsed = round(time.time() - t_start, 2)
        
        if proc.stdout:
            # Show last 30 lines to avoid flooding the console
            lines = proc.stdout.strip().splitlines()
            for line in lines[-30:]:
                print(f"  {line}")
        if proc.stderr:
            error_lines = proc.stderr.strip().splitlines()[-10:]
            for line in error_lines:
                print(f"  [stderr] {line}")
        
        # Read the saved JSON report
        report_path = os.path.join(REPORTS_DIR, agent["report"])
        agent_status = "UNKNOWN"
        if os.path.isfile(report_path):
            try:
                rdata = json.load(open(report_path, encoding="utf-8"))
                agent_status = rdata.get("overall_status", "UNKNOWN")
            except Exception:
                agent_status = "PARSE_ERROR"
        
        results.append({
            "agent_id": agent["id"],
            "agent_name": agent["name"],
            "status": agent_status,
            "exit_code": proc.returncode,
            "elapsed_seconds": t_elapsed,
            "report_file": agent["report"],
            "error": proc.stderr[-500:] if proc.returncode != 0 else None,
        })
        print(f"\n  ► Agent {agent['id']} completed: {agent_status} ({t_elapsed}s)")
    
    except subprocess.TimeoutExpired:
        results.append({
            "agent_id": agent["id"],
            "agent_name": agent["name"],
            "status": "TIMEOUT",
            "exit_code": -1,
            "elapsed_seconds": 120,
            "report_file": agent["report"],
            "error": "Agent timed out after 120 seconds",
        })
        print(f"\n  ► Agent {agent['id']} TIMED OUT")
    except Exception as e:
        results.append({
            "agent_id": agent["id"],
            "agent_name": agent["name"],
            "status": "ERROR",
            "exit_code": -1,
            "elapsed_seconds": 0,
            "report_file": agent["report"],
            "error": str(e),
        })
        print(f"\n  ► Agent {agent['id']} ERROR: {e}")

# ─────────────────────────────────────────────────────────────────────────────
# CONSOLIDATED REPORT
# ─────────────────────────────────────────────────────────────────────────────
statuses = [r["status"] for r in results]
if "CRITICAL" in statuses:
    master_status = "CRITICAL"
elif any(s in statuses for s in ("FAIL", "ERROR", "TIMEOUT")):
    master_status = "FAIL"
elif "WARN" in statuses:
    master_status = "WARN"
else:
    master_status = "PASS"

consolidated = {
    "master_runner": "All Agents",
    "timestamp": datetime.now().isoformat(),
    "overall_status": master_status,
    "agents": results,
    "summary": {
        "pass": statuses.count("PASS"),
        "warn": statuses.count("WARN"),
        "fail": statuses.count("FAIL"),
        "critical": statuses.count("CRITICAL"),
        "error": statuses.count("ERROR"),
        "timeout": statuses.count("TIMEOUT"),
        "skip": statuses.count("SKIP"),
    }
}

consolidated_path = os.path.join(REPORTS_DIR, "report_CONSOLIDATED.json")
with open(consolidated_path, "w", encoding="utf-8") as f:
    json.dump(consolidated, f, indent=2, default=str)

# ─────────────────────────────────────────────────────────────────────────────
# FINAL SUMMARY TABLE
# ─────────────────────────────────────────────────────────────────────────────
print(f"\n\n{'='*60}")
print(f"  FINAL RESULTS SUMMARY")
print(f"{'='*60}")
print(f"  {'AGENT':<30} {'STATUS':<12} {'TIME':>6}")
print(f"  {'─'*50}")
for r in results:
    icon = {"PASS": "[OK]", "WARN": "[WN]", "FAIL": "[FL]", "CRITICAL": "[!!]",
            "ERROR": "[ER]", "TIMEOUT": "[TO]", "SKIP": "[SK]", "UNKNOWN": "[??]"}.get(r["status"], "[??]")
    print(f"  {icon} [{r['agent_id']}] {r['agent_name']:<26} {r['status']:<12} {r['elapsed_seconds']:>5}s")

print(f"\n  Overall System Status: {master_status}")
print(f"  Consolidated report: {consolidated_path}")
print(f"{'='*60}\n")
