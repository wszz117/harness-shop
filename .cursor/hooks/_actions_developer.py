"""developer 子代理停止后的旁路验证动作：
- 并行跑前后端单测（互不阻塞）
- 跑 verify.sh 硬门禁 + baseline.sh 基线对比
- verdict 写 .harness/.hook-results/<task>/developer.json
"""
import json
import os
import re
import subprocess
import time

from _node_path import node_env


def _parse_test_counts(output: str) -> dict:
    """从 vitest 输出解析通过/失败数。"""
    counts = {"passed": 0, "failed": 0}
    for m in re.finditer(r"Tests\s+(?:(\d+)\s+failed\s*\|\s*)?(\d+)\s+passed", output):
        if m.group(1):
            counts["failed"] += int(m.group(1))
        counts["passed"] += int(m.group(2))
    return counts


def _run_tests_parallel(repo_root: str) -> tuple[int, str, dict]:
    env = node_env()
    backend = subprocess.Popen(
        ["npx", "vitest", "run", "--reporter=basic"],
        cwd=repo_root, env=env,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
    )
    frontend = subprocess.Popen(
        ["npx", "vitest", "run", "-c", "vitest.frontend.config.js", "--reporter=basic"],
        cwd=repo_root, env=env,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
    )
    b_out, _ = backend.communicate(timeout=1800)
    f_out, _ = frontend.communicate(timeout=1800)
    merged = "=== Backend Tests ===\n" + b_out + "\n=== Frontend Tests ===\n" + f_out
    rc = max(backend.returncode, frontend.returncode)
    counts = _parse_test_counts(merged)
    return rc, merged, counts


def _run_script(repo_root: str, script: str) -> tuple[int, str]:
    p = subprocess.run(
        ["bash", script], cwd=repo_root, env=node_env(),
        capture_output=True, text=True, timeout=900,
    )
    return p.returncode, (p.stdout + p.stderr)


def run(repo_root: str, payload: dict, prompt: str, emit_followup, audit) -> dict:
    from _subagent_payload import extract_task_name

    task = extract_task_name(payload)
    started = time.time()

    test_rc, test_out, counts = _run_tests_parallel(repo_root)
    verify_rc, verify_out = _run_script(repo_root, ".harness/scripts/verify.sh")
    baseline_rc, baseline_out = _run_script(repo_root, ".harness/scripts/baseline.sh")

    verdict = "PASS" if (test_rc == 0 and verify_rc == 0 and baseline_rc == 0) else "FAIL"
    fail_reason = ""
    if verdict == "FAIL":
        parts = []
        if test_rc != 0:
            parts.append(f"单测失败(rc={test_rc}, passed={counts['passed']}, failed={counts['failed']})")
        if verify_rc != 0:
            parts.append(f"verify.sh 未过(rc={verify_rc})")
        if baseline_rc != 0:
            parts.append(f"基线倒退(rc={baseline_rc})")
        fail_reason = "; ".join(parts)

    result = {
        "role": "developer",
        "task": task,
        "verdict": verdict,
        "fail_reason": fail_reason,
        "test_rc": test_rc,
        "test_counts": counts,
        "verify_rc": verify_rc,
        "baseline_rc": baseline_rc,
        "elapsed_sec": round(time.time() - started, 1),
        "test_output_tail": test_out[-3000:],
        "verify_output_tail": verify_out[-2000:],
        "baseline_output_tail": baseline_out[-500:],
    }

    out_dir = os.path.join(repo_root, ".harness/.hook-results", task)
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, "developer.json"), "w") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    audit("developer-bypass", verdict=verdict, fail_reason=fail_reason, task=task)
    if verdict == "FAIL":
        emit_followup(
            f"[HOOK] developer 旁路验证 FAIL: {fail_reason}。"
            f"详见 .harness/.hook-results/{task}/developer.json，请 PM 回退 Dev 重做。"
        )
    return result
