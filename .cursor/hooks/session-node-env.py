#!/usr/bin/env python3
"""sessionStart：确认 node/npm/mongod 环境，写入审计日志，供会话诊断。"""
import datetime
import json
import os
import subprocess
import sys

HOOK_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HOOK_DIR)
REPO_ROOT = os.path.abspath(os.path.join(HOOK_DIR, "..", ".."))

from _node_path import which, node_env  # noqa: E402


def _ver(cmd: list[str]) -> str:
    try:
        return subprocess.run(cmd, capture_output=True, text=True, timeout=10,
                              env=node_env()).stdout.strip()
    except Exception:
        return "N/A"


def main() -> int:
    info = {
        "ts": datetime.datetime.now().isoformat(timespec="seconds"),
        "event": "session-start",
        "node": which("node") or "MISSING",
        "node_version": _ver(["node", "--version"]),
        "npm_version": _ver(["npm", "--version"]),
        "mongod": which("mongod") or "MISSING",
    }
    log_dir = os.path.join(REPO_ROOT, ".harness/.hook-logs")
    os.makedirs(log_dir, exist_ok=True)
    day = datetime.date.today().isoformat()
    with open(os.path.join(log_dir, f"session-{day}.jsonl"), "a") as f:
        f.write(json.dumps(info, ensure_ascii=False) + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
