# Requirements: exchange-rate-cache-fallback

> 角色：business-analyst ｜ 上游：proposal.md ｜ 状态：完成
>
> v1.1 复核修订（2026-10-11）：接口契约统一为 `{ rate, fetchedAt, state: "available" | "stale" }`（v1.0 原文为 `source: "fresh" | "cached"`，与代码不一致）；FX-S-002 明确"上游刚失败即标记 stale"；FX-S-004 补充 loading 态不闪烁。修订原因与实测记录见 [re-verification.md](re-verification.md)，修订前原文见 tag `v1.0.0-original`。

## Requirement: 汇率快照缓存与降级 (FX-R-001)

### Scenario: 上游可用返回新鲜汇率 (FX-S-001)
- GIVEN 上游汇率源可用
- WHEN 客户端请求 GET /api/fx/usd-cny
- THEN 返回 200 `{ rate, fetchedAt, state: "available" }`
- AND 服务端内存快照被刷新为本次成功值

### Scenario: 上游故障回退缓存快照 (FX-S-002)
- GIVEN 服务端存在最近一次成功快照
- AND 最近一次上游刷新失败（或快照超过 30 分钟未更新）
- WHEN 客户端请求 GET /api/fx/usd-cny
- THEN 返回 200 `{ rate: <快照值>, fetchedAt, state: "stale" }`，快照不清空

### Scenario: 完全不可用返回 503 (FX-S-003)
- GIVEN 服务端从未成功获取过汇率（无快照）
- WHEN 客户端请求 GET /api/fx/usd-cny
- THEN 返回 503 `{ messageKey: "fx.unavailable" }`

## Requirement: 前端参考价与降级提示 (FX-R-002)

### Scenario: 缓存汇率横幅提示 (FX-S-004)
- GIVEN 接口返回 `state: "stale"`，或接口请求失败但浏览器存有历史快照
- WHEN 用户浏览任何页面
- THEN Header 下方展示黄色横幅「当前显示为缓存汇率」（英文 "Cached exchange rate in use"）
- AND 商品参考价照常展示「$X ≈ ¥Y」
- AND 首次请求返回前不展示任何横幅（不闪烁）

### Scenario: 汇率不可用隐藏参考价 (FX-S-005)
- GIVEN 接口返回 503 且浏览器无历史快照
- WHEN 用户浏览商品列表、详情或购物车
- THEN 只展示 USD 原价，不展示 ¥ 参考价
- AND Header 下方展示灰色横幅「汇率暂不可用」（英文 "Exchange rate unavailable"）
- AND 加入购物车与下单流程不受影响

## Spec Delta

| 域 | 文件 | 变更类型 | R/S 编号 |
|-----|------|---------|---------|
| fx | specs/time-signal.md | 新增 Requirement | FX-R-001 / FX-S-001..003 |
| fx | specs/time-signal.md | 新增 Requirement | FX-R-002 / FX-S-004..005 |

## 结论

PASS: 5 个 Scenario 均可验证，编号无冲突（spec-lint 通过），单域归属 fx（挂靠 time-signal 支撑域文件）；与 specs/time-signal.md 逐条一致。
