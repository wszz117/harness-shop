---
tags: [rtk-query, cache, auth, wishlist]
---

# 登出/换号后 RTK Query 账号级缓存残留

## 症状（怎么爆的）

账号 A 登出后，账号 B 登录，「我的收藏」页短暂展示 A 的收藏列表；订单面板同样串数据。

## 根因（为什么会发生）

RTK Query 缓存 key 只由 endpoint+参数决定，不含用户身份维度。登出/换号动作没有清空账号级缓存，B 登录后命中 A 的缓存数据。

## 修复（怎么修）

在 authSlice 的 `logout` 与 `setCredentials` listener 中统一调用 `clearAccountScopedApiCache(dispatch)`（内部 `apiSlice.util.resetApiState()`），账号边界变化即全量清空 API 缓存。

## 防复发措施（测试 + 检测）

- 单测：dispatch logout 后断言 api state 被 reset。
- E2E：A 收藏商品 → 登出 → B 登录 → 打开 /wishlist → 断言不出现 A 的商品（账号切换展示一致，WISH 域 Scenario）。
