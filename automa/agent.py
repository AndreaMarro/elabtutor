#!/usr/bin/env python3
"""
ELAB Autoresearch Agent — Anthropic API with Programmatic Tool Calling
Replaces `claude -p` with structured tool use, persistent context, and multi-tool orchestration.

Uses: Anthropic Messages API + tools (DeepSeek, Gemini, Kimi, Semantic Scholar,
      Playwright screenshots, file read/write, bash, web search).
"""

import anthropic
import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

AUTOMA_ROOT = Path(__file__).parent
PROJECT_ROOT = AUTOMA_ROOT.parent
sys.path.insert(0, str(AUTOMA_ROOT))

from tools import (
    call_deepseek_reasoner, call_gemini, call_kimi,
    search_papers, chat_galileo, gulpease_index,
    check_nanobot_health, check_vercel_health, check_brain_health,
    DEEPSEEK_API_KEY, GEMINI_API_KEY, KIMI_API_KEY,
)

# Load API key
_env_path = AUTOMA_ROOT / ".env"
if _env_path.exists():
    for line in _env_path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())

# Force-load from .env (setdefault doesn't overwrite empty strings)
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
if not ANTHROPIC_API_KEY and _env_path.exists():
    for line in _env_path.read_text().splitlines():
        if line.startswith("ANTHROPIC_API_KEY="):
            ANTHROPIC_API_KEY = line.split("=", 1)[1].strip()
            break

# ─── Tool Definitions ────────────────────────────

TOOLS = [
    {
        "name": "deepseek_reason",
        "description": "Call DeepSeek R1 for reasoning, scoring, and judging. Use for evaluating Galileo responses, analyzing problems, and making decisions.",
        "input_schema": {
            "type": "object",
            "properties": {"prompt": {"type": "string", "description": "The reasoning prompt"}},
            "required": ["prompt"],
        },
    },
    {
        "name": "gemini_analyze",
        "description": "Call Gemini 2.5 Pro for market research, competitor analysis, vision analysis, and long-context tasks.",
        "input_schema": {
            "type": "object",
            "properties": {"prompt": {"type": "string", "description": "The analysis prompt"}},
            "required": ["prompt"],
        },
    },
    {
        "name": "kimi_review",
        "description": "Call Kimi K2.5 (128K context) for code review, second opinions, trend analysis, and synthesis. Kimi also supports vision for screenshot analysis.",
        "input_schema": {
            "type": "object",
            "properties": {"prompt": {"type": "string", "description": "The review prompt"}},
            "required": ["prompt"],
        },
    },
    {
        "name": "search_papers",
        "description": "Search Semantic Scholar for academic papers. Returns titles, years, citation counts.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"},
                "limit": {"type": "integer", "description": "Max results (default 5)"},
            },
            "required": ["query"],
        },
    },
    {
        "name": "web_search",
        "description": "Search the web for current information, blog posts, competitor sites, EdTech news, documentation.",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string", "description": "Search query"}},
            "required": ["query"],
        },
    },
    {
        "name": "test_galileo",
        "description": "Send a message to Galileo AI tutor and get response. Use for testing quality, tag accuracy, identity leaks.",
        "input_schema": {
            "type": "object",
            "properties": {
                "message": {"type": "string"},
                "experiment_id": {"type": "string", "description": "e.g. v1-cap6-esp1"},
            },
            "required": ["message"],
        },
    },
    {
        "name": "read_file",
        "description": "Read a file from the project. Use for reading code, configs, knowledge files, reports.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Relative path from project root"},
                "max_lines": {"type": "integer", "description": "Max lines to read (default 200)"},
            },
            "required": ["path"],
        },
    },
    {
        "name": "write_file",
        "description": "Write content to a file. Use for saving research, articles, reports, code changes.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Relative path from project root"},
                "content": {"type": "string"},
            },
            "required": ["path", "content"],
        },
    },
    {
        "name": "run_bash",
        "description": "Run a bash command. Use for npm run build, git, playwright, lighthouse, axe-core, etc.",
        "input_schema": {
            "type": "object",
            "properties": {
                "command": {"type": "string"},
                "timeout": {"type": "integer", "description": "Timeout in seconds (default 120)"},
            },
            "required": ["command"],
        },
    },
    {
        "name": "playwright_screenshot",
        "description": "Take a screenshot of a URL with Playwright. Returns the file path of the saved screenshot.",
        "input_schema": {
            "type": "object",
            "properties": {
                "url": {"type": "string", "description": "URL to screenshot"},
                "viewport": {"type": "string", "description": "WxH e.g. '1024x768' for iPad"},
                "output": {"type": "string", "description": "Output filename"},
            },
            "required": ["url"],
        },
    },
    {
        "name": "evaluate_score",
        "description": "Run evaluate.py to get the current composite score. Use to measure impact of changes.",
        "input_schema": {"type": "object", "properties": {}},
    },
]


# ─── Tool Execution ─────────────────────────────

def execute_tool(name: str, input_data: dict) -> str:
    """Execute a tool and return result as string."""
    try:
        if name == "deepseek_reason":
            return call_deepseek_reasoner(input_data["prompt"])

        elif name == "gemini_analyze":
            return call_gemini(input_data["prompt"])

        elif name == "kimi_review":
            return call_kimi(input_data["prompt"])

        elif name == "search_papers":
            papers = search_papers(input_data["query"], input_data.get("limit", 5))
            return json.dumps(papers, indent=2, ensure_ascii=False)[:3000]

        elif name == "web_search":
            # Use subprocess to call a web search
            r = subprocess.run(
                ["curl", "-s", f"https://api.duckduckgo.com/?q={input_data['query']}&format=json&no_html=1"],
                capture_output=True, text=True, timeout=15
            )
            return r.stdout[:3000] if r.stdout else "No results"

        elif name == "test_galileo":
            r = chat_galileo(input_data["message"], input_data.get("experiment_id", "v1-cap6-esp1"))
            return json.dumps(r, ensure_ascii=False)[:2000]

        elif name == "read_file":
            path = PROJECT_ROOT / input_data["path"]
            if not path.exists():
                return f"ERROR: File not found: {input_data['path']}"
            content = path.read_text()
            max_lines = input_data.get("max_lines", 200)
            lines = content.splitlines()[:max_lines]
            return "\n".join(lines)

        elif name == "write_file":
            path = PROJECT_ROOT / input_data["path"]
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(input_data["content"])
            return f"Written {len(input_data['content'])} chars to {input_data['path']}"

        elif name == "run_bash":
            timeout = input_data.get("timeout", 120)
            r = subprocess.run(
                input_data["command"], shell=True,
                capture_output=True, text=True, timeout=timeout,
                cwd=str(PROJECT_ROOT),
            )
            output = r.stdout + r.stderr
            return output[:5000] if output else f"(exit code {r.returncode})"

        elif name == "playwright_screenshot":
            url = input_data["url"]
            viewport = input_data.get("viewport", "1280x800")
            w, h = viewport.split("x")
            output = input_data.get("output", f"automa/screenshots/screen-{int(time.time())}.png")
            (PROJECT_ROOT / "automa" / "screenshots").mkdir(parents=True, exist_ok=True)

            script = f"""
const {{ chromium }} = require('playwright');
(async () => {{
    const browser = await chromium.launch({{ headless: true }});
    const page = await browser.newPage({{ viewport: {{ width: {w}, height: {h} }} }});
    await page.goto('{url}', {{ timeout: 30000 }});
    await page.waitForLoadState('networkidle', {{ timeout: 15000 }});
    await page.screenshot({{ path: '{output}', fullPage: false }});
    console.log('OK');
    await browser.close();
}})();
"""
            r = subprocess.run(["node", "-e", script], capture_output=True, text=True,
                               timeout=45, cwd=str(PROJECT_ROOT))
            if "OK" in r.stdout:
                return f"Screenshot saved: {output}"
            return f"Screenshot failed: {r.stderr[:300]}"

        elif name == "evaluate_score":
            r = subprocess.run(
                ["python3", str(AUTOMA_ROOT / "evaluate.py")],
                capture_output=True, text=True, timeout=600,
                cwd=str(PROJECT_ROOT),
            )
            # Extract scores
            scores = {}
            for line in r.stdout.splitlines():
                if line.startswith("SCORE:"):
                    parts = line[6:].split("=")
                    if len(parts) == 2:
                        scores[parts[0]] = parts[1]
            return json.dumps(scores, indent=2)

        else:
            return f"Unknown tool: {name}"

    except Exception as e:
        return f"ERROR: {str(e)[:500]}"


# ─── Agent Loop ──────────────────────────────────

def run_agent(system_prompt: str, user_prompt: str, max_turns: int = 25,
              model: str = "claude-sonnet-4-20250514") -> dict:
    """Run the agent with tool calling loop. Returns conversation result."""

    if not ANTHROPIC_API_KEY:
        return {"error": "ANTHROPIC_API_KEY not set", "status": "failed"}

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    messages = [{"role": "user", "content": user_prompt}]

    tool_calls_made = []
    total_tokens = 0

    for turn in range(max_turns):
        response = client.messages.create(
            model=model,
            max_tokens=4096,
            system=system_prompt,
            tools=TOOLS,
            messages=messages,
        )

        total_tokens += response.usage.input_tokens + response.usage.output_tokens

        # Check if we're done
        if response.stop_reason == "end_turn":
            # Extract text from response
            text = ""
            for block in response.content:
                if block.type == "text":
                    text += block.text
            return {
                "status": "done",
                "response": text,
                "turns": turn + 1,
                "tool_calls": len(tool_calls_made),
                "tokens": total_tokens,
                "tools_used": list(set(t["name"] for t in tool_calls_made)),
            }

        # Process tool calls
        assistant_content = response.content
        messages.append({"role": "assistant", "content": assistant_content})

        tool_results = []
        for block in assistant_content:
            if block.type == "tool_use":
                print(f"  🔧 {block.name}({json.dumps(block.input)[:80]}...)")
                result = execute_tool(block.name, block.input)
                tool_calls_made.append({"name": block.name, "input": block.input})
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result[:8000],  # Limit tool result size
                })

        messages.append({"role": "user", "content": tool_results})

    return {
        "status": "max_turns_reached",
        "turns": max_turns,
        "tool_calls": len(tool_calls_made),
        "tokens": total_tokens,
        "tools_used": list(set(t["name"] for t in tool_calls_made)),
    }


# ─── Entry Point ─────────────────────────────────

if __name__ == "__main__":
    # Quick test
    print("Testing ELAB Agent with Anthropic API...")
    print(f"API key: {'set' if ANTHROPIC_API_KEY else 'MISSING'}")

    result = run_agent(
        system_prompt="Sei ELAB Autoresearch. Rispondi brevemente.",
        user_prompt="Usa il tool test_galileo per mandare 'Cos è un LED?' a Galileo. Poi valuta la risposta con deepseek_reason.",
        max_turns=5,
        model="claude-sonnet-4-20250514",
    )
    print(json.dumps(result, indent=2, ensure_ascii=False)[:2000])
