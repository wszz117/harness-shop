# Design: exchange-rate-cache-fallback

> 角色：solution-architect ｜ 上游：proposal.md, requirements.md ｜ 状态：完成

## 方案概述

后端新增 `services/fxService.js`（上游拉取 + lastSuccessSnapshot 内存快照 + 定时刷新）与 `controllers/fxController.js` + `routes/fxRoutes.js`（GET /api/fx/usd-cny）。前端新增 `slices/fxSlice.js`（挂载拉取 + 5 分钟轮询 + 状态三态 fresh/cached/unavailable）、`components/MoneyDisplay.jsx`（USD 主价 + CNY 参考价）、`components/FxStatusBarBanner.jsx`（降级横幅，双语 key）。

## 工作项清单

| 编号 | 归属 | 文件 | 说明（关联 R/S） |
|------|------|------|-----------------|
| W-01 | Dev-owned | backend/services/fxService.js | 快照缓存 + fetchUsdCny + startAutoRefresh（FX-S-001/002/003） |
| W-02 | Dev-owned | backend/controllers/fxController.js, backend/routes/fxRoutes.js, backend/app.js | GET /api/fx/usd-cny 200/503（FX-S-001..003） |
| W-03 | Dev-owned | frontend/src/slices/fxSlice.js | 三态状态机 + 轮询（FX-S-004/005） |
| W-04 | Dev-owned | frontend/src/components/MoneyDisplay.jsx | 参考价渲染/隐藏（FX-S-005） |
| W-05 | Dev-owned | frontend/src/components/FxStatusBarBanner.jsx, utils/i18n.js | 双语横幅（FX-S-004/005） |
| W-06 | TE-owned | e2e（视觉口径） | 横幅视觉与参考价展示 E2E 验证（FX-S-004/005） |

## API 设计

| 方法 | 路径 | 鉴权 | 状态码 | messageKey |
|------|------|------|--------|-----------|
| GET | /api/fx/usd-cny | 公开 | 200（fresh/cached）/ 503 | fx.unavailable（503 时） |

响应示例：`{ "rate": 7.2312, "source": "fresh", "fetchedAt": "2026-05-19T08:00:00Z" }`

## 数据模型

无数据库变更（内存快照对象 `{ rate, fetchedAt }`，进程级单例）。

## 测试口径

### Dev 单测范围
- fxService：上游成功刷新快照；上游失败回退快照；无快照抛 FxUnavailableError。
- fxController：三种响应形态（200 fresh / 200 cached / 503 messageKey）。
- fxSlice：三态 reducer；MoneyDisplay：有率显示参考价、无率隐藏。

### Testing-only（仅 TE E2E 可验证，逐条给出视觉/交互口径）
- FX-S-004：横幅出现在 Header 下方，警示（黄色）样式，中文文案「当前显示为缓存汇率」；截图需包含 Header + 横幅父容器。
- FX-S-005：503 时商品卡片价格区域仅有 USD 价（无 ≈ ¥ 前缀参考价）；横幅文案「汇率暂不可用」；加购按钮可点击进入 /cart。

## 结论

PASS: 6 个工作项与 FX-R-001/002 全部 Scenario 双向覆盖，Dev/TE 归属无歧义，视觉口径已写明。
