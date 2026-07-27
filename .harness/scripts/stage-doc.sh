#!/usr/bin/env bash
# 按阶段从模板创建交付文档（已存在则保留）
# 用法: bash .harness/scripts/stage-doc.sh <task-slug> <stage>
set -euo pipefail
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$PROJECT_ROOT"

TASK="${1:-}"; STAGE="${2:-}"
[ -z "$TASK" ] || [ -z "$STAGE" ] && { echo "[FAIL] 用法: stage-doc.sh <task> <stage>" >&2; exit 1; }

case "$STAGE" in
  requirements) TPL="requirements.md" ;;
  design)       TPL="design.md" ;;
  readiness)    TPL="readiness-review.md" ;;
  development)  TPL="dev-log.md" ;;
  review)       TPL="code-review.md" ;;
  testing)      TPL="test-report.md" ;;
  impact)       TPL="impact-analysis.md" ;;
  *) echo "[FAIL] 未知 stage: $STAGE (requirements|design|readiness|development|review|testing|impact)" >&2; exit 1 ;;
esac

TASK_DIR=".harness/deliverables/$TASK"
[ -d "$TASK_DIR" ] || { echo "[FAIL] 任务目录不存在: $TASK_DIR（先跑 init-task.sh）" >&2; exit 1; }

DEST="$TASK_DIR/$TPL"
if [ -f "$DEST" ]; then
  echo "[OK] $DEST 已存在 (保留现有内容)"
else
  sed "s/{{TASK_NAME}}/$TASK/g" ".harness/templates/$TPL" > "$DEST"
  echo "[OK] 已创建 $DEST（从模板 $TPL）"
fi
