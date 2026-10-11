#!/usr/bin/env bash
# 质量基线：对比/更新 baseline.json（测试文件数不得低于基线，防交付倒退）
# 用法: baseline.sh [--update]
set -uo pipefail
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$PROJECT_ROOT"
B=".harness/baseline.json"

# 递归统计（后端测试按 controllers/services/utils 分子目录存放）
# v1.1 修复：原写法 ls backend/tests/*.test.js 只看顶层，恒为 0，导致基线恒 FAIL
BE=$(find backend/tests -name '*.test.js' 2>/dev/null | wc -l)
FE=$(find frontend/src/tests -name '*.test.*' 2>/dev/null | wc -l)
E2E=$(find e2e/tests -name '*.e2e.js' 2>/dev/null | wc -l)

if [ "${1:-}" = "--update" ]; then
  python3 - "$BE" "$FE" "$E2E" <<'PY'
import json, sys, datetime
be, fe, e2e = map(int, sys.argv[1:4])
p = ".harness/baseline.json"
d = json.load(open(p))
d["backend_tests"]["files"] = be
d["frontend_tests"]["files"] = fe
d["e2e_specs"]["files"] = e2e
d["updated_at"] = datetime.date.today().isoformat()
json.dump(d, open(p, "w"), ensure_ascii=False, indent=2)
print("[OK] baseline 已更新:", be, fe, e2e)
PY
  exit $?
fi

python3 - "$BE" "$FE" "$E2E" <<'PY'
import json, sys
be, fe, e2e = map(int, sys.argv[1:4])
d = json.load(open(".harness/baseline.json"))
fails = []
if be < d["backend_tests"]["files"]: fails.append(f"后端测试文件 {be} < 基线 {d['backend_tests']['files']}")
if fe < d["frontend_tests"]["files"]: fails.append(f"前端测试文件 {fe} < 基线 {d['frontend_tests']['files']}")
if e2e < d["e2e_specs"]["files"]: fails.append(f"E2E 文件 {e2e} < 基线 {d['e2e_specs']['files']}")
if fails:
    print("[BASELINE FAIL]", "; ".join(fails)); sys.exit(1)
print(f"[BASELINE PASS] backend={be} frontend={fe} e2e={e2e} 不低于基线")
PY
