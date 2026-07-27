"""test-engineer 子代理停止后的旁路动作：
- 校验 test-report.md 存在且含结论段
- 调 check-e2e-evidence.py 校验证据截图齐全
- 结果写 .harness/.hook-results/<task>/test-engineer.json
"""
import json
import os
import re
import subprocess
import time

from _node_path import node_env


def run(repo_root: str, payload: dict, prompt: str, emit_followup, audit) -> dict:
    from _subagent_payload import extract_task_name

    task = extract_task_name(payload)
    started = time.time()
    problems = []

    report = os.path.join(repo_root, ".harness/deliverables", task, "test-report.md")
    conclusion = None
    if not os.path.isfile(report):
        problems.append(f"test-report.md 不存在: {report}")
    else:
        txt = open(report, encoding="utf-8").read()
        m = re.search(r"^##\s*结论\b([\s\S]*?)(?=^##\s+|\Z)", txt, re.M)
        if not m:
            problems.append("test-report.md 缺「## 结论」段")
        else:
            body = m.group(1)
            first = next((l.strip() for l in body.splitlines() if l.strip() and not l.strip().startswith(">")), "")
            token = first.split(":")[0].split("：")[0].strip().upper()
            conclusion = token if token in ("PASS", "FAIL") else None
            if conclusion is None:
                problems.append(f"结论段无法判定: {first[:50]}")
        if "{{" in txt:
            problems.append("test-report.md 含模板占位符残留")

    ev = subprocess.run(
        ["python3", ".harness/scripts/check-e2e-evidence.py", "check", task],
        cwd=repo_root, env=node_env(), capture_output=True, text=True, timeout=120,
    )
    if ev.returncode != 0:
        problems.append("E2E 证据校验未过: " + (ev.stdout + ev.stderr)[-300:])

    verdict = "PASS" if (not problems and conclusion == "PASS") else "FAIL"
    result = {
        "role": "test-engineer",
        "task": task,
        "verdict": verdict,
        "report_conclusion": conclusion,
        "fail_reason": "; ".join(problems),
        "evidence_rc": ev.returncode,
        "elapsed_sec": round(time.time() - started, 1),
    }

    out_dir = os.path.join(repo_root, ".harness/.hook-results", task)
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, "test-engineer.json"), "w") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    audit("tester-bypass", verdict=verdict, fail_reason=result["fail_reason"], task=task)
    if verdict == "FAIL":
        emit_followup(
            f"[HOOK] test-engineer 旁路校验 FAIL: {result['fail_reason']}。"
            f"详见 .harness/.hook-results/{task}/test-engineer.json。"
        )
    return result
