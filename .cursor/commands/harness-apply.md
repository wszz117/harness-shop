# /harness-apply — 开发、审查与交付验证

`$input` = `"<英文任务名>"`。

## Re-run 检测（Step 0 之前的硬前置）

若 `.harness/deliverables/<任务名>/dev-log.md` 已存在且有实质内容 → 本次为**重跑**：必须先读上一轮 dev-log/code-review/test-report 的结论段，重派 prompt 必须携带上一轮结论全文。

## Step 0 接管

完整阅读 `.harness/agents/project-manager.md`，锁定 §7.4 反模式清单、§10.3 阅读边界、§7.1 实时事务模型。第一条 `[PM]` 行必须是 apply 入口声明心跳。

## 执行流程

1. **读 profile**：proposal.md「## 流程 profile」段为**真相源**；board.md 只是只读缓存，冲突以 proposal 为准并抛异常告警心跳。
2. **分档校验就绪背书**：
   - quick：design.md 存在 + 文末「## 就绪自评」+「## 结论」PASS（不要求 readiness-review.md）。
   - standard/refactor：readiness-review.md「## 结论」PASS。
3. **Dev 棒（节点 1/3）**：
   - `[PM] 脚本事件: board 更新 → 开始`；Edit board：阶段=开发实现，状态=IN_PROGRESS；心跳 PASS。
   - stage-doc development 开始：`bash .harness/scripts/stage-doc.sh <任务名> development` → 文档就位心跳。
   - `[PM] Task developer 开工（apply 节点 1/3）` → Task 派发：`subagent_type=developer`，prompt 首条含 TASK_NAME / PROFILE / 就绪依据 / 上一轮结论 / 必读=.harness/agents/developer.md / dev-log 路径。
   - Read dev-log.md「## 结论」→ `[PM] Task developer 收工 → <PASS|BLOCK>`。
   - **读 hook 旁路结果**（PM §5.2：Shell `cat .harness/.hook-results/<task>/developer.json`，30s 轮询，缺失按日志诊断后补齐）：
     - verdict=PASS → `[PM] Hook 旁路验证: PASS` → CR 棒
     - verdict=FAIL → 回退 Dev（带 fail_reason）
4. **CR 棒（节点 2/3）**：仅 Dev PASS + hook PASS 准入。stage-doc review → Task code-reviewer → 读 code-review.md 结论（PASS / REJECT→按 §8 回退）。
5. **TE 棒（节点 3/3）**：stage-doc testing → Task test-engineer。
   - B 类用例与 Scenario **1:1**；C 类回归最多 1-2 个相关 spec；**禁止默认全量 `npm run test:e2e`**。
   - 无环境 → test-report FAIL（环境阻塞），不得进 AWAITING_ARCHIVE。
6. **TE PASS 后**：读 TE hook 结果 → §5.3：`bash .harness/scripts/check-harness.sh` + 模板残留体检 + board 收口（AWAITING_ARCHIVE）。**停下**：不得自行 mv 归档、不得标 DONE。

## apply 出口（段末铁律）

最后一行**必须**是卡点心跳（先于任何总结，禁止用「apply 全链路完成」Markdown 段替代）：

`[PM] △ 任务 <name> 已进入人工审批 2 (AWAITING_ARCHIVE) → 请人工审阅 deliverables/<name>/，确认后运行 /harness-archive <name>`

需求级问题 → §8.2 升级给人回 propose。
