# Domain: wishlist

> 收藏域（我的收藏 / My Favorites）：数据归属 `User.wishlist`（商品 id 数组），API 前缀 `/api/users/wishlist`。

## Requirement: 收藏的添加与移除 (WISH-R-001)

### Scenario: 列表卡片红心收藏 (WISH-S-001)
- GIVEN 用户已登录
- WHEN 在商品列表卡片点击空心红心
- THEN 红心变实心，商品加入收藏（POST /api/users/wishlist）
- AND 再次点击移除收藏（DELETE /api/users/wishlist/:productId），红心恢复空心

### Scenario: 详情页红心与列表状态一致 (WISH-S-002)
- GIVEN 用户已收藏商品 X
- WHEN 打开 X 的详情页
- THEN 详情页红心为实心状态

### Scenario: 未登录点击红心引导登录 (WISH-S-003)
- GIVEN 访客未登录
- WHEN 点击红心
- THEN 跳转 `/login?redirect=<当前页>`，不产生收藏数据

## Requirement: 独立收藏页 (WISH-R-002)

### Scenario: 查看我的收藏页 (WISH-S-004)
- GIVEN 用户已登录且有收藏
- WHEN 访问 `/wishlist`
- THEN 以卡片网格展示全部收藏商品，标题「我的收藏 / My Favorites」按当前语言渲染

### Scenario: 收藏页直接加入购物车 (WISH-S-005)
- GIVEN 用户在 `/wishlist` 页
- WHEN 点击某收藏商品的「加入购物车」
- THEN 商品加入购物车且保留在收藏中

### Scenario: 空收藏态双语文案 (WISH-S-006)
- GIVEN 用户已登录且收藏为空
- WHEN 访问 `/wishlist`
- THEN 展示空态提示（中文「收藏夹是空的，去逛逛吧」/ 英文「Your favorites list is empty」），含回首页链接

## Requirement: 账号隔离 (WISH-R-003)

### Scenario: 账号切换展示一致 (WISH-S-007)
- GIVEN 账号 A 收藏了商品 X 后登出
- WHEN 账号 B 登录并访问 `/wishlist`
- THEN 只展示 B 自己的收藏，绝不出现 A 的商品（账号级缓存清空，见 memory: rtk-account-cache-on-auth-switch）

## 退役列表

| 编号 | 名称 | 退役日期 | 原因 |
|------|------|---------|------|
| （空） | | | |
