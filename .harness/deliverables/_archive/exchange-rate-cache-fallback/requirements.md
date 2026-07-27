# Requirements: exchange-rate-cache-fallback

> 角色：business-analyst ｜ 上游：proposal.md ｜ 状态：完成

## Requirement: 汇率快照缓存与降级 (FX-R-001)

### Scenario: 上游可用返回新鲜汇率 (FX-S-001)
- GIVEN 上游汇率源可用
- WHEN 客户端请求 GET /api/fx/usd-cny
- THEN 返回 200，body 含 `rate`（数值）与 `source: "fresh"`
- AND 服务端内存快照被刷新为本次成功值

### Scenario: 上游故障回退缓存快照 (FX-S-002)
- GIVEN 服务端存在最近一次成功快照
- AND 上游汇率源当前不可用
- WHEN 客户端请求 GET /api/fx/usd-cny
- THEN 返回 200，body 含快照 `rate` 与 `source: "cached"` 及 `fetchedAt`

### Scenario: 完全不可用返回 503 (FX-S-003)
- GIVEN 服务端从未成功获取过汇率（无快照）
- AND 上游汇率源当前不可用
- WHEN 客户端请求 GET /api/fx/usd-cny
- THEN 返回 503，body 含 `messageKey: "fx.unavailable"`

## Requirement: 前端参考价与降级提示 (FX-R-002)

### Scenario: 缓存汇率横幅提示 (FX-S-004)
- GIVEN 汇率接口返回 `source: "cached"`
- WHEN 用户浏览任何商品页面
- THEN 页面顶部展示"当前显示为缓存汇率"横幅（英文界面为 "Cached exchange rate in use"）
- AND 商品参考价照常展示

### Scenario: 汇率不可用隐藏参考价 (FX-S-005)
- GIVEN 汇率接口返回 503
- WHEN 用户浏览商品列表或详情
- THEN CNY 参考价不展示（仅 USD 原价）
- AND 顶部横幅提示汇率暂不可用（双语）
- AND 加入购物车与下单流程不受影响

## Spec Delta

| 域 | 文件 | 变更类型 | R/S 编号 |
|-----|------|---------|---------|
| fx | specs/time-signal.md | 新增 Requirement | FX-R-001 / FX-S-001..003 |
| fx | specs/time-signal.md | 新增 Requirement | FX-R-002 / FX-S-004..005 |

## 结论

PASS: 5 个 Scenario 均可验证，编号无冲突（已核对全库与退役列表），单域归属 fx（挂靠 time-signal 支撑域文件）。
