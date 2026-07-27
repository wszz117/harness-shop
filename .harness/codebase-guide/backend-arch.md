# 后端架构（调用链一行流）

> 模式：`routes/*.js`（只声明路由与中间件）→ `controllers/*.js`（asyncHandler 包裹业务）→ `models/*.js`（Mongoose, timestamps: true）。`server.js` 只 listen；`app.js` 挂路由与错误中间件。

## 路由映射表

| 路由前缀 | 路由文件 | 调用链一行流 | 说明 |
|---------|---------|-------------|------|
| GET /api/products | productRoutes.js | `getProducts → buildKeywordFilter(lang) + Product.find(分页) + projectProductForLang` | 列表/搜索/分页, 语言取 x-ui-language |
| GET /api/products/top | productRoutes.js | `getTopProducts → Product.find().sort({rating:-1}).limit(3) + projectProductForLang` | Top 榜（须在 /:id 之前注册） |
| GET /api/products/:id | productRoutes.js | `checkObjectId → getProductById → Product.findById + projectProductForLang` | 详情 |
| POST /api/products | productRoutes.js | `protect, admin → createProduct(空数值转 0; 非法→400 messageKey admin.product.invalidInput)` | 管理端创建样例商品 |
| PUT /api/products/:id | productRoutes.js | `protect, admin, checkObjectId → updateProduct(同上校验)` | 管理端更新 |
| DELETE /api/products/:id | productRoutes.js | `protect, admin, checkObjectId → deleteProduct` | 管理端删除 |
| POST /api/products/:id/reviews | productRoutes.js | `protect, checkObjectId → createProductReview(去重→400)` | 评论 |
| POST /api/users/auth | userRoutes.js | `authUser → User.findOne → matchPassword → generateToken(Set-Cookie)` | 登录 |
| POST /api/users | userRoutes.js | `registerUser(查重→400) → generateToken` | 注册 |
| POST /api/users/logout | userRoutes.js | `logoutUser → 清 jwt cookie` | 登出 |
| GET/PUT /api/users/profile | userRoutes.js | `protect → getUserProfile / updateUserProfile(bcrypt, uiLanguage)` | 资料 |
| GET /api/users/wishlist | userRoutes.js | `protect → getWishlist → User.populate('wishlist') + projectProductForLang` | 我的收藏 |
| POST /api/users/wishlist | userRoutes.js | `protect → addToWishlist($addToSet)` | 加收藏 |
| DELETE /api/users/wishlist/:productId | userRoutes.js | `protect, checkObjectId → removeFromWishlist($pull)` | 取消收藏 |
| GET /api/users | userRoutes.js | `protect, admin → getUsers` | 管理端用户列表 |
| POST /api/orders | orderRoutes.js | `protect → addOrderItems(空条目→400; 单价以库为准) → calcPrices → Order.create` | 下单 |
| GET /api/orders/mine | orderRoutes.js | `protect → getMyOrders` | 我的订单 |
| GET /api/orders/:id | orderRoutes.js | `protect, checkObjectId → getOrderById(本人或 admin, 否则 404)` | 订单详情 |
| PUT /api/orders/:id/pay | orderRoutes.js | `protect → updateOrderToPaid` | 标记支付 |
| PUT /api/orders/:id/deliver | orderRoutes.js | `protect, admin → updateOrderToDelivered` | 标记发货 |
| GET /api/orders | orderRoutes.js | `protect, admin → getOrders` | 管理端订单列表 |
| GET /api/fx/usd-cny | fxRoutes.js | `getUsdCny → fxService.getSnapshot()（200 快照 {rate,fetchedAt,stale} / 无任何快照 503 messageKey fx.unavailable）` | 汇率快照降级 |
| POST /api/upload | uploadRoutes.js | `multer 本地存 uploads/` | 图片上传 |

## 横切组件

| 文件 | 职责 |
|------|------|
| middleware/authMiddleware.js | protect（验 jwt cookie → req.user）/ admin |
| middleware/checkObjectId.js | ObjectId 格式校验（非法 → 400） |
| middleware/asyncHandler.js | async 错误透传 |
| middleware/errorMiddleware.js | notFound(404) + errorHandler（统一 { message, messageKey?, stack? }） |
| utils/calcPrices.js | 订单价格：items 合计；≤100 收 10 运费；税 15%；两位小数 |
| utils/productI18n.js | buildKeywordFilter(lang) + projectProductForLang(product, lang)（en 缺失回退 zh） |
| utils/generateToken.js | jwt 签发 + HttpOnly Cookie（30d） |
| services/fxService.js | 内存 lastSuccessSnapshot；成功刷新覆盖，失败保留（stale 语义），从未成功 → null |
