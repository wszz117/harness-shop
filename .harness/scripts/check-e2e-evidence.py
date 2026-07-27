#!/usr/bin/env python3
"""E2E 证据校验:
  check <task>            校验 test-report.md 引用的截图全部存在
  rewrite-archived <task> 归档后把报告中 .playwright-cli_tasks/<task>/ 路径改写为 evidence/
"""
import re, sys, subprocess
from pathlib import Path


def project_root() -> Path:
    try:
        out = subprocess.run(["git", "rev-parse", "--show-toplevel"],
                             capture_output=True, text=True, check=True)
        return Path(out.stdout.strip())
    except Exception:
        return Path.cwd()


ROOT = project_root()


def report_path(task: str, archived: bool) -> Path:
    base = ROOT / ".harness/deliverables"
    return (base / "_archive" / task if archived else base / task) / "test-report.md"


def cmd_check(task: str) -> int:
    rp = report_path(task, archived=False)
    if not rp.exists():
        print(f"[FAIL] 报告不存在: {rp}")
        return 1
    txt = rp.read_text(encoding="utf-8")
    pngs = re.findall(r"[\w./-]*\.playwright-cli_tasks/[\w./-]+\.png|evidence/[\w./-]+\.png", txt)
    if not pngs:
        print("[WARN] 报告未引用任何截图证据")
        return 0
    missing = []
    for p in pngs:
        fp = ROOT / p if not p.startswith("evidence/") else rp.parent / p
        if not fp.exists():
            missing.append(p)
    if missing:
        print("[FAIL] 证据截图缺失:")
        for m in missing:
            print("  -", m)
        return 1
    print(f"[OK] {len(pngs)} 张证据截图全部存在")
    return 0


def cmd_rewrite(task: str) -> int:
    rp = report_path(task, archived=True)
    if not rp.exists():
        print(f"[WARN] 归档报告不存在: {rp}（跳过改写）")
        return 0
    txt = rp.read_text(encoding="utf-8")
    new = re.sub(r"[\w./-]*\.playwright-cli_tasks/" + re.escape(task) + r"/", "evidence/", txt)
    if new != txt:
        rp.write_text(new, encoding="utf-8")
        print("[OK] 报告证据路径已改写为 evidence/")
    else:
        print("[OK] 无需改写（未发现旧路径）")
    return 0


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__)
        return 1
    cmd, task = sys.argv[1], sys.argv[2]
    if cmd == "check":
        return cmd_check(task)
    if cmd == "rewrite-archived":
        return cmd_rewrite(task)
    print(f"[FAIL] 未知子命令: {cmd}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
