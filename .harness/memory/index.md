# Memory 索引

> 经验记忆库。条目命名 `YYYY-MM-DD__<域>__<slug>.md`，四段式（症状/根因/修复/防复发）。
> 消费方式：systematic-debug skill 第 0 步先 grep 本索引与条目关键词，命中再渐进加载全文。

| 日期 | 域 | 条目 | 一句话摘要 | tags |
|------|-----|------|-----------|------|
| 2026-05-12 | frontend | [recent-view-visual-dedup-wrong-id](entries/2026-05-12__frontend__recent-view-visual-dedup-wrong-id.md) | 最近浏览视觉去重用了错误的 id 字段导致重复卡片 | dedup, selector |
| 2026-05-12 | frontend | [vitest-css-module-uninjected](entries/2026-05-12__frontend__vitest-css-module-uninjected.md) | Vitest/jsdom 不注入 CSS Module，断言样式类名失败 | vitest, css-module |
| 2026-05-19 | frontend | [rtk-account-cache-on-auth-switch](entries/2026-05-19__frontend__rtk-account-cache-on-auth-switch.md) | 登出/换号后 RTK Query 账号级缓存残留串数据 | rtk-query, cache, auth |
| 2026-05-19 | frontend | [login-overwrites-guest-uiLanguage](entries/2026-05-19__frontend__login-overwrites-guest-uiLanguage.md) | 登录后用户偏好语言覆盖了访客会话内显式选择 | i18n, auth, uiLanguage |
| 2026-10-11 | backend | [unit-green-but-startup-unwired](entries/2026-10-11__backend__unit-green-but-startup-unwired.md) | 单测全绿但 startAutoRefresh 从未接线，汇率接口恒 503；用 smoke 行为探测兜底 | smoke, wiring, false-green |
| 2026-10-11 | harness | [baseline-glob-misses-subdirs](entries/2026-10-11__harness__baseline-glob-misses-subdirs.md) | baseline.sh 只统计顶层目录导致收工 hook 恒 FAIL；门禁脚本需正反两种输入验证 | baseline, gate, false-red |
