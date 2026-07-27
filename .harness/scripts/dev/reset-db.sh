#!/usr/bin/env bash
# 开发辅助：清库重灌种子数据
set -euo pipefail
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$PROJECT_ROOT"
bash .harness/scripts/ensure-mongodb.sh
node backend/seeder.js
echo "[OK] 种子数据已重灌"
