# 跨域流程（Flows）

> 单域行为写在各域文件；本文件只记录跨域协作流程的顶层描述与参与域。

## FLOW-001 购买主流程

参与域：products → orders → user-auth

```
浏览商品(products) → 加入购物车(前端 cartSlice) → 登录(user-auth)
  → 填写收货地址 → 选择支付方式 → 确认下单(orders, calcPrices 服务端复算)
  → 我的订单可见(orders)
```

## FLOW-002 收藏转化流程

参与域：wishlist → orders

```
列表/详情点红心(wishlist) → /wishlist 独立页 → 加入购物车 → 走 FLOW-001
```

## FLOW-003 语言合流流程

参与域：i18n → user-auth

```
访客切语言(localStorage) → 登录(user-auth) → resolveLoginUiLanguage 合流
  （会话内显式选择 > 用户偏好 > 会话语言）→ 全站文案 + 商品字段投影同步切换
```

## FLOW-004 金额展示流程

参与域：fx(time-signal) → products/orders

```
后端 fxService 快照(200) / 完全不可用(503)
  → 前端 fxSlice 三态(available/stale/unavailable)
  → MoneyDisplay 全站统一 USD(+CNY) 展示；stale 时顶栏降级横幅
```
