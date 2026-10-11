# Code Review: exchange-rate-cache-fallback

> 角色：code-reviewer ｜ 上游：requirements/design/readiness-review/dev-log ｜ 状态：完成
>
> v1.1 复核修订（2026-10-11）：v1.0 审查引用的行号与 `source` 字段在代码中不存在，且漏审了"启动未接线"这一阻塞问题。本版本按当前代码逐行复核，行号均可直接打开核对。

## 0. Review 范围

dev-log 变更清单 10 个文件（后端 2 + 前端 4 + 测试 4），逐文件 Read 审查；另核对 fxController.js / fxRoutes.js / app.js 未变更部分。

## 1. 需求覆盖审查

| Scenario | 归属 | 判定 | 证据（文件:行号） |
|----------|------|------|-------------------|
| FX-S-001 | Dev | PASS | fxService.js:26-34 成功路径刷新快照并清除 lastError；fxService.js:51-54 返回 state "available"；fxController.js:11-12 |
| FX-S-002 | Dev | PASS | fxService.js:35-40 失败时记录 lastError 并保留快照；fxService.js:48-53 lastError 或超 30 分钟即 "stale" |
| FX-S-003 | Dev | PASS | fxService.js:44-47 无快照抛 FxUnavailableError；fxController.js:14-18 返回 503 + messageKey |
| 启动接线 | Dev | PASS | server.js:12 `fxService.startAutoRefresh()`；fxService.js:58-64 首次刷新 + 定时器 unref |
| 上游配置 | Dev | PASS | fxService.js:79-89 FX_UPSTREAM_URL > FX_FIXED_RATE > 7.25；HTTP 错误抛出后由 refresh 降级 |
| FX-S-004 | Dev(渲染)/TE(视觉) | PASS | fxSlice.js:22 初始 loading；fxSlice.js:39-41 失败有快照 → stale；FxStatusBarBanner.jsx:18 loading/available 不渲染；:22 stale → warning |
| FX-S-005 | Dev(渲染)/TE(视觉) | PASS | MoneyDisplay.jsx:16-20 无 rate 不渲染 cny-ref；FxStatusBarBanner.jsx:22-28 unavailable → secondary + 文案 |

## 2. 需求覆盖矩阵

| R/S | W-xx | 文件 | 覆盖 |
|-----|------|------|------|
| FX-S-001..003 | W-01/W-02 | fxService / server / fxController / fxRoutes / app.js | PASS |
| FX-S-004 | W-03/W-05 | fxSlice / FxStatusBarBanner / i18n | PASS |
| FX-S-005 | W-03/W-04/W-05 | fxSlice / MoneyDisplay / FxStatusBarBanner | PASS |

无"无需求的实现"与"无实现的需求"。

## 3. TDD 证据核对

dev-log 8 条红绿记录与测试文件逐条对应，红输出为真实断言失败（非"文件不存在"类伪红）。断言针对行为：接口 state 字段、状态迁移、DOM 中 `cny-ref` 与 `fx-banner` 的有无与文案。

## 4. 方案一致性

实现与 design W-01..W-05 一致。spec、requirements、design、代码四处契约统一为 `state: available | stale`。

## 5. 代码质量

分层清晰（routes → controllers → services）；错误类型显式（FxUnavailableError）；定时器可停止、`unref` 不阻塞进程退出；无重复代码。

## 6. 技术债

无新增。

## 7. 安全

公开只读接口，无注入面；上游地址走环境变量，请求设置超时。

## 8. 性能

快照读 O(1)；后端 5 分钟刷新一次；前端每次页面加载请求一次，压力可忽略。

## 9. 规范符合（code-standards 逐条）

ESM ✓；asyncHandler ✓；messageKey ✓；RTK Query + slice 模式 ✓；无内联 style ✓；文件均 < 300 行 ✓；无 console.log ✓。

## 10. 遗留风险

多实例部署时快照不共享（当前单进程部署，接受；已记入 specs 边界说明）。

## 11. 复核结论附注

v1.0 审查标记 PASS，但单测全绿掩盖了"启动未接线"。v1.1 把行为探测加入 backend-smoke.sh，并由收工 hook 强制执行，已实测能拦截同类问题（见 [re-verification.md](re-verification.md) 场景 1）。

## 12. 结论

PASS: 5/5 Scenario 及启动接线、上游配置均有可核对证据，TDD 可信，无 Dev-owned 问题。
