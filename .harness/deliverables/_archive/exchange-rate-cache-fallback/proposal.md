# Proposal: exchange-rate-cache-fallback

> 任务目录：`.harness/deliverables/exchange-rate-cache-fallback/` ｜ 阶段：需求提出

## 背景与目标

商品价格以 USD 存储，前端需要按用户语言显示 CNY 参考价。汇率来自上游接口，上游偶发不可用会导致价格区域整体报错。目标：为 USD/CNY 汇率增加**内存快照缓存与降级策略**——上游可用时用新值并刷新快照；上游不可用时回退最近一次成功快照并明示"缓存汇率"；从未成功过则该接口返回 503，前端仅隐藏参考价并展示降级横幅，不影响下单主链路。

## 范围

### In Scope
- 后端 `GET /api/fx/usd-cny`：200（fresh/cached 标记）与 503（完全不可用）两种响应。
- fxService 内存快照（lastSuccessSnapshot）+ 定时刷新。
- 前端 fxSlice + MoneyDisplay 参考价展示 + FxStatusBarBanner 降级横幅（双语）。

### Out of Scope
- 多币种（仅 USD/CNY）。
- 汇率持久化到数据库。
- 订单金额结算变更（订单仍全程 USD）。

## 流程 profile

- [ ] **quick** — 改文案/小修小改；BA→SA（SA 文末就绪自评），跳过 RR
- [x] **standard** — 默认；BA→SA→RR 三棒齐全
- [ ] **refactor** — 跨模块重构；SA 影响面预扫描→BA→SA→RR

选择规则：动 1-2 个文件的文案/样式 → quick；新功能/改行为 → standard；跨 ≥2 个域或动公共架构 → refactor。

## 验收口径

- 上游正常：商品价格旁展示"≈ ¥xxx.xx"参考价（中文界面），接口返回 `{ rate, source: "fresh" }`。
- 上游故障但有快照：参考价照常展示，页面顶部出现"当前显示为缓存汇率 / Cached exchange rate in use"横幅（可截图验证：横幅位于 Header 下方，黄色警示样式）。
- 完全不可用（无快照）：接口 503 `{ messageKey: "fx.unavailable" }`；参考价隐藏，仅横幅提示汇率暂不可用；加购/下单不受影响。

## 风险

- 定时刷新与请求并发下的快照读写一致性（单进程内存对象，Node 单线程可接受）。
- 前端轮询频率过高造成压力（限定挂载时拉取一次 + 5 分钟间隔）。
