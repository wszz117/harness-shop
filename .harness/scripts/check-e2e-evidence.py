#!/usr/bin/env python3
"""E2E 证据校验:
  check <task>            校验活跃任务 test-report.md 引用的截图全部存在且为真实截图
  check-archived <task>   同上，针对 _archive/<task>/
  check-archived-all      校验全部归档任务（check-harness.sh 调用）
  rewrite-archived <task> 归档后把报告中 .playwright-cli_tasks/<task>/ 路径改写为 evidence/

"真实截图"判定（v1.1 新增，防止用 1x1 占位图冒充证据）：
  - 文件是合法 PNG（签名 + IHDR）
  - 宽、高均 >= MIN_SIDE 像素
  - 文件大小 >= MIN_BYTES
"""
import re
import struct
import subprocess
import sys
from pathlib import Path

MIN_SIDE = 200
MIN_BYTES = 5 * 1024
PNG_SIG = b"\x89PNG\r\n\x1a\n"


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


def png_problem(fp: Path) -> str | None:
    """返回问题描述；None 表示是一张像样的真实截图。"""
    data = fp.read_bytes()
    if len(data) < 24 or not data.startswith(PNG_SIG) or data[12:16] != b"IHDR":
        return "不是合法 PNG"
    w, h = struct.unpack(">II", data[16:24])
    if w < MIN_SIDE or h < MIN_SIDE:
        return f"尺寸 {w}x{h} 过小（疑似占位图，要求 >= {MIN_SIDE}x{MIN_SIDE}）"
    if len(data) < MIN_BYTES:
        return f"文件仅 {len(data)} 字节（疑似占位图，要求 >= {MIN_BYTES}）"
    return None


def check_report(rp: Path) -> int:
    if not rp.exists():
        print(f"[FAIL] 报告不存在: {rp}")
        return 1
    txt = rp.read_text(encoding="utf-8")
    pngs = sorted(set(re.findall(
        r"[\w./-]*\.playwright-cli_tasks/[\w./-]+\.png|evidence/[\w./-]+\.png", txt)))
    if not pngs:
        print("[WARN] 报告未引用任何截图证据")
        return 0
    problems = []
    for p in pngs:
        fp = ROOT / p if not p.startswith("evidence/") else rp.parent / p
        if not fp.exists():
            problems.append(f"{p}: 文件缺失")
            continue
        why = png_problem(fp)
        if why:
            problems.append(f"{p}: {why}")
    if problems:
        print(f"[FAIL] {rp.parent.name} 证据截图不合格:")
        for m in problems:
            print("  -", m)
        return 1
    print(f"[OK] {rp.parent.name}: {len(pngs)} 张证据截图全部存在且为真实截图")
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


def cmd_check_archived_all() -> int:
    base = ROOT / ".harness/deliverables/_archive"
    reports = sorted(base.glob("*/test-report.md")) if base.exists() else []
    if not reports:
        print("[OK] 无归档任务")
        return 0
    return max(check_report(rp) for rp in reports)


def main() -> int:
    if len(sys.argv) >= 2 and sys.argv[1] == "check-archived-all":
        return cmd_check_archived_all()
    if len(sys.argv) < 3:
        print(__doc__)
        return 1
    cmd, task = sys.argv[1], sys.argv[2]
    if cmd == "check":
        return check_report(report_path(task, archived=False))
    if cmd == "check-archived":
        return check_report(report_path(task, archived=True))
    if cmd == "rewrite-archived":
        return cmd_rewrite(task)
    print(f"[FAIL] 未知子命令: {cmd}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
