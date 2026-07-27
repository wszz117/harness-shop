# Domain: time-signal（含 FX 汇率）

> 时间信号域：与时间/外部数据源相关的能力。当前包含 USD/CNY 汇率快照与降级展示。

## Requirement: 汇率快照服务 (FX-R-001)

### Scenario: 汇率可用返回快照 (FX-S-001)
- GIVEN fxService 存在最近一次成功快照（lastSuccessSnapshot）
- WHEN GET /api/fx/usd-cny
- THEN 返回 200 `{ rate, fetchedAt, stale }`；上游临时失败但有历史快照时 stale=true（快照降级，不清空）

### Scenario: 完全不可用返回 503 (FX-S-002)
- GIVEN 服务从未成功获取过汇率（无历史快照）
- WHEN GET /api/fx/usd-cny
- THEN 返回 503，messageKey `fx.unavailable`

## Requirement: 全站金额一致展示 (FX-R-002)

### Scenario: 金额组件三态渲染 (FX-S-003)
- GIVEN 前端 fxSlice 状态为 available / stale / unavailable 之一
- WHEN 任意页面渲染金额
- THEN 统一经 MoneyDisplay 组件：available/stale 展示「$X (≈¥Y)」；unavailable 仅展示「$X」
- AND stale 时顶栏展示降级横幅（FxStatusBanner），提示汇率为历史快照

### Scenario: 前端快照本地持久化 (FX-S-004)
- GIVEN 前端曾成功获取汇率
- WHEN 后续请求失败
- THEN 使用 localStorage `fx_cmd_cny_snapshot` 的历史快照进入 stale 态，不闪烁不清空

## 退役列表

| 编号 | 名称 | 退役日期 | 原因 |
|------|------|---------|------|
| （空） | | | |
