# Dev Log: exchange-rate-cache-fallback

> 角色：developer ｜ Dev-owned：FX-S-001..005（W-01..W-05） ｜ 状态：完成

## 实现摘要

按 design W-01..W-05 实现：后端 fxService 内存快照 + 定时刷新（可注入 mock 上游便于测试），fxController 三态响应；前端 fxSlice 三态状态机（fresh/cached/unavailable）+ MoneyDisplay 参考价 + FxStatusBarBanner 双语横幅。全程 TDD：先写红测试再实现转绿。

## 变更清单

| 操作 | 文件路径 | 关联 R/W |
|------|---------|----------|
| 新增 | backend/services/fxService.js | W-01 / FX-S-001..003 |
| 新增 | backend/controllers/fxController.js | W-02 / FX-S-001..003 |
| 新增 | backend/routes/fxRoutes.js | W-02 |
| 修改 | backend/app.js | W-02（挂载 /api/fx） |
| 新增 | frontend/src/slices/fxSlice.js | W-03 / FX-S-004..005 |
| 新增 | frontend/src/components/MoneyDisplay.jsx | W-04 / FX-S-005 |
| 新增 | frontend/src/components/FxStatusBarBanner.jsx | W-05 / FX-S-004..005 |
| 修改 | frontend/src/utils/i18n.js | W-05（fx.* 双语 key） |
| 新增 | backend/tests/services/fxService.test.js | TDD |
| 新增 | frontend/src/tests/fxSlice.test.js, MoneyDisplay.test.jsx | TDD |

## TDD 记录

| W-xx | 测试文件/用例 | 红（失败输出关键行） | 绿（通过输出关键行） |
|------|--------------|---------------------|---------------------|
| W-01 | fxService.test.js「上游失败回退快照」 | `Error: Cannot find module '../services/fxService'` | `✓ 上游失败时返回 lastSuccessSnapshot (source=cached)` |
| W-01 | fxService.test.js「无快照抛不可用」 | `AssertionError: expected [Function] to throw FxUnavailableError` | `✓ 无快照且上游失败抛 FxUnavailableError` |
| W-03 | fxSlice.test.js「503 转 unavailable」 | `expected 'idle' to equal 'unavailable'` | `✓ fetch rejected 时 status=unavailable 且 rate 为 null` |
| W-04 | MoneyDisplay.test.jsx「无率隐藏参考价」 | `TestingLibraryElementError: found ≈ ¥` | `✓ rate 为 null 时不渲染 cny-ref` |

## post-verify 结果

| 检查 | 退出码 | 关键输出 |
|------|--------|---------|
| verify.sh | 0 | [VERIFY PASS] 全部 19 项通过 |
| backend-smoke.sh | 0 | [OK] 后端启动成功 / [OK] API 根路径可访问 |
| frontend build | 0 | ✓ built in 8.42s |

## 已知遗留问题

- 无。

## 可复用经验

- fxService 通过**依赖注入 mock 上游 fetcher**（`setUpstreamFetcher`）比全局 stub HTTP 更稳：单测无需网络、无 flaky。
- 前端三态（fresh/cached/unavailable）建成显式状态机字段而非用 rate===null 推断，测试断言与 UI 分支都更直白。

## 结论

PASS: W-01..W-05 全部实现，TDD 红绿证据齐全，post-verify 三项退出码 0。
