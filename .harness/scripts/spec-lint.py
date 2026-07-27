#!/usr/bin/env python3
"""specs 硬校验:
1) R-xxx / S-xxx 编号全库唯一（含退役列表）
2) Requirement/Scenario 标题格式 `## Requirement: <名> (<域>-R-\d+)`
3) 每个 Scenario 至少含 GIVEN/WHEN/THEN
4) 每个域文件含「## 退役列表」节
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


SPEC_DIR = project_root() / ".harness/specs"
fails = []
seen = {}

for f in sorted(SPEC_DIR.glob("*.md")):
    if f.name.startswith("_"):
        continue
    txt = f.read_text(encoding="utf-8")

    for m in re.finditer(r"\(([A-Z0-9]+-(?:R|S)-\d+)\)", txt):
        code = m.group(1)
        if code in seen:
            fails.append(f"编号重复: {code} 同时出现在 {seen[code]} 与 {f.name}")
        else:
            seen[code] = f.name

    for m in re.finditer(r"^## Requirement:(.*)$", txt, re.M):
        if not re.search(r"\([A-Z0-9]+-R-\d+\)", m.group(1)):
            fails.append(f"{f.name}: Requirement 标题缺编号: {m.group(1).strip()}")

    for m in re.finditer(r"^### Scenario:(.*)$", txt, re.M):
        if not re.search(r"\([A-Z0-9]+-S-\d+\)", m.group(1)):
            fails.append(f"{f.name}: Scenario 标题缺编号: {m.group(1).strip()}")

    for m in re.finditer(r"^### Scenario:[^\n]*\n((?:(?!^#).*\n?)*)", txt, re.M):
        body = m.group(1)
        for kw in ("GIVEN", "WHEN", "THEN"):
            if kw not in body:
                fails.append(f"{f.name}: Scenario 缺 {kw}: {m.group(0).splitlines()[0][:60]}")

    if "## 退役列表" not in txt:
        fails.append(f"{f.name}: 缺「## 退役列表」节")

if fails:
    print("[SPEC-LINT FAIL]")
    for x in fails:
        print("  -", x)
    sys.exit(1)
print(f"[SPEC-LINT PASS] {len(seen)} 个编号唯一，格式合规")
