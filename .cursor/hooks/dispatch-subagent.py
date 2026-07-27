#!/usr/bin/env python3
"""subagentStop 派发器：
- 解析 stdin payload → 识别角色
- developer / test-engineer → 执行旁路验证动作
- 其余角色（OBSERVE_ONLY_WORKERS）仅审计
- 全部审计写 .harness/.hook-logs/
"""
import datetime
import json
import os
import sys

HOOK_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HOOK_DIR)
REPO_ROOT = os.path.abspath(os.path.join(HOOK_DIR, "..", ".."))

from _subagent_payload import read_payload, resolve_role  # noqa: E402

OBSERVE_ONLY_WORKERS = {
    "business-analyst",
    "solution-architect",
    "code-reviewer",
    "readiness-reviewer",
    "project-manager",
    "unknown",
}


def _audit(event: str, **fields):
    log_dir = os.path.join(REPO_ROOT, ".harness/.hook-logs")
    os.makedirs(log_dir, exist_ok=True)
    entry = {"ts": datetime.datetime.now().isoformat(timespec="seconds"), "event": event, **fields}
    day = datetime.date.today().isoformat()
    with open(os.path.join(log_dir, f"subagent-{day}.jsonl"), "a") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


def _emit_followup(message: str):
    """把 followup 消息写回 hook 协议 stdout。"""
    print(json.dumps({"followup": message}, ensure_ascii=False))


def main() -> int:
    payload = read_payload()
    prompt = payload.get("prompt") or payload.get("initial_prompt") or ""
    role, reason = resolve_role(payload)

    _audit(
        "identity",
        role=role,
        reason=reason,
        subagent_type=payload.get("subagent_type") or payload.get("subagentType"),
        parent_subagent_type=payload.get("parent_subagent_type"),
        prompt_len=len(prompt),
        transcript=bool(payload.get("transcript")),
    )

    try:
        if role == "developer":
            import _actions_developer
            _actions_developer.run(REPO_ROOT, payload, prompt, _emit_followup, _audit)
        elif role == "test-engineer":
            import _actions_tester
            _actions_tester.run(REPO_ROOT, payload, prompt, _emit_followup, _audit)
        elif role in OBSERVE_ONLY_WORKERS:
            _audit("observe-only", role=role)
    except Exception as e:  # hook 永不 fail-closed
        _audit("hook-error", role=role, error=str(e)[:500])
    return 0


if __name__ == "__main__":
    sys.exit(main())
