#!/usr/bin/env python3
"""beforeSubmitPrompt 门禁：
- 拦截 /harness-apply：校验任务 propose 阶段文档就绪（profile 分档背书）
- 拦截 /harness-archive：校验处于 AWAITING_ARCHIVE（test-report 结论 PASS）
- 通过 → 放行；不过 → block 并给原因
"""
import json
import os
import re
import sys

HOOK_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(HOOK_DIR, "..", ".."))


def _read_stdin() -> dict:
    try:
        raw = sys.stdin.read()
        return json.loads(raw) if raw.strip() else {}
    except Exception:
        return {}


def _parse_profile(proposal_path: str) -> str:
    """从 proposal.md「## 流程 profile」勾选解析 profile，默认 standard。"""
    if not os.path.isfile(proposal_path):
        return "standard"
    txt = open(proposal_path, encoding="utf-8").read()
    for p in ("quick", "standard", "refactor"):
        if re.search(rf"-\s*\[x\]\s*\**{p}\**", txt, re.I):
            return p
    return "standard"


def _conclusion_verdict(txt: str) -> str | None:
    """取最后一个「## 结论」段，读首个非空非引用行的前导 token。
    「PASS / BLOCK」并列 = 模板未改 = None。"""
    matches = list(re.finditer(r"^##\s*结论\b([\s\S]*?)(?=^##\s+|\Z)", txt, re.M))
    if not matches:
        return None
    body = matches[-1].group(1)
    first = next((l.strip() for l in body.splitlines() if l.strip() and not l.strip().startswith(">")), "")
    if not first:
        return None
    token = re.split(r"[\s:：]", first, 1)[0].upper()
    if "/" in first and "PASS" in first and ("BLOCK" in first or "FAIL" in first):
        return None  # 模板残留
    return token if token in ("PASS", "BLOCK", "FAIL", "REJECT") else None


def _doc_verdict(task_dir: str, doc: str) -> str | None:
    p = os.path.join(task_dir, doc)
    if not os.path.isfile(p):
        return None
    return _conclusion_verdict(open(p, encoding="utf-8").read())


def _block(reason: str):
    print(json.dumps({"decision": "block", "reason": reason}, ensure_ascii=False))
    sys.exit(0)


def _allow():
    print(json.dumps({"decision": "allow"}))
    sys.exit(0)


def main():
    payload = _read_stdin()
    prompt = (payload.get("prompt") or payload.get("text") or "").strip()

    m = re.match(r"^/harness-(apply|archive)\s+([a-z0-9][a-z0-9_-]*)", prompt)
    if not m:
        _allow()

    cmd, task = m.group(1), m.group(2)
    task_dir = os.path.join(REPO_ROOT, ".harness/deliverables", task)
    if not os.path.isdir(task_dir):
        _block(f"任务目录不存在: .harness/deliverables/{task}/ —— 先运行 /harness-propose {task}")

    profile = _parse_profile(os.path.join(task_dir, "proposal.md"))

    if cmd == "apply":
        req = _doc_verdict(task_dir, "requirements.md")
        if req != "PASS":
            _block(f"requirements.md 结论非 PASS（当前: {req}）—— propose 阶段未完成")
        des_path = os.path.join(task_dir, "design.md")
        if not os.path.isfile(des_path):
            _block("design.md 不存在 —— propose 阶段未完成")
        des_txt = open(des_path, encoding="utf-8").read()
        if _conclusion_verdict(des_txt) != "PASS":
            _block("design.md 结论非 PASS")
        if profile == "quick":
            if "## 就绪自评" not in des_txt:
                _block("quick 档要求 design.md 文末含「## 就绪自评」")
        else:
            rr = _doc_verdict(task_dir, "readiness-review.md")
            if rr != "PASS":
                _block(f"{profile} 档要求 readiness-review.md 结论 PASS（当前: {rr}）")
        _allow()

    if cmd == "archive":
        tr = _doc_verdict(task_dir, "test-report.md")
        if tr != "PASS":
            _block(f"test-report.md 结论非 PASS（当前: {tr}）—— 未到 AWAITING_ARCHIVE，不可归档")
        _allow()


if __name__ == "__main__":
    main()
