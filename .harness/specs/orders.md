# Domain: orders

> 订单域：下单、服务端价格复算、我的订单、订单详情、支付/发货标记。

## Requirement: 创建订单 (ORD-R-001)

### Scenario: 登录用户确认下单 (ORD-S-001)
- GIVEN 用户已登录且购物车非空、已填收货地址与支付方式
- WHEN 用户在 `/placeorder` 点击「确认下单」
- THEN 返回 201 创建订单，购物车清空，跳转 `/order/:id`

### Scenario: 空购物车下单被拒绝 (ORD-S-002)
- GIVEN 用户已登录且订单条目为空
- WHEN 调用 POST /api/orders
- THEN 返回 400

### Scenario: 价格由服务端复算 (ORD-S-003)
- GIVEN 客户端提交订单条目（仅含商品 id 与数量）
- WHEN 服务端处理下单
- THEN 单价以数据库为准，itemsPrice/shippingPrice/taxPrice/totalPrice 由服务端 calcPrices 计算（≤100 收 10 运费，税率 15%），不信任客户端价格

## Requirement: 我的订单 (ORD-R-002)

### Scenario: 查看我的订单列表 (ORD-S-004)
- GIVEN 用户已登录且有历史订单
- WHEN 用户访问 `/profile`
- THEN 展示本人订单表格（编号/日期/总额/支付/发货状态）

### Scenario: 查看订单详情鉴权 (ORD-S-005)
- GIVEN 订单属于用户 A
- WHEN 非管理员用户 B 请求 GET /api/orders/:id
- THEN 返回 401/404，不泄露他人订单

## Requirement: 订单状态管理 (ORD-R-003)

### Scenario: 标记支付 (ORD-S-006)
- GIVEN 订单未支付
- WHEN PUT /api/orders/:id/pay（模拟支付回调）
- THEN isPaid=true 且记录 paidAt

### Scenario: 管理员标记发货 (ORD-S-007)
- GIVEN 订单已支付
- WHEN 管理员 PUT /api/orders/:id/deliver
- THEN isDelivered=true 且记录 deliveredAt

## 退役列表

| 编号 | 名称 | 退役日期 | 原因 |
|------|------|---------|------|
| （空） | | | |
