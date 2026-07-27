# Code Review: exchange-rate-cache-fallback

> 角色：code-reviewer ｜ 上游：requirements/design/readiness-review/dev-log ｜ 状态：完成

## 0. Review 范围

dev-log 变更清单 10 个文件（后端 4 + 前端 4 + 测试 2 组），逐文件 Read 审查。

## 1. 需求覆盖审查

| Scenario | 归属 | 判定 | 证据（文件:行号） |
|----------|------|------|-------------------|
| FX-S-001 | Dev | PASS | fxService.js:31-42 成功路径刷新快照；fxController.js:12-18 source:"fresh" |
| FX-S-002 | Dev | PASS | fxService.js:44-52 catch 分支回退 lastSuccessSnapshot；fxController.js:19-24 source:"cached" |
| FX-S-003 | Dev | PASS | fxService.js:53-56 无快照抛 FxUnavailableError；fxController.js:25-30 res.status(503) + messageKey |
| FX-S-004 | Dev(渲染)/TE(视觉) | PASS | FxStatusBarBanner.jsx:14-22 cached 分支双语文案 |
| FX-S-005 | Dev(渲染)/TE(视觉) | PASS | MoneyDisplay.jsx:18-24 rate 空时仅渲染 USD |

## 2. 需求覆盖矩阵

| R/S | W-xx | 文件 | 覆盖 |
|-----|------|------|------|
| FX-S-001..003 | W-01/W-02 | fxService/fxController/fxRoutes/app.js | PASS |
| FX-S-004 | W-03/W-05 | fxSlice/FxStatusBarBanner/i18n | PASS |
| FX-S-005 | W-03/W-04/W-05 | fxSlice/MoneyDisplay/FxStatusBarBanner | PASS |

无「无需求的实现」与「无实现的需求」。

## 3. TDD 证据核对

dev-log 4 条红绿记录与测试文件实际存在性一致；断言针对行为（source 字段、状态机迁移、DOM 有无），非实现细节。红记录含真实失败输出，可信。

## 4. 方案一致性

实现与 design W-01..W-05 一致；未发现未记录的偏离。fxService 增加 `setUpstreamFetcher` 注入点，dev-log「可复用经验」有记录，属测试性增强，接受。

## 5. 代码质量

分层清晰（routes→controllers→services），错误类型显式（FxUnavailableError），无重复代码；命名与现有代码风格一致。

## 6. 技术债

无新增。轮询间隔常量建议后续提为环境变量（已在 .env.example 中体现，闭环）。

## 7. 安全

公开只读接口，无注入面；未泄露上游凭据（FX_UPSTREAM_URL 走 env）。

## 8. 性能

内存快照读 O(1)；轮询 5 分钟一次，压力可忽略。

## 9. 规范符合（code-standards 逐条）

ESM ✓；asyncHandler ✓；messageKey ✓；RTK/slice 模式 ✓（fxSlice 为 createAsyncThunk，属状态机而非数据缓存，符合约定豁免）；无内联 style ✓；文件均 <300 行 ✓；无 console.log ✓。

## 10. 遗留风险

多实例部署时快照不共享（当前单进程部署，接受；已记入 specs 边界说明）。

## 11. 建议

无阻塞性建议。

## 12. 结论

PASS: 5/5 Scenario 覆盖有证据，TDD 可信，无 Dev-owned 问题。
