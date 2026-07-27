#!/usr/bin/env bash
# Playwright 浏览器就绪检查
set -uo pipefail
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$PROJECT_ROOT"
if npx playwright --version >/dev/null 2>&1; then
  echo "[OK] playwright CLI 可用: $(npx playwright --version)"
else
  echo "[FAIL] playwright 未安装（npm install 后重试）"; exit 1
fi
if [ -d "$HOME/.cache/ms-playwright" ] && ls "$HOME/.cache/ms-playwright" | grep -qi chromium; then
  echo "[OK] chromium 浏览器已就绪"
else
  echo "[..] 安装 chromium..."
  npx playwright install chromium
  echo "[OK] chromium 安装完成"
fi
