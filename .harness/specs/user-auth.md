# Domain: user-auth

> 用户认证域：注册、登录、JWT HttpOnly Cookie、资料维护、管理端用户管理。

## Requirement: 登录与会话 (AUTH-R-001)

### Scenario: 正确凭据登录 (AUTH-S-001)
- GIVEN 用户已注册
- WHEN POST /api/users/auth 提交正确邮箱密码
- THEN 返回 200 与用户信息（含 uiLanguage 偏好），并 Set-Cookie 写入 HttpOnly JWT

### Scenario: 错误凭据被拒绝 (AUTH-S-002)
- GIVEN 用户已注册
- WHEN 提交错误密码
- THEN 返回 401，提示无效邮箱或密码

### Scenario: 登出清除会话 (AUTH-S-003)
- GIVEN 用户已登录
- WHEN POST /api/users/logout
- THEN 清除 jwt cookie，账号级前端缓存清空（见 memory: rtk-account-cache-on-auth-switch）

## Requirement: 注册 (AUTH-R-002)

### Scenario: 新邮箱注册成功 (AUTH-S-004)
- GIVEN 邮箱未被占用
- WHEN POST /api/users 提交姓名/邮箱/密码
- THEN 返回 201 并自动登录（Set-Cookie）

### Scenario: 重复邮箱注册被拒绝 (AUTH-S-005)
- GIVEN 邮箱已注册
- WHEN 再次注册
- THEN 返回 400

## Requirement: 资料与鉴权中间件 (AUTH-R-003)

### Scenario: 未登录访问受保护接口 (AUTH-S-006)
- GIVEN 请求不带有效 jwt cookie
- WHEN 访问任一 protect 接口（如 GET /api/users/profile）
- THEN 返回 401

### Scenario: 非管理员访问管理接口 (AUTH-S-007)
- GIVEN 普通用户已登录
- WHEN 访问 admin 接口（如 GET /api/users）
- THEN 返回 401/403

### Scenario: 更新个人资料 (AUTH-S-008)
- GIVEN 用户已登录
- WHEN PUT /api/users/profile 修改姓名/密码/uiLanguage
- THEN 返回 200，密码以 bcrypt 散列存储

## 退役列表

| 编号 | 名称 | 退役日期 | 原因 |
|------|------|---------|------|
| （空） | | | |
