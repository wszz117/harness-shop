# Proposal: {{TASK_NAME}}

> 任务目录：`.harness/deliverables/{{TASK_NAME}}/` ｜ 阶段：需求提出

## 背景与目标

<!-- 一段话：为什么做、做成什么样算成 -->
{{BACKGROUND}}

## 范围

### In Scope
- {{IN_SCOPE}}

### Out of Scope
- {{OUT_OF_SCOPE}}

## 流程 profile

<!-- 勾选一个；本段是 profile 的唯一真相源，board.md 只是缓存 -->
- [ ] **quick** — 改文案/小修小改；BA→SA（SA 文末就绪自评），跳过 RR
- [x] **standard** — 默认；BA→SA→RR 三棒齐全
- [ ] **refactor** — 跨模块重构；SA 影响面预扫描→BA→SA→RR

选择规则：动 1-2 个文件的文案/样式 → quick；新功能/改行为 → standard；跨 ≥2 个域或动公共架构 → refactor。

## 验收口径

<!-- 用户可观察的验收标准；含视觉/交互项必须写明可截图验证的口径 -->
- {{ACCEPTANCE}}

## 风险

- {{RISKS}}
