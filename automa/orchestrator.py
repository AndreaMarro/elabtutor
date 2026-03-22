#!/usr/bin/env python3
"""
ELAB Automa — Orchestrator
The heart of the autonomous loop.
1. Runs 7 quick checks (~3 min)
2. Composes prompt with results + state + next task
3. Launches `claude -p` headless to WORK (max 25 min)
4. Saves report JSON + updates state.json
5. Manages daily token budget
6. Includes 1 micro-research per cycle
"""

import json
import os
import subprocess
import sys
import time
from datetime import datetime, date
from pathlib import Path

AUTOMA_ROOT = Path(__file__).parent
PROJECT_ROOT = AUTOMA_ROOT.parent
STATE_FILE = AUTOMA_ROOT / "state" / "state.json"
REPORTS_DIR = AUTOMA_ROOT / "reports"
HEARTBEAT_FILE = AUTOMA_ROOT / "state" / "heartbeat"

# Ensure dirs
REPORTS_DIR.mkdir(parents=True, exist_ok=True)
(AUTOMA_ROOT / "state").mkdir(parents=True, exist_ok=True)
(AUTOMA_ROOT / "logs").mkdir(parents=True, exist_ok=True)

# Import our modules
sys.path.insert(0, str(AUTOMA_ROOT))
from checks import run_all_checks, print_results
from queue_manager import get_next_task, claim_task, complete_task, fail_task, stats
from tools import search_papers, gulpease_index


def load_state() -> dict:
    """Load current state."""
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"loop": {"cycles_today": 0, "status": "not_started"}, "budget": {"spent_today_eur": 0}}


def save_state(state: dict):
    """Save updated state."""
    state["updated"] = datetime.now().isoformat()
    STATE_FILE.write_text(json.dumps(state, indent=2))


def write_heartbeat():
    """Write heartbeat for watchdog."""
    HEARTBEAT_FILE.write_text(datetime.now().isoformat())


def compose_prompt(check_results: list, task: dict | None, state: dict) -> str:
    """Compose the prompt for Claude Code headless."""
    # Check summary
    check_summary = "\n".join(
        f"  {'✅' if r['status']=='pass' else '❌' if r['status']=='fail' else '⚠️'} {r['name']}: {r['detail'][:100]}"
        for r in check_results
    )
    failed_checks = [r for r in check_results if r["status"] == "fail"]

    # Priority: fix failed checks FIRST, then work on task
    if failed_checks:
        work_section = f"""## PRIORITY: FIX FAILED CHECKS
The following checks FAILED. Fix them BEFORE working on any task.
{chr(10).join(f"- {r['name']}: {r['detail']}" for r in failed_checks)}

Fix these issues. Run `npm run build` after any code changes. Verify the fix works.
"""
    elif task:
        work_section = f"""## TASK: {task.get('title', 'Unknown')}
Priority: {task.get('priority', '?')}
Description: {task.get('description', 'No description')}
Tags: {task.get('tags', '')}

Complete this task. Test your changes. Run `npm run build` to verify no regressions.
"""
    else:
        work_section = """## NO TASKS IN QUEUE
All tasks completed. Run quality checks and look for improvements.
"""

    prompt = f"""You are the ELAB Tutor autonomous maintenance agent. You work on the ELAB Tutor project at:
{PROJECT_ROOT}

## CHECK RESULTS (just ran)
{check_summary}

{work_section}

## RULES
- ZERO regressions. `npm run build` must pass.
- Fix the most critical issue first.
- Be concise in your work. No unnecessary changes.
- After completing work, output a JSON summary on the LAST line:
{{"task": "description", "status": "done|partial|failed", "files_changed": ["file1.js"], "build_pass": true}}
"""
    return prompt


def run_claude_headless(prompt: str, max_time: int = 1500) -> dict:
    """Launch Claude Code headless with prompt. Returns result dict."""
    log_file = AUTOMA_ROOT / "logs" / f"claude-{datetime.now().strftime('%H%M%S')}.log"

    try:
        result = subprocess.run(
            ["claude", "-p", prompt, "--output-format", "text"],
            capture_output=True,
            text=True,
            timeout=max_time,
            cwd=str(PROJECT_ROOT),
            env={**os.environ, "CLAUDE_AUTO_ACCEPT": "1"},
        )

        output = result.stdout
        log_file.write_text(f"=== PROMPT ===\n{prompt[:500]}\n\n=== OUTPUT ===\n{output}")

        # Try to extract JSON result from last line
        lines = output.strip().splitlines()
        for line in reversed(lines):
            line = line.strip()
            if line.startswith("{") and line.endswith("}"):
                try:
                    return json.loads(line)
                except json.JSONDecodeError:
                    pass

        return {
            "task": "unknown",
            "status": "done" if result.returncode == 0 else "failed",
            "output_length": len(output),
            "returncode": result.returncode,
        }

    except subprocess.TimeoutExpired:
        return {"task": "timeout", "status": "failed", "error": f"Timed out after {max_time}s"}
    except FileNotFoundError:
        return {"task": "no_claude", "status": "failed", "error": "claude CLI not found in PATH"}
    except Exception as e:
        return {"task": "error", "status": "failed", "error": str(e)[:300]}


def micro_research(state: dict) -> str | None:
    """Run 1 micro-research per cycle (Semantic Scholar)."""
    topics = [
        "educational electronics simulation children",
        "Scratch to Arduino C++ block programming",
        "AI tutoring scaffolding real-time",
        "circuit simulation browser WebAssembly",
        "readability index Italian children",
        "iPad touch interface educational",
        "offline progressive web app education",
        "Socratic questioning AI tutor",
    ]

    cycle = state.get("loop", {}).get("cycles_today", 0)
    topic = topics[cycle % len(topics)]

    papers = search_papers(topic, limit=3)
    if papers and not any("error" in p for p in papers):
        summary = f"Research: '{topic}' → {len(papers)} papers found"
        for p in papers[:2]:
            summary += f"\n  - {p.get('title', '?')} ({p.get('year', '?')}, {p.get('citationCount', 0)} cites)"
        return summary
    return None


def save_report(cycle_num: int, check_results: list, task_result: dict, research: str | None):
    """Save cycle report as JSON."""
    report = {
        "cycle": cycle_num,
        "timestamp": datetime.now().isoformat(),
        "date": date.today().isoformat(),
        "checks": check_results,
        "checks_passed": sum(1 for r in check_results if r["status"] == "pass"),
        "checks_total": sum(1 for r in check_results if r["status"] != "skip"),
        "task_result": task_result,
        "research": research,
    }

    filename = f"{date.today().isoformat()}-cycle-{cycle_num}.json"
    report_path = REPORTS_DIR / filename
    report_path.write_text(json.dumps(report, indent=2))
    return str(report_path)


def run_cycle(skip_slow: bool = False, dry_run: bool = False) -> dict:
    """Run one complete orchestrator cycle."""
    cycle_start = time.time()
    state = load_state()

    # Update cycle count
    today = date.today().isoformat()
    if state.get("loop", {}).get("last_date") != today:
        state.setdefault("loop", {})["cycles_today"] = 0
        state["loop"]["last_date"] = today
        state.setdefault("budget", {})["spent_today_eur"] = 0

    cycle_num = state["loop"].get("cycles_today", 0) + 1
    state["loop"]["cycles_today"] = cycle_num
    state["loop"]["status"] = "running"

    print(f"\n{'='*60}")
    print(f" ELAB Automa — Cycle {cycle_num} ({datetime.now().strftime('%H:%M:%S')})")
    print(f"{'='*60}")

    # Step 1: Run checks
    print("\n📋 Running 7 checks...")
    check_results = run_all_checks(skip_slow=skip_slow)
    print_results(check_results)

    # Step 2: Get next task
    task = get_next_task()
    if task:
        print(f"\n📦 Next task: [{task.get('priority', '?')}] {task.get('title', task.get('_file', '?'))}")
        if not dry_run:
            claim_task(task["_file"])
    else:
        print("\n📦 No pending tasks")

    # Step 3: Compose prompt and run Claude
    prompt = compose_prompt(check_results, task, state)

    if dry_run:
        print("\n🔍 DRY RUN — Prompt composed but NOT executing Claude.")
        print(f"   Prompt length: {len(prompt)} chars")
        task_result = {"task": "dry_run", "status": "skipped"}
    else:
        # Try claude CLI first, fall back to prompt-only mode
        import shutil
        if shutil.which("claude"):
            print("\n🤖 Launching Claude Code headless...")
            task_result = run_claude_headless(prompt)
        else:
            print("\n📝 Claude CLI not in PATH — saving prompt for interactive session.")
            prompt_file = AUTOMA_ROOT / "state" / "next-prompt.md"
            prompt_file.write_text(prompt)
            task_result = {"task": task.get("title", "?") if task else "none", "status": "pending_interactive", "prompt_saved": str(prompt_file)}
        print(f"   Result: {task_result.get('status', '?')}")

        # Update task status
        if task:
            if task_result.get("status") == "done":
                complete_task(task["_file"])
            elif task_result.get("status") == "pending_interactive":
                pass  # Keep in active, will be completed interactively
            else:
                fail_task(task["_file"], task_result.get("error", "unknown"))

    # Step 4: Micro-research
    print("\n🔬 Micro-research...")
    research = micro_research(state)
    if research:
        print(f"   {research[:120]}")
    else:
        print("   No results")

    # Step 5: Save report
    report_path = save_report(cycle_num, check_results, task_result, research)
    print(f"\n📊 Report saved: {report_path}")

    # Step 6: Update state
    elapsed = time.time() - cycle_start
    state["loop"]["last_cycle"] = datetime.now().isoformat()
    state["loop"]["last_elapsed_s"] = int(elapsed)
    state["build"] = {
        "status": next((r["status"] for r in check_results if r["name"] == "build"), "unknown"),
        "last_check": datetime.now().isoformat(),
    }
    save_state(state)
    write_heartbeat()

    print(f"\n⏱️  Cycle completed in {elapsed:.0f}s")
    print(f"   Queue: {json.dumps(stats())}")

    return {"cycle": cycle_num, "elapsed_s": int(elapsed), "task_result": task_result}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="ELAB Automa Orchestrator")
    parser.add_argument("--fast", action="store_true", help="Skip slow checks (browser, iPad)")
    parser.add_argument("--dry-run", action="store_true", help="Run checks but don't launch Claude")
    parser.add_argument("--loop", action="store_true", help="Run continuously every 2h")
    args = parser.parse_args()

    if args.loop:
        print("🔄 Starting continuous loop (every 2h)...")
        while True:
            try:
                run_cycle(skip_slow=args.fast)
            except Exception as e:
                print(f"❌ Cycle error: {e}")
            print(f"\n💤 Sleeping 2h until next cycle...")
            time.sleep(7200)
    else:
        run_cycle(skip_slow=args.fast, dry_run=args.dry_run)
