"""解析 subagentStop hook 的 stdin JSON payload，识别子代理角色。"""
import json
import re
import sys

KNOWN_ROLES = [
    "developer",
    "test-engineer",
    "business-analyst",
    "solution-architect",
    "code-reviewer",
    "readiness-reviewer",
    "project-manager",
]


def read_payload() -> dict:
    try:
        raw = sys.stdin.read()
        return json.loads(raw) if raw.strip() else {}
    except Exception:
        return {}


def _from_subagent_type(payload: dict) -> str | None:
    st = (payload.get("subagent_type") or payload.get("subagentType") or "").strip().lower()
    if st in KNOWN_ROLES:
        return st
    return None


def _from_prompt(payload: dict) -> str | None:
    prompt = payload.get("prompt") or payload.get("initial_prompt") or ""
    # 匹配「必读=.harness/agents/<role>.md」或显式角色声明
    m = re.search(r"agents/([a-z-]+)\.md", prompt)
    if m and m.group(1) in KNOWN_ROLES:
        return m.group(1)
    m = re.search(r"subagent_type\s*[=:]\s*([a-z-]+)", prompt)
    if m and m.group(1) in KNOWN_ROLES:
        return m.group(1)
    for role in KNOWN_ROLES:
        if re.search(rf"\b{role}\b", prompt[:600]):
            return role
    return None


def resolve_role(payload: dict) -> tuple[str, str]:
    """返回 (role, reason)。role 可能为 'unknown'。"""
    r = _from_subagent_type(payload)
    if r:
        return r, "subagent_type 显式匹配"
    r = _from_prompt(payload)
    if r:
        return r, "prompt 内容启发式匹配"
    return "unknown", "无法识别（保守观察）"


def extract_task_name(payload: dict) -> str:
    prompt = payload.get("prompt") or payload.get("initial_prompt") or ""
    m = re.search(r"TASK_NAME\s*[=:]\s*([a-z0-9][a-z0-9_-]*)", prompt)
    if m:
        return m.group(1)
    m = re.search(r"deliverables/([a-z0-9][a-z0-9_-]*)/", prompt)
    if m:
        return m.group(1)
    return "_unknown-task"
