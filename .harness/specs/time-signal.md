# Domain: time-signal（含 FX 汇率）

> 时间信号域：与时间/外部数据源相关的能力。当前包含 USD/CNY 汇率快照与降级展示。
> v1.1（2026-10-11）：统一接口契约为 `{ rate, fetchedAt, state }`，场景编号与归档任务 exchange-rate-cache-fallback 对齐为 FX-S-001..005。

## Requirement: 汇率快照缓存与降级 (FX-R-001)

### Scenario: 上游可用返回新鲜汇率 (FX-S-001)
- GIVEN 上游汇率源可用
- WHEN 客户端请求 GET /api/fx/usd-cny
- THEN 返回 200 `{ rate, fetchedAt, state: "available" }`
- AND 服务端内存快照（lastSuccessSnapshot）被刷新为本次成功值

### Scenario: 上游故障回退缓存快照 (FX-S-002)
- GIVEN 服务端存在最近一次成功快照
- AND 最近一次上游刷新失败（或快照超过 30 分钟未更新）
- WHEN 客户端请求 GET /api/fx/usd-cny
- THEN 返回 200 `{ rate: <快照值>, fetchedAt, state: "stale" }`；快照不清空

### Scenario: 完全不可用返回 503 (FX-S-003)
- GIVEN 服务端从未成功获取过汇率（无快照）
- WHEN 客户端请求 GET /api/fx/usd-cny
- THEN 返回 503 `{ messageKey: "fx.unavailable" }`

## Requirement: 前端参考价与降级提示 (FX-R-002)

### Scenario: 缓存汇率横幅提示 (FX-S-004)
- GIVEN 接口返回 `state: "stale"`，或接口请求失败但浏览器 localStorage `fx_cmd_cny_snapshot` 存有历史快照
- WHEN 用户浏览任何页面
- THEN Header 下方展示黄色横幅「当前显示为缓存汇率」（英文界面 "Cached exchange rate in use"）
- AND 所有金额照常展示「$X ≈ ¥Y」参考价（统一经 MoneyDisplay 组件）
- AND 首次请求返回前处于 loading 态，不展示任何横幅（不闪烁不清空）

### Scenario: 汇率不可用隐藏参考价 (FX-S-005)
- GIVEN 接口返回 503 且浏览器无历史快照
- WHEN 用户浏览商品列表、详情或购物车
- THEN 只展示 USD 原价，不展示 ¥ 参考价
- AND Header 下方展示灰色横幅「汇率暂不可用」（英文界面 "Exchange rate unavailable"）
- AND 加入购物车与下单流程不受影响

## 边界说明

- 快照为进程级内存对象，多实例部署时各实例独立刷新（当前单进程部署，接受）。
- 上游来源优先级：`FX_UPSTREAM_URL` > `FX_FIXED_RATE` > 内置演示汇率 7.25；刷新间隔 `FX_REFRESH_INTERVAL_MS`（默认 5 分钟）。

## 退役列表

| 编号 | 名称 | 退役日期 | 原因 |
|------|------|---------|------|
| （空） | | | |
