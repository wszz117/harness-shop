#!/usr/bin/env bash
# Harness 结构完整性体检：130+ 项。全过退出 0。
set -uo pipefail
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$PROJECT_ROOT"
FAILS=0; N=0
ok()   { N=$((N+1)); printf '[PASS] %03d %s\n' "$N" "$1"; }
bad()  { N=$((N+1)); printf '[FAIL] %03d %s\n' "$N" "$1"; FAILS=$((FAILS+1)); }
need_f(){ [ -f "$1" ] && ok "文件 $1" || bad "文件缺失 $1"; }
need_d(){ [ -d "$1" ] && ok "目录 $1" || bad "目录缺失 $1"; }
need_x(){ [ -x "$1" ] && ok "可执行 $1" || bad "缺可执行位 $1"; }
need_grep(){ grep -q "$2" "$1" 2>/dev/null && ok "$1 含「$3」" || bad "$1 缺「$3」"; }

# --- 顶层 ---
for d in .harness .cursor backend frontend e2e mcp-server; do need_d "$d"; done
for f in .harness/GUIDE.md .harness/knowledge-engineering.md .harness/multi-repo-adaptation.md .harness/baseline.json; do need_f "$f"; done

# --- agents 7 ---
for a in project-manager business-analyst solution-architect readiness-reviewer developer code-reviewer test-engineer; do
  need_f ".harness/agents/$a.md"
done
need_grep .harness/agents/project-manager.md '§7.2' 'PM 四条铁律锚点'
need_grep .harness/agents/developer.md 'TDD' 'Dev TDD 强制'
need_grep .harness/agents/test-engineer.md '1:1' 'TE B类 1:1 纪律'

# --- commands 4 ---
for c in harness-propose harness-apply harness-archive codebase-guide-init; do
  need_f ".cursor/commands/$c.md"
done
need_grep .cursor/commands/harness-propose.md '硬红线' 'propose 禁触源码红线'
need_grep .cursor/commands/harness-apply.md 'AWAITING_ARCHIVE' 'apply 卡点心跳'

# --- rules 3 ---
for r in harness-core code-standards workflow-discipline; do
  need_f ".cursor/rules/$r.mdc"
done

# --- skills 5 ---
for s in build-test post-verify code-review test-e2e systematic-debug; do
  need_f ".cursor/skills/$s/SKILL.md"
done

# --- hooks ---
need_f .cursor/hooks.json
python3 -c "import json;json.load(open('.cursor/hooks.json'))" 2>/dev/null && ok "hooks.json JSON 合法" || bad "hooks.json JSON 非法"
for h in dispatch-subagent.py dispatch-prompt.py session-node-env.py _subagent_payload.py _actions_developer.py _actions_tester.py _node_path.py; do
  need_f ".cursor/hooks/$h"
done
for k in sessionStart subagentStop beforeSubmitPrompt; do
  need_grep .cursor/hooks.json "$k" "hooks.json 事件 $k"
done

# --- scripts 13 ---
for s in init-task.sh stage-doc.sh verify.sh check-harness.sh backend-smoke.sh baseline.sh build-stamp.sh ensure-mongodb.sh ensure-playwright.sh codebase-guide-init.sh; do
  need_x ".harness/scripts/$s"
done
for s in check-e2e-evidence.py spec-lint.py; do need_f ".harness/scripts/$s"; done
need_d .harness/scripts/dev

# --- specs ---
for f in _index.md _flows.md products.md orders.md user-auth.md wishlist.md i18n.md time-signal.md; do
  need_f ".harness/specs/$f"
done
python3 .harness/scripts/spec-lint.py >/dev/null 2>&1 && ok "spec-lint 全过" || bad "spec-lint 未过"

# --- templates ---
for t in proposal.md requirements.md design.md readiness-review.md dev-log.md code-review.md test-report.md impact-analysis.md; do
  need_f ".harness/templates/$t"
done
need_d .harness/templates/codebase-guide-skeletons

# --- codebase-guide 6 ---
for f in index.md overview.md backend-arch.md frontend-arch.md deps.md dev-recipes.md; do
  need_f ".harness/codebase-guide/$f"
done

# --- memory ---
need_f .harness/memory/index.md
need_f .harness/memory/templates/entry.md
need_d .harness/memory/entries

# --- workflow / tasks / eval ---
need_f .harness/workflow/transitions.json
python3 -c "import json;json.load(open('.harness/workflow/transitions.json'))" 2>/dev/null && ok "transitions.json JSON 合法" || bad "transitions.json JSON 非法"
need_f .harness/workflow/subagent-orchestration.md
need_f .harness/tasks/board.md
need_f .harness/eval-design/README.md
need_d .harness/deliverables
need_d .harness/.hook-logs
need_d .harness/.hook-results

# --- 业务代码结构 ---
for f in backend/server.js backend/app.js backend/config/db.js backend/seeder.js; do need_f "$f"; done
for f in backend/models/userModel.js backend/models/productModel.js backend/models/orderModel.js; do need_f "$f"; done
for f in productRoutes userRoutes orderRoutes fxRoutes uploadRoutes; do need_f "backend/routes/$f.js"; done
for f in productController userController orderController fxController; do need_f "backend/controllers/$f.js"; done
for f in authMiddleware checkObjectId errorMiddleware asyncHandler; do need_f "backend/middleware/$f.js"; done
for f in calcPrices productI18n generateToken; do need_f "backend/utils/$f.js"; done
need_f backend/services/fxService.js
need_f frontend/src/index.jsx
need_f frontend/src/store.js
need_f frontend/src/utils/i18n.js
for s in apiSlice authSlice cartSlice languageSlice fxSlice productsApiSlice usersApiSlice ordersApiSlice; do
  need_f "frontend/src/slices/$s.js"
done
need_f e2e/playwright.config.js
need_f mcp-server/index.js
need_f .cursor/mcp.json

# --- 归档证据为真实截图（v1.1：拒绝 1x1 占位图冒充证据） ---
python3 .harness/scripts/check-e2e-evidence.py check-archived-all >/dev/null 2>&1 \
  && ok "归档任务 E2E 证据截图齐全且非占位图" || bad "归档证据截图缺失或为占位图（运行 check-e2e-evidence.py check-archived-all 查看）"
# --- 模板残留（活跃任务） ---
LEFT=$(grep -rln '{{' .harness/deliverables --include='*.md' 2>/dev/null | grep -v _archive || true)
[ -z "$LEFT" ] && ok "deliverables 活跃任务无模板残留" || bad "模板残留: $LEFT"

echo "----------------------------------------"
if [ "$FAILS" -eq 0 ]; then
  echo "[CHECK-HARNESS PASS] 全部 $N 项通过"
  exit 0
else
  echo "[CHECK-HARNESS FAIL] $FAILS/$N 项未通过"
  exit 1
fi
