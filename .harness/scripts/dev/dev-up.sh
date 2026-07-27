#!/usr/bin/env bash
# 开发辅助：确保 Mongo → 种子 → 起前后端
set -euo pipefail
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$PROJECT_ROOT"
bash .harness/scripts/ensure-mongodb.sh
node backend/seeder.js
npm run dev
