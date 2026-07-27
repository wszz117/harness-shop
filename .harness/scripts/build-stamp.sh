#!/usr/bin/env bash
# 前端构建 + 构建戳记录到 .reports/
set -euo pipefail
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$PROJECT_ROOT"
mkdir -p .reports
STAMP=".reports/build-stamp.txt"
echo "[..] 前端构建中..."
if (cd frontend && npm run build >/tmp/build_stamp.log 2>&1); then
  {
    echo "date: $(date -Iseconds)"
    echo "commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'no-git')"
    echo "result: PASS"
  } > "$STAMP"
  echo "[OK] 构建成功，构建戳已写 $STAMP"
else
  {
    echo "date: $(date -Iseconds)"
    echo "result: FAIL"
  } > "$STAMP"
  echo "[FAIL] 构建失败，尾部日志:"; tail -20 /tmp/build_stamp.log
  exit 1
fi
