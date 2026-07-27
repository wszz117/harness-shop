# 贡献指南（Contributing）

感谢您考虑为 Harness Shop 做出贡献！本项目本身就是"工程纪律"的示范，因此贡献流程也遵循同样的证据链文化。

## 参与方式

**报告问题（Issue）**：请使用清晰的标题，并包含复现步骤、期望行为与实际行为、环境信息（Node/MongoDB 版本、操作系统）。涉及 Harness 框架资产的问题，请注明相关文件路径（如 `.harness/scripts/verify.sh`）。

**改进文档**：文档改进是最受欢迎的入门贡献——错别字、表述不清、翻译改进、图示优化都可以直接提 PR。

**贡献代码**：请先开 Issue 讨论方案再动手，避免劳动浪费。

## 代码贡献流程

1. Fork 本仓库并创建特性分支：`git checkout -b feat/your-feature`；
2. 遵循项目代码规范（`.cursor/rules/code-standards.mdc`），核心约束包括：全栈 ESM、单文件 ≤300 行、后端 controller 必须 asyncHandler 包裹、前端数据请求必须走 RTK Query；
3. 为改动补充测试（后端 Vitest / 前端 Testing Library / 必要时 E2E）；
4. 提交前本地跑通全部门禁：

```bash
npm test && npm run test:frontend
bash .harness/scripts/verify.sh
bash .harness/scripts/check-harness.sh
```

5. 提交 PR，描述中说明：动机、改动清单、测试证据（命令输出或截图）。

## 提交信息规范

采用 Conventional Commits：`feat:` 新功能、`fix:` 缺陷修复、`docs:` 文档、`test:` 测试、`refactor:` 重构、`chore:` 杂项。示例：`feat(wishlist): add empty-state illustration`。

## 修改 Harness 框架资产的额外要求

框架资产（`.cursor/` 与 `.harness/`）是本项目的核心，修改时请注意：修改角色契约需同步检查引用它的命令文件与 GUIDE.md；修改 `verify.sh` 检查项需在 PR 中说明新增/放宽的理由；修改模板需同步更新 `_archive/` 示例任务的对照说明；规格编号遵循"全库唯一、永不复用"原则，退役编号进入 `specs/_index.md` 退役列表。

## 行为准则

请保持专业、友善、建设性的沟通。技术分歧聚焦于方案本身，用证据说话——这也是本项目的核心理念。
