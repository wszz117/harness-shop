# /harness-propose — 需求提出与方案设计

`$input` = `"<英文任务名> <需求描述>"`（首次）或 `"<英文任务名>"`（修订模式）。

## 硬红线（全程有效，违反任一条 → 停手自纠回 Step 3）

1. **全程禁触源码**：`frontend/ backend/ mcp-server/ e2e/` 下的 `.js/.jsx/.ts/.tsx/.css/.scss` 一律不碰；`package.json` 只读。
2. 仅允许写 `.harness/deliverables/<任务名>/*.md`（以及 board.md 状态行）。
3. TASK_NAME 强制英文 slug（`a-z0-9-_`，推荐 kebab-case）。

## 执行流程

1. **解析 $input**：拆出任务名与需求描述；任务名不合法 → 直接纠正用户。
2. **初始化**：`bash .harness/scripts/init-task.sh <任务名>`（目录已存在 → 自动进入修订模式）。
3. **打磨 proposal**（有需求描述时）：读 `.harness/specs/_index.md` 与 `.harness/codebase-guide/index.md` + `overview.md` → 生成 proposal.md 初稿交用户打磨。**模糊点（范围/口径/验收）必须反向澄清，禁止脑补**。
4. **修订模式**：基于已有 proposal 重新打磨后重跑后续棒次。
5. **用户对 proposal 满意后切换 PM**：
   - 完整阅读 `.harness/agents/project-manager.md`；按 §3.2 输出扮演声明（内部默念 §7.2 四条铁律，不打印）。
   - 第一条 `[PM]` 行必须是 §3.3 Profile 识别心跳。
   - 按 §7.3 实时事务模型调度（一心跳一动作）：
     - **quick**：BA → SA（design.md 文末含「## 就绪自评」）
     - **standard**：BA → SA → RR
     - **refactor**：SA 影响面预扫描（§4.1，产出 impact-analysis.md）→ BA → SA → RR
   - Task 串行派发；`subagent_type=<worker>` 必须写进 Task 参数；每棒收工读产出文档「## 结论」。
6. **出口（人工审批 1）**：
   `[PM] △ 任务 <name> 方案就绪 → 请人工审阅 deliverables/<name>/，确认后运行 /harness-apply <name>`
