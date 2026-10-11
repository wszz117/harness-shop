# Dev Log: exchange-rate-cache-fallback

> 角色：developer ｜ Dev-owned：FX-S-001..005（W-01..W-05） ｜ 状态：完成
>
> v1.1 复核修订（2026-10-11）：v1.0 日志中的 TDD 记录与代码对不上（例如引用了不存在的 `setUpstreamFetcher`），且未发现 `startAutoRefresh` 从未接线。本版本为复核迭代的真实记录，红绿输出均可在本地复现。v1.0 原文见 tag `v1.0.0-original`。

## 实现摘要

后端：`refresh()` 失败时记录 `lastError`，`getSnapshot()` 据此立即返回 `state: "stale"`；新增 `defaultFetcher()` 读取 `FX_UPSTREAM_URL` / `FX_FIXED_RATE`；`startAutoRefresh()` 返回首次刷新 Promise 并支持 `stopAutoRefresh()`；`server.js` 启动时接线。前端：`fxSlice` 初始态改为 `loading`；横幅文案与 spec 对齐；`MoneyDisplay` 参考价改为「≈ ¥」并加 `data-testid="cny-ref"`。

## 变更清单

| 操作 | 文件路径 | 关联 R/W |
|------|---------|----------|
| 修改 | backend/services/fxService.js | W-01 / FX-S-001..003 |
| 修改 | backend/server.js | W-01（启动接线 startAutoRefresh） |
| 修改 | frontend/src/slices/fxSlice.js | W-03 / FX-S-004..005 |
| 修改 | frontend/src/components/MoneyDisplay.jsx | W-04 / FX-S-001, 005 |
| 修改 | frontend/src/components/FxStatusBarBanner.jsx | W-05 / FX-S-004..005 |
| 修改 | frontend/src/utils/i18n.js | W-05（fx.* 文案） |
| 修改 | backend/tests/services/fxService.test.js | TDD（5 条 → 13 条） |
| 修改 | frontend/src/tests/fxSlice.test.js, MoneyDisplay.test.jsx | TDD |
| 新增 | frontend/src/tests/FxStatusBarBanner.test.jsx | TDD |

## TDD 记录（真实输出）

后端先红：`Tests 8 failed | 5 passed (13)`；实现后：`Tests 13 passed (13)`。前端先红：`Tests 6 failed | 17 passed (23)`；实现后：`Tests 23 passed (23)`。

| W-xx | 用例 | 红（失败输出关键行） | 绿 |
|------|------|---------------------|-----|
| W-01 | 上游刚失败时立即标记 state=stale (FX-S-002) | `AssertionError: expected 'available' to be 'stale'` | ✓ |
| W-01 | 上游恢复后 state 回到 available (FX-S-001) | `AssertionError: expected 'available' to be 'stale'`（前置步骤未进入 stale） | ✓ |
| W-01 | startAutoRefresh 启动即完成首次刷新 | `TypeError: svc.stopAutoRefresh is not a function` | ✓ |
| W-01 | 配置 FX_UPSTREAM_URL 时从上游读取 rate | `TypeError: defaultFetcher is not a function` | ✓ |
| W-02 | 上游失败但有快照时返回 200 + state=stale | `expected { rate: 7.25, …(2) } to match object { rate: 7.25, state: 'stale' }` | ✓ |
| W-03 | 初始为 loading，避免横幅闪烁 (FX-S-004) | `AssertionError: expected 'unavailable' to be 'loading'` | ✓ |
| W-04 | 有快照时展示 ≈ ¥ 参考价 | `Unable to find an element by: [data-testid="cny-ref"]` | ✓ |
| W-05 | stale 横幅文案 | `expected '汇率暂不可用，展示最近可用汇率' to be '当前显示为缓存汇率'` | ✓ |

## post-verify 结果

| 检查 | 退出码 | 关键输出 |
|------|--------|---------|
| verify.sh | 0 | [VERIFY PASS] 全部 19 项通过 |
| backend-smoke.sh | 0 | [OK] 汇率接口可用: {"rate":7.25,…,"state":"available"} |
| frontend build | 0 | ✓ built in 3.26s |
| developer 收工 hook | PASS | 63/63 用例，不低于基线 63（见 hook-results/developer-pass.json） |

## 已知遗留问题

- 快照为进程内存，多实例部署不共享（已记入 specs 边界说明）。

## 可复用经验

- **单测全绿不等于功能可用**：v1.0 的 fxService 单测全部通过，但 `startAutoRefresh` 从未被调用，接口在真实运行中恒为 503。v1.1 把"启动后端并请求 /api/fx/usd-cny 必须 200"写进 backend-smoke.sh，由收工 hook 强制执行。
- 构造函数注入 `fetcher`（`new FxService({ fetcher })`）让单测无需网络、无 flaky。
- 前端把"尚未返回"建成显式的 `loading` 态，避免用"无数据"推断"不可用"造成横幅闪烁。

## 结论

PASS: W-01..W-05 全部实现，TDD 红绿证据为真实输出，post-verify 全部通过。
