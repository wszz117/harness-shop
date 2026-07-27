#!/usr/bin/env bash
# 初始化任务目录：.harness/deliverables/<task-slug>/
# 用法: bash .harness/scripts/init-task.sh <task-slug>
set -euo pipefail

PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$PROJECT_ROOT"

TASK="${1:-}"
if [ -z "$TASK" ]; then
  echo "[FAIL] 用法: init-task.sh <task-slug>" >&2
  exit 1
fi
if ! echo "$TASK" | grep -Eq '^[a-z0-9][a-z0-9_-]*$'; then
  echo "[FAIL] 任务名必须是英文 slug（a-z0-9-_，推荐 kebab-case），收到: $TASK" >&2
  exit 1
fi

TASK_DIR=".harness/deliverables/$TASK"
if [ -d "$TASK_DIR" ]; then
  echo "[OK] 任务目录已存在: $TASK_DIR（进入修订模式，保留现有文档）"
  exit 0
fi

mkdir -p "$TASK_DIR"
sed "s/{{TASK_NAME}}/$TASK/g" .harness/templates/proposal.md > "$TASK_DIR/proposal.md"
echo "[OK] 已创建 $TASK_DIR/proposal.md（从模板）"

BOARD=".harness/tasks/board.md"
if [ -f "$BOARD" ]; then
  NEXT=$(( $(grep -cE '^\| [0-9]+ \|' "$BOARD" || true) + 1 ))
  printf '| %s | %s | 需求 | IN_PROGRESS | 待定 | — |\n' "$NEXT" "$TASK" >> "$BOARD"
  echo "[OK] board.md 已追加任务行 (编号 $NEXT)"
fi
echo "[OK] init-task 完成: $TASK"
