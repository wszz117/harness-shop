---
tags: [smoke, wiring, hook, fx, false-green]
---
# 单测全绿，但服务启动时从未接线（汇率接口恒 503）

## 症状（怎么爆的）
fxService 的单测全部通过，dev-log / code-review / test-report 均为 PASS；但真实启动后端后 `GET /api/fx/usd-cny` 永远返回 503，前端永远显示"汇率暂不可用"。

## 根因（为什么会发生）
`fxService.startAutoRefresh()` 只在单测里被直接调用，`server.js` 启动流程从未调用它，内存快照永远为空。单测验证的是"函数行为"，没有任何检查覆盖"进程启动后的真实行为"；backend-smoke.sh 当时只探活 API 根路径。

## 修复（怎么修）
`server.js` 在 `app.listen` 前调用 `fxService.startAutoRefresh()`；`startAutoRefresh` 返回首次刷新 Promise，并新增 `stopAutoRefresh()` 便于测试清理。

## 防复发措施（测试 + 检测）
- backend-smoke.sh 新增行为探测：真实启动后端，请求 `/api/fx/usd-cny` 必须 200，否则 FAIL 并提示排查 startAutoRefresh 接线。
- developer 收工 hook 强制运行 backend-smoke.sh；已实测：注释掉接线后，63 个单测与 19 项门禁全过，hook 仍判 FAIL（见 `_archive/exchange-rate-cache-fallback/hook-results/demo1-unwired-fx.json`）。
- 通用规则：凡是"需要启动时挂载/注册/订阅"的能力（定时任务、事件监听、路由挂载），都在 smoke 中补一条对外可观察行为的探测。
