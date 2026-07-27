# Domain: products

> 商品域：列表、详情、搜索、分页、Top 榜、评论、管理端 CRUD。

## Requirement: 商品列表与分页 (PROD-R-001)

### Scenario: 首页展示商品列表 (PROD-S-001)
- GIVEN 数据库存在至少 1 件商品
- WHEN 访客访问首页 `/`
- THEN 以卡片网格展示商品（图片、名称、评分、价格）
- AND 价格由 MoneyDisplay 组件统一渲染（见 FX-R-002）

### Scenario: 列表分页 (PROD-S-003)
- GIVEN 商品总数超过单页容量（8 件）
- WHEN 访客访问 `/page/2`
- THEN 展示第二页商品
- AND 分页器高亮当前页

## Requirement: 全局搜索商品 (PROD-R-002)

### Scenario: 关键词搜索匹配商品 (PROD-S-002)
- GIVEN 数据库存在名称含「phone」的商品
- WHEN 访客在顶栏搜索框输入「phone」并提交
- THEN 跳转 `/search/phone` 并仅展示名称匹配关键词的商品（大小写不敏感）
- AND 当前语言为英文时按英文名称字段（name_en）匹配

## Requirement: 商品详情 (PROD-R-003)

### Scenario: 查看商品详情 (PROD-S-004)
- GIVEN 商品存在且有库存
- WHEN 访客访问 `/product/:id`
- THEN 展示图片、名称、评分、描述、价格、库存状态与数量选择器
- AND 点击「加入购物车」跳转 `/cart`

## Requirement: Top 商品轮播 (PROD-R-004)

### Scenario: 首页顶部展示评分最高的 3 件商品 (PROD-S-005)
- GIVEN 数据库存在至少 3 件已评分商品
- WHEN 访客访问首页
- THEN 轮播展示评分最高的 3 件商品（GET /api/products/top）

## Requirement: 商品评论 (PROD-R-005)

### Scenario: 登录用户提交评论 (PROD-S-006)
- GIVEN 用户已登录且未评论过该商品
- WHEN 用户在详情页提交评分与评论
- THEN 返回 201，商品评论数与均分更新

### Scenario: 重复评论被拒绝 (PROD-S-007)
- GIVEN 用户已评论过该商品
- WHEN 用户再次提交评论
- THEN 返回 400，提示已评论过

## Requirement: 管理端商品维护 (PROD-R-006)

### Scenario: 管理员创建商品 (PROD-S-008)
- GIVEN 管理员已登录
- WHEN 在 `/admin/productlist` 点击创建商品
- THEN 返回 201 并生成样例商品，可进入编辑页完善字段

### Scenario: 管理员录入非法数值被拒绝 (PROD-S-009)
- GIVEN 管理员在编辑页把价格/库存填为非法值（负数或非数字）
- WHEN 提交保存
- THEN 返回 400，错误 messageKey 为 `admin.product.invalidInput`（前端按当前语言渲染）
- AND 空数值字段在服务端规范化为 0 后再校验

## 退役列表

| 编号 | 名称 | 退役日期 | 原因 |
|------|------|---------|------|
| （空） | | | |
