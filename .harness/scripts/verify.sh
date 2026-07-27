#!/usr/bin/env bash
# 硬门禁：19 项快速验证。全 PASS 退出 0，任一 FAIL 退出 1。
# 用法: bash .harness/scripts/verify.sh [--with-tests]
set -uo pipefail
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$PROJECT_ROOT"

FAILS=0; N=0
check() { # $1 描述, $2 结果(0过)
  N=$((N+1))
  if [ "$2" -eq 0 ]; then printf '[PASS] %02d %s\n' "$N" "$1"
  else printf '[FAIL] %02d %s\n' "$N" "$1"; FAILS=$((FAILS+1)); fi
}

SRC_BACK=$(find backend -name '*.js' -not -path '*/node_modules/*' 2>/dev/null)
SRC_FRONT=$(find frontend/src -name '*.jsx' -o -name '*.js' 2>/dev/null | grep -v node_modules)

# 1 文件行数 <= 300
BIG=$(for f in $SRC_BACK $SRC_FRONT; do awk -v f="$f" 'END{if(NR>300) print f" ("NR" 行)"}' "$f"; done)
[ -z "$BIG" ]; check "源码文件行数 ≤ 300 ${BIG:+→ $BIG}" $?

# 2 console.log 残留（backend 排除 seeder/server 启动日志与测试）
CL=$(grep -rn 'console\.log' backend --include='*.js' 2>/dev/null | grep -v -E 'seeder|server\.js|tests/|smoke|config/db\.js' || true)
[ -z "$CL" ]; check "后端无 console.log 残留" $?

# 3 后端 ESM：禁 require()
REQ=$(grep -rn "require(" backend --include='*.js' 2>/dev/null | grep -v tests/ | grep -v '// allow-require' || true)
[ -z "$REQ" ]; check "后端 ESM（无 require() 残留）" $?

# 4 server.js 只 listen（不含 app.use 路由挂载）
! grep -q "app.use('/api" backend/server.js 2>/dev/null; check "server.js 只 listen，不挂路由" $?

# 5 所有 routes 文件均在 app.js 挂载
MISS=""
for r in backend/routes/*Routes.js; do
  base=$(basename "$r" .js)
  grep -q "$base" backend/app.js || MISS="$MISS $base"
done
[ -z "$MISS" ]; check "routes 全部在 app.js 挂载${MISS:+（缺:$MISS）}" $?

# 6 controllers 全部 asyncHandler 包裹
NOAH=$(grep -L 'asyncHandler' backend/controllers/*.js 2>/dev/null || true)
[ -z "$NOAH" ]; check "controllers 使用 asyncHandler" $?

# 7 models timestamps: true
NOTS=$(grep -L 'timestamps: true' backend/models/*.js 2>/dev/null || true)
[ -z "$NOTS" ]; check "models 全部 timestamps: true" $?

# 8 前端禁 fetch/axios 直调（RTK Query 基座除外）
FA=$(grep -rn -E '\b(fetch\(|axios)' frontend/src --include='*.js' --include='*.jsx' 2>/dev/null | grep -v -E 'apiSlice|fetchBaseQuery|tests/' || true)
[ -z "$FA" ]; check "前端无 fetch/axios 直调（一律 RTK Query）" $?

# 9 前端禁内联 style
IS=$(grep -rn 'style={{' frontend/src/screens frontend/src/components 2>/dev/null | grep -v 'allow-style' || true)
[ -z "$IS" ]; check "前端无内联 style" $?

# 10 路由树注册：screens 下每个 Screen 在 index.jsx 出现
MISSR=""
for s in frontend/src/screens/*.jsx frontend/src/screens/admin/*.jsx; do
  name=$(basename "$s" .jsx)
  grep -q "$name" frontend/src/index.jsx || MISSR="$MISSR $name"
done
[ -z "$MISSR" ]; check "所有 Screen 已在 index.jsx 路由树注册${MISSR:+（缺:$MISSR）}" $?

# 11 交付文档无模板占位符残留（活跃任务目录）
TPL_LEFT=$(grep -rln '{{' .harness/deliverables --include='*.md' 2>/dev/null | grep -v '_archive' || true)
[ -z "$TPL_LEFT" ]; check "deliverables 活跃任务无 {{}} 模板残留" $?

# 12 board.md 表格格式
grep -qE '^\| 编号 \| 任务' .harness/tasks/board.md; check "board.md 表头格式正确" $?

# 13 specs 编号唯一性 + GWT 格式（spec-lint）
python3 .harness/scripts/spec-lint.py >/dev/null 2>&1; check "specs 编号唯一 + BDD 格式（spec-lint.py）" $?

# 14 specs _index.md 与域文件一致
IDXMISS=0
for f in .harness/specs/*.md; do
  b=$(basename "$f")
  case "$b" in _index.md|_flows.md) continue ;; esac
  grep -q "$b" .harness/specs/_index.md || IDXMISS=1
done
[ "$IDXMISS" -eq 0 ]; check "specs 域文件全部登记在 _index.md" $?

# 15 memory index 与 entries 一致
MEMMISS=0
for f in .harness/memory/entries/*.md; do
  [ -e "$f" ] || continue
  b=$(basename "$f")
  grep -q "$b" .harness/memory/index.md || MEMMISS=1
done
[ "$MEMMISS" -eq 0 ]; check "memory entries 全部登记在 index.md" $?

# 16 agents 七文件齐全
AG=0
for a in project-manager business-analyst solution-architect readiness-reviewer developer code-reviewer test-engineer; do
  [ -f ".harness/agents/$a.md" ] || AG=1
done
[ "$AG" -eq 0 ]; check "agents 7 角色契约齐全" $?

# 17 hooks.json 合法 JSON
python3 -c "import json;json.load(open('.cursor/hooks.json'))" 2>/dev/null; check "hooks.json 合法 JSON" $?

# 18 后端单测（可选 --with-tests 时强制；默认存在性检查）
if [ "${1:-}" = "--with-tests" ]; then
  npx vitest run --reporter=basic >/dev/null 2>&1; check "后端单测全绿（vitest run）" $?
else
  find backend/tests -name '*.test.js' 2>/dev/null | grep -q .; check "后端测试文件存在" $?
fi

# 19 前端测试文件存在
ls frontend/src/tests/*.test.* >/dev/null 2>&1; check "前端测试文件存在" $?

echo "----------------------------------------"
if [ "$FAILS" -eq 0 ]; then
  echo "[VERIFY PASS] 全部 $N 项通过"
  exit 0
else
  echo "[VERIFY FAIL] $FAILS/$N 项未通过"
  exit 1
fi
