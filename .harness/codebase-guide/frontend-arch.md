# 前端架构（组件-状态映射）

> 模式：页面在 `src/screens/`（admin 页在 `screens/admin/`）；数据一律 RTK Query（`slices/*ApiSlice.js` injectEndpoints，禁 fetch/axios 直调）；路由树在 `src/index.jsx` 注册。

## 路由 → 页面 → 状态源

| 路由 | 页面 | 状态源 |
|------|------|--------|
| `/` `/search/:keyword` `/page/:pageNumber` | HomeScreen | useGetProductsQuery |
| `/product/:id` | ProductScreen | useGetProductDetailsQuery + useCreateReviewMutation + wishlist 端点 |
| `/cart` | CartScreen | cartSlice（localStorage 持久化） |
| `/wishlist` | WishlistScreen（PrivateRoute） | useGetWishlistQuery + useRemoveFromWishlistMutation |
| `/login` `/register` | Login/RegisterScreen | useLoginMutation / useRegisterMutation + authSlice |
| `/shipping` `/payment` `/placeorder` | 结算三步（PrivateRoute） | cartSlice + useCreateOrderMutation |
| `/order/:id` | OrderScreen（PrivateRoute） | useGetOrderDetailsQuery + usePayOrderMutation |
| `/profile` | ProfileScreen（PrivateRoute） | useProfileMutation + useGetMyOrdersQuery |
| `/admin/productlist(+/:pageNumber)` | ProductListScreen（AdminRoute） | useGetProductsQuery + create/delete mutations |
| `/admin/product/:id/edit` | ProductEditScreen（AdminRoute） | useGetProductDetailsQuery + useUpdateProductMutation |
| `/admin/orderlist` | OrderListScreen（AdminRoute） | useGetOrdersQuery |
| `/admin/userlist` | UserListScreen（AdminRoute） | useGetUsersQuery |

## 全局状态（store.js）

| slice | 职责 | 持久化 |
|-------|------|--------|
| apiSlice | RTK Query 基座；baseQuery 自动带 `x-ui-language` 头；`clearAccountScopedApiCache` 账号边界清缓存 | — |
| authSlice | userInfo；登录/登出 listener（触发语言合流与缓存清空） | localStorage `userInfo` |
| cartSlice | 购物车 + 收货地址 + 支付方式；updateCart 复算 | localStorage `cart` |
| languageSlice | current(zh/en)；setLanguage / setLanguageExplicit / resolveLoginUiLanguage | localStorage `uiLanguage` + sessionStorage `uiLanguageSessionExplicit` |
| fxSlice | snapshot + state(available/stale/unavailable) | localStorage `fx_cmd_cny_snapshot` |
| products/users/ordersApiSlice | injectEndpoints 各域端点 | — |

## 关键组件

| 组件 | 职责 |
|------|------|
| Header | 导航 + SearchBox + 语言切换（data-testid: lang-switch/nav-cart/nav-wishlist） |
| MoneyDisplay | 全站唯一金额出口：USD 必显，有快照加 ≈¥（data-testid: money-display） |
| FxStatusBanner | stale 降级横幅 |
| WishlistHeart | 红心组件（列表卡片/详情复用；未登录跳 /login?redirect=…） |
| Product | 商品卡片（含 WishlistHeart + MoneyDisplay） |
| PrivateRoute / AdminRoute | 登录/管理员路由守卫 |
| useT（hooks/useT.js） | `const t = useT()` 按 languageSlice 取词典 |

## i18n 词典

`src/utils/i18n.js`：`dict.zh` / `dict.en` 扁平 key（如 `nav.cart`、`wishlist.empty`、`admin.product.invalidInput`）；`t(lang,key)` 未知 key 回退 key 本身；en 必须全覆盖 zh（单测强制）。
