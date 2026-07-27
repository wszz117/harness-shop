#!/usr/bin/env bash
# 收集代码库客观事实到 .reports/codebase-guide-init-facts.txt，供 /codebase-guide-init 填表
set -euo pipefail
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$PROJECT_ROOT"
mkdir -p .reports
OUT=".reports/codebase-guide-init-facts.txt"

{
  echo "===== 收集时间 ====="; date -Iseconds
  echo; echo "===== 根 package.json ====="; cat package.json
  echo; echo "===== frontend/package.json ====="; cat frontend/package.json 2>/dev/null || echo "(无)"
  echo; echo "===== 目录树 (3 层, 排除 node_modules) ====="
  find . -maxdepth 3 -not -path '*/node_modules*' -not -path './.git*' -not -path './frontend/build*' | sort
  echo; echo "===== 后端路由文件 ====="
  for f in backend/routes/*.js; do echo "--- $f"; grep -E "router\.(get|post|put|delete)|app\.use" "$f" || true; done
  echo; echo "===== app.js 挂载 ====="; grep -E "app\.use" backend/app.js
  echo; echo "===== 前端路由树 ====="; grep -E "Route|path=" frontend/src/index.jsx || true
  echo; echo "===== slices ====="; ls frontend/src/slices/
} > "$OUT"
echo "[OK] 事实已收集到 $OUT（$(wc -l < "$OUT") 行）"
