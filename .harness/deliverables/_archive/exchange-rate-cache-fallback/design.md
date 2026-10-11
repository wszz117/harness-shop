# Design: exchange-rate-cache-fallback

> 角色：solution-architect ｜ 上游：proposal.md, requirements.md ｜ 状态：完成
>
> v1.1 复核修订（2026-10-11）：前端状态机由 fresh/cached/unavailable 改为 loading/available/stale/unavailable；响应示例改为真实契约；补充上游配置与启动接线（W-01）。详见 [re-verification.md](re-verification.md)。

## 方案概述

后端 `services/fxService.js` 负责上游拉取、`lastSuccessSnapshot` 内存快照与定时刷新，由 `server.js` 启动时调用 `startAutoRefresh()` 接线；`controllers/fxController.js` + `routes/fxRoutes.js` 暴露 GET /api/fx/usd-cny。前端 `slices/fxSlice.js` 维护四态状态机并在 localStorage 保存快照；`components/MoneyDisplay.jsx` 统一渲染「$X ≈ ¥Y」；`components/FxStatusBarBanner.jsx` 负责降级横幅（双语 key）。

## 状态机

| 层 | 状态 | 进入条件 | 用户可见表现 |
|----|------|---------|-------------|
| 后端 | available | 最近一次刷新成功且快照未超过 30 分钟 | 200 `state: "available"` |
| 后端 | stale | 有快照，但最近一次刷新失败或快照超过 30 分钟 | 200 `state: "stale"` |
| 后端 | （不可用） | 从未成功获取 | 503 `messageKey: "fx.unavailable"` |
| 前端 | loading | 首次请求尚未返回 | 不显示横幅；如有本地快照，参考价照常 |
| 前端 | available | 收到 `state: "available"` | 参考价，无横幅 |
| 前端 | stale | 收到 `state: "stale"`，或请求失败但有本地快照 | 参考价 + 黄色横幅 |
| 前端 | unavailable | 请求失败且无本地快照 | 仅 USD + 灰色横幅 |

## 工作项清单

| 编号 | 归属 | 文件 | 说明（关联 R/S） |
|------|------|------|-----------------|
| W-01 | Dev-owned | backend/services/fxService.js, backend/server.js | 快照缓存 + defaultFetcher（读 FX_UPSTREAM_URL）+ startAutoRefresh 启动接线（FX-S-001/002/003） |
| W-02 | Dev-owned | backend/controllers/fxController.js, backend/routes/fxRoutes.js, backend/app.js | GET /api/fx/usd-cny 200/503（FX-S-001..003） |
| W-03 | Dev-owned | frontend/src/slices/fxSlice.js | 四态状态机 + localStorage 快照（FX-S-004/005） |
| W-04 | Dev-owned | frontend/src/components/MoneyDisplay.jsx | 参考价渲染/隐藏（FX-S-001/005） |
| W-05 | Dev-owned | frontend/src/components/FxStatusBarBanner.jsx, utils/i18n.js | 双语横幅（FX-S-004/005） |
| W-06 | TE-owned | e2e/tests/fx.e2e.js | 三种状态的端到端验证与证据截图（FX-S-001..005） |

## API 设计

| 方法 | 路径 | 鉴权 | 状态码 | messageKey |
|------|------|------|--------|-----------|
| GET | /api/fx/usd-cny | 公开 | 200（available / stale）/ 503 | fx.unavailable（503 时） |

响应示例（实测）：`{ "rate": 7.25, "fetchedAt": "2026-10-11T07:08:05.430Z", "state": "available" }`

## 配置

| 变量 | 作用 | 缺省 |
|------|------|------|
| FX_UPSTREAM_URL | 上游行情源，兼容 `{ rate }` 与 `{ rates: { CNY } }` 两种响应 | 空（不走网络） |
| FX_FIXED_RATE | 未配上游时使用的固定演示汇率 | 空 |
| FX_REFRESH_INTERVAL_MS | 刷新间隔（≥ 1000） | 300000（5 分钟） |

未配置任何变量时使用内置演示汇率 7.25，保证本地开箱即用。

## 数据模型

无数据库变更（内存快照 `{ rate, fetchedAt }`，进程级单例）。

## 测试口径

### Dev 单测范围
- fxService：成功刷新快照；失败立即 stale；恢复后回到 available；无快照抛 FxUnavailableError；startAutoRefresh 首次刷新即可用；defaultFetcher 三种来源与 HTTP 错误。
- 接口契约：200 available / 200 stale / 503 messageKey。
- fxSlice：loading 初始态与三种迁移；MoneyDisplay：有率显示 `≈ ¥`、无率隐藏；FxStatusBarBanner：四态渲染与双语文案。

### Testing-only（TE E2E 验证，视觉/交互口径）
- FX-S-001：首页第一张商品卡参考价 = USD × 接口 rate（保留两位）；无横幅。
- FX-S-004：横幅在 Header 下方，`alert-warning` 黄色样式，文案「当前显示为缓存汇率」；接口直接失败时（有本地快照）表现相同。
- FX-S-005：横幅 `alert-secondary` 灰色，文案「汇率暂不可用」；页面无任何 `cny-ref`；可加购进入 /cart。
- 截图：1280×800 视口，包含 Header、横幅与首屏商品卡。

## 结论

PASS: 6 个工作项与 FX-R-001/002 全部 Scenario 双向覆盖，Dev/TE 归属无歧义，视觉口径可断言。
