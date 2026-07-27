# Specs 域索引

> 每个业务域一个文件；编号 `<域前缀>-R-xxx` / `<域前缀>-S-xxx`，全库唯一且永不复用。跨域流程见 `_flows.md`。

| 域 | 支撑域 | 文件 | 说明 |
|-----|--------|------|------|
| products | — | [products.md](products.md) | 商品列表/详情/搜索/分页/Top榜/评论/管理端 CRUD |
| orders | products, user-auth | [orders.md](orders.md) | 下单/价格计算/我的订单/支付与发货标记 |
| user-auth | — | [user-auth.md](user-auth.md) | 注册/登录/JWT Cookie/资料维护/管理端用户管理 |
| wishlist | user-auth, products | [wishlist.md](wishlist.md) | 列表+详情红心+独立页 /wishlist、独立页加入购物车、账号切换展示一致、空收藏态双语、「我的收藏 / My Favorites」、数据归属 User.wishlist（/api/users/wishlist） |
| i18n | — | [i18n.md](i18n.md) | 默认中文、访客/用户两级语言偏好、登录合流、商品字段双语投影 |
| fx（挂靠 time-signal） | — | [time-signal.md](time-signal.md) | USD/CNY 汇率快照、降级（available/stale/unavailable）、全站金额一致展示 |
