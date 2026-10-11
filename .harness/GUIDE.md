# Harness 工程指南（GUIDE）

> 本文件是整个 `.harness/` 工程的总纲。新成员（工程师或 AI 代理）接手本仓库前必读。

## 一、为什么要建设 Harness

大模型编码智能体（Coding Agent）在真实工程中存在四类**结构性约束**，单靠提示词无法根治：

| # | 结构性约束 | 典型表现 |
|---|-----------|---------|
| 1 | **规则遗忘** | 上下文变长后，早期约定的规范被稀释、遗忘，行为漂移 |
| 2 | **约束规避** | 遇到障碍时倾向绕开约束走捷径（跳过测试、硬编码、注释掉校验） |
| 3 | **自审失效** | 让智能体审查自己写的代码，倾向自我辩护而非发现问题 |
| 4 | **虚报完成** | 「我已经完成了」「测试应该能过」——口头汇报与真实状态脱节 |

> **智能体的能力上限取决于模型；交付质量的下限取决于流程。**

Harness 的目标不是提升能力上限，而是**抬高质量下限**：把「口头承诺」替换为「退出码与证据链」。任何一步的完成判定，都必须由脚本退出码、测试输出、截图证据来背书，而不是由智能体的自我陈述来背书。这是本工程的核心范式转换。

## 二、目录导览

| 目录/文件 | 作用 |
|-----------|------|
| `GUIDE.md` | 本文件，总纲 |
| `knowledge-engineering.md` | 知识工程方法论：specs / codebase-guide / memory 三库如何演进 |
| `multi-repo-adaptation.md` | 如何把本 Harness 移植到其他仓库 |
| `baseline.json` | 质量基线（测试数量、通过率），防止交付倒退 |
| `agents/` | 7 个 AI 角色契约（PM/BA/SA/RR/Dev/CR/TE），角色的「岗位说明书」 |
| `codebase-guide/` | 代码知识库：架构地图 + 调用链 + 开发菜谱（aider 风格） |
| `specs/` | 业务域规格：BDD Scenario + 唯一编号（R-xxx/S-xxx），系统行为的唯一真相源 |
| `memory/` | 经验记忆库：症状/根因/修复/防复发 四段式条目 |
| `deliverables/` | 任务交付物：每个任务一个目录，7 份文档 + 证据；完结后进 `_archive/` |
| `templates/` | 全部文档模板（填表逻辑：智能体只填空，不自由发挥） |
| `tasks/board.md` | 任务看板（只读缓存，真相源是 proposal.md） |
| `workflow/` | 状态机定义（transitions.json）与子代理编排说明 |
| `scripts/` | 硬门禁脚本：verify.sh(19 项)、check-harness.sh(134 项)等，退出码即判定 |
| `eval-design/` | 评估设计：过程指标与结果指标 |
| `training/` | 培训材料 |

## 三、工作流状态机

一个任务从提出到归档经过 **8 个阶段**：

```
需求(REQUIREMENTS) → 方案(DESIGN) → 就绪评审(READINESS)
   → 开发(DEVELOPMENT) → 审查(CODE_REVIEW) → 交付验证(TESTING)
   → AWAITING_ARCHIVE(人工审批2) → DONE
```

三条命令驱动状态机：

| 命令 | 阶段 | 参与角色 | 出口 |
|------|------|---------|------|
| `/harness-propose` | 需求→方案→就绪评审 | PM 调度 BA→SA→(RR) | **人工审批 1** |
| `/harness-apply` | 开发→审查→交付验证 | PM 调度 Dev→CR→TE | **人工审批 2**（AWAITING_ARCHIVE） |
| `/harness-archive` | 归档 | PM 独自执行 | Spec Merge + Memory Merge + DONE |

### 流程 Profile

| Profile | 适用 | propose 链 | apply 链 | 备注 |
|---------|------|-----------|----------|------|
| **quick** | 改文案、小修小改 | BA→SA | Dev→CR→TE | 跳过 RR，由 SA 在 design.md 文末做「就绪自评」 |
| **standard** | 默认 | BA→SA→RR | Dev→CR→TE | 三棒齐全 |
| **refactor** | 跨模块重构 | SA(impact-analysis)→BA→SA→RR | Dev→CR→TE | SA 先做影响面预扫描 |

Profile 在 proposal.md 的「## 流程 profile」勾选，**proposal.md 是唯一真相源**，board.md 只是只读缓存。

## 四、四层防线

| 层 | 机制 | 约束强度 | 位置 |
|----|------|---------|------|
| 1 | **rules**（.cursor/rules/*.mdc） | 软约束：始终在上下文中的编码规范 | 随上下文注入 |
| 2 | **skills**（.cursor/skills/*/SKILL.md） | SOP：标准操作手册，按需加载 | 显式调用 |
| 3 | **hooks**（.cursor/hooks.json + 派发脚本） | 旁路验证：子代理停止时在进程外跑测试，不受上下文污染 | 事件触发 |
| 4 | **scripts**（.harness/scripts/*.sh/py） | 硬门禁：退出码 0/1，不容商量 | 命令流程强制调用 |

层级越往下，约束越硬。智能体可以「忘掉」规则，但骗不过退出码。

## 五、PM 输出纪律（六类心跳）

PM 在调度过程中只允许输出六类 `[PM]` 单行心跳，禁止长篇总结：

| 心跳类型 | 格式示例 |
|---------|---------|
| Profile 识别 | `[PM] Profile 识别: standard（依据 proposal.md ## 流程 profile）` |
| 文档就位 | `[PM] 文档就位: dev-log.md 已从模板创建` |
| Task 开工 | `[PM] Task developer 开工（apply 节点 1/3）` |
| 脚本事件 | `[PM] 脚本事件: stage-doc.sh development → OK` |
| Task 收工 | `[PM] Task developer 收工 → PASS` |
| 异常告警 | `[PM] ⚠ hook 旁路结果缺失，按日志诊断补跑 verify` |

出口卡点心跳（apply 最后一行）：
`[PM] △ 任务 <name> 已进入人工审批 2 (AWAITING_ARCHIVE) → 请人工审阅 deliverables/<name>/，确认后运行 /harness-archive <name>`

## 六、与 OpenSpec 的对比

| 维度 | OpenSpec | 本 Harness |
|------|----------|-----------|
| 交付验证 | 依赖人审 | 脚本退出码 + hook 旁路 + 证据截图 |
| 操作标准化 | 提示词约定 | skills SOP + 模板填表 |
| 行为约束 | 无强制 | rules + hooks + PM 反模式清单 |
| 测试体系 | 未强制 | TDD 强制 + B 类 E2E 与 Scenario 1:1 |
| 知识持久化 | spec 单库 | specs + codebase-guide + memory 三库 |
| 产出规范 | 自由文本 | 7 份模板文档 + 唯一编号 + 结论段 |
