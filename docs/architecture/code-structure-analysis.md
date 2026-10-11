# 代码结构深度解析（Code Structure Analysis）

> 本文面向工程师，逐目录、逐模块解析仓库的组织方式、各部分职责与相互关系。建议对照源码阅读。整体架构视角请先阅读 [架构总览](architecture-overview.md)。

## 0. 顶层鸟瞰

仓库由**两类资产**构成：AI 工程化框架资产（`.cursor/` + `.harness/`，约 80 个文件）与业务应用资产（`backend/` + `frontend/` + `e2e/` + `mcp-server/`，约 5,000 行代码）。它们通过一个原则连接：**框架对业务零侵入**——删除 `.cursor/` 和 `.harness/`，业务应用仍可独立运行；反之，框架资产可整体移植到任何其他项目。

```
harness-shop/
├── .cursor/          # AI 代理协作层（IDE 扩展点，薄适配）
├── .harness/         # Harness 资产层（单一真相源）
├── backend/          # Express 后端（约 1,700 行）
├── frontend/         # React 前端（约 3,200 行）
├── e2e/              # Playwright E2E 取证测试
├── mcp-server/       # 本地 MCP 工具服务
├── docs/             # 文档中心（本文所在）
├── package.json      # 根工作区：并发启动、测试、门禁入口
└── .env.example      # 环境变量样例（开箱即用默认值）
```

## 1. `.cursor/` — AI 代理协作层

```
.cursor/
├── commands/                    # 斜杠命令（工作流入口）
│   ├── harness-propose.md       #   /harness-propose：BA→SA→(RR) 提案流水线
│   ├── harness-apply.md         #   /harness-apply：Dev→CR→TE 实施流水线
│   ├── harness-archive.md       #   /harness-archive：Spec/Memory Merge + 归档
│   └── codebase-guide-init.md   #   代码知识库初始化（移植新项目时使用）
├── rules/                       # 常驻软约束（第 1 层防线）
│   ├── harness-core.mdc         #   研发纪律：角色边界、证据链定义、PM 心跳
│   ├── code-standards.mdc       #   代码规范：分层、命名、ESM、≤300 行等
│   └── workflow-discipline.mdc  #   工作流纪律：状态机遵从、模板使用
├── skills/                      # SOP 手册（第 2 层防线，5 个 SKILL.md）
│   ├── build-test/              #   如何正确构建与跑测试
│   ├── post-verify/             #   Dev 收尾自检清单
│   ├── code-review/             #   CR 的 13 节审查方法论
│   ├── test-e2e/                #   TE 的 E2E 取证规范（截图命名/存放）
│   └── systematic-debug/        #   系统化调试法（假设→实验→结论）
├── hooks/                       # 旁路验证（第 3 层防线，Python）
│   ├── dispatch-subagent.py     #   subagentStop：并行四项验证写 JSON
│   ├── dispatch-prompt.py       #   beforeSubmitPrompt：命令合法性拦截
│   ├── session-node-env.py      #   sessionStart：Node/Mongo 环境自检
│   └── ...                      #   共 7 个 Python 文件（含公共库）
├── hooks.json                   # 三事件注册表
└── mcp.json                     # 本地 MCP 服务注册（指向 mcp-server/）
```

**设计要点**：命令文件本身不含业务知识，只做两件事——声明棒次顺序、指向 `.harness/` 中的角色契约与模板。例如 `harness-apply.md` 的核心内容是"按 design.md 的 Dev-owned 工作项派发 developer 子代理 → 读 hook-results → 派发 code-reviewer → 派发 test-engineer"，具体每个角色怎么工作由 `.harness/agents/*.md` 契约定义。

## 2. `.harness/` — 框架资产层（单一真相源）

```
.harness/
├── GUIDE.md                     # 总纲：为什么需要 Harness、状态机、四层防线
├── agents/                      # 7 角色契约
│   ├── pm.md                    #   PM：只调度不干活，六类心跳，读 hook-results 才交棒
│   ├── business-analyst.md      #   BA：BDD 需求 + 全库唯一编号，禁写实现
│   ├── solution-architect.md    #   SA：W-xx 工作项 + R/S 双向覆盖矩阵
│   ├── readiness-reviewer.md    #   RR：10 项 checklist，任一 FAIL 即 BLOCK
│   ├── developer.md             #   Dev：严格 TDD 先红后绿，只做 Dev-owned
│   ├── code-reviewer.md         #   CR：13 节报告，逐 Scenario 文件:行号取证
│   └── test-engineer.md         #   TE：B 类 E2E 1:1 + C 类回归，禁改被测代码
├── specs/                       # 规格库（六域 + 流程图 + 索引）
│   ├── _index.md                #   编号分配表 + 退役列表（编号永不复用）
│   ├── _flows.md                #   跨域业务流程图
│   ├── products.md / orders.md / user-auth.md
│   ├── wishlist.md / i18n.md / time-signal.md
├── codebase-guide/              # 代码知识库（6 个文件）
│   ├── backend-architecture.md  #   后端分层地图 + 调用链一行流
│   ├── frontend-architecture.md #   组件-状态映射 + 数据流
│   ├── dev-recipes.md           #   开发菜谱：加接口/加页面/加 slice 的标准步骤
│   └── ...
├── memory/                      # 经验记忆库
│   ├── _index.md                #   条目索引（开工前检索入口）
│   └── entries/                 #   四段式条目，按 日期__域__slug.md 命名
├── templates/                   # 9 个填表式模板 + 6 个 skeleton
│   ├── proposal.md / requirements.md / design.md
│   ├── readiness-review.md / dev-log.md / code-review.md
│   ├── test-report.md / impact-analysis.md / memory-entry.md
│   └── codebase-guide-skeletons/
├── scripts/                     # 13 个硬门禁脚本（第 4 层防线）
│   ├── verify.sh                #   ★ 19 项工程规范门禁（见下表）
│   ├── check-harness.sh         #   ★ 134 项框架结构体检
│   ├── baseline.sh              #   质量基线记录与对比（防退化）
│   ├── init-task.sh             #   任务目录初始化（从模板生成）
│   ├── stage-doc.sh             #   阶段文档就位校验
│   ├── spec-lint.py             #   规格编号唯一性/引用完整性校验
│   ├── check-e2e-evidence.py    #   E2E 截图证据存在性校验
│   ├── backend-smoke.sh         #   后端冒烟（起服务打关键接口）
│   ├── ensure-mongodb.sh        #   MongoDB 拉起（本地开发辅助）
│   └── ...
├── deliverables/                # 任务交付目录
│   └── _archive/
│       └── exchange-rate-cache-fallback/   # ★ 完整示例任务（7 文档 + 4 截图）
├── tasks/board.md               # 全局任务看板
├── workflow/
│   ├── transitions.json         #   状态机：9 状态 / 3 Profile / 2 卡点 / 4 回退规则
│   └── subagent-orchestration.md
├── knowledge-engineering.md     # 三库知识工程方法论
├── multi-repo-adaptation.md     # 移植指南（五步移植任意技术栈）
└── eval-design/                 # 框架有效性评估设计
```

**verify.sh 的 19 项门禁摘录**（体会"硬约束"的粒度）：

| 类别 | 检查项示例 |
|------|-----------|
| 文件纪律 | 单文件 ≤300 行；禁止 console.log 残留；ESM 中禁止 require |
| 后端架构 | server.js 只许 listen；所有路由挂载于 app.js；controllers 全部 asyncHandler 包裹；models 全部 timestamps: true |
| 前端架构 | 禁止组件内 fetch/axios 直调（必须走 RTK Query）；禁止内联 style；Screen 必须注册路由 |
| 测试纪律 | 测试文件与被测模块对应存在；E2E 用例与 Scenario 编号对照 |

## 3. `backend/` — Express 后端（约 1,700 行）

```
backend/
├── server.js                # 仅负责 listen（可测试性：supertest 直接 import app）
├── app.js                   # 应用装配：中间件挂载 + 全部路由注册 + 错误处理
├── config/db.js             # Mongoose 连接（含重试与日志）
├── routes/                  # 5 个路由文件：URL → controller 映射，零业务逻辑
│   ├── productRoutes.js     #   /api/products：列表/详情/评论/top
│   ├── userRoutes.js        #   /api/users：注册/登录/登出/资料/管理端
│   ├── orderRoutes.js       #   /api/orders：下单/我的订单/支付/发货
│   ├── uploadRoutes.js      #   /api/upload：商品图上传（multer）
│   └── fxRoutes.js          #   /api/fx：汇率快照（示例任务新增）
├── middleware/
│   ├── authMiddleware.js    #   protect（JWT httpOnly Cookie 解析）+ admin（角色鉴权）
│   ├── asyncHandler.js      #   async 异常统一捕获 → next(err)
│   ├── checkObjectId.js     #   ObjectId 合法性前置校验（防 CastError 泄漏 500）
│   └── errorMiddleware.js   #   notFound + errorHandler（统一 JSON 错误体）
├── controllers/             # 4 个控制器：HTTP 语义层（解析参数→调 service/model→回状态码）
│   ├── productController.js #   分页/搜索/评论去重（一人一评）
│   ├── userController.js    #   注册查重/bcrypt/JWT 签发进 Cookie
│   ├── orderController.js   #   ★ 服务端价格重算（防篡改核心）
│   └── fxController.js      #   汇率快照读取 + 降级状态
├── services/
│   └── fxService.js         #   ★ 汇率快照缓存 + TTL + 上游失败降级（三态）
├── utils/
│   ├── calcPrices.js        #   价格计算纯函数（单测覆盖边界）
│   ├── generateToken.js     #   JWT 签发 + Cookie 设置（httpOnly/sameSite）
│   └── productI18n.js       #   商品字段按语言合流（name/name_en 等）
├── models/                  # 3 个 Mongoose Schema（全部 timestamps: true）
│   ├── productModel.js      #   商品 + 内嵌 reviews 子文档
│   ├── userModel.js         #   用户 + isAdmin + uiLanguage + wishlist 引用数组
│   └── orderModel.js        #   订单 + orderItems 快照 + 支付/发货状态
├── tests/                   # 8 组 Vitest 单测（mongodb-memory-server + supertest 全离线）
│   ├── product.test.js / user.test.js / order.test.js
│   ├── fxService.test.js / calcPrices.test.js / ...
├── seeder.js                # 种子数据（双语商品 + 管理员/普通用户）
└── data/                    # products.js（双语字段）+ users.js
```

**一条典型调用链**（下单）：

```
POST /api/orders
  → app.js 挂载 orderRoutes
  → protect 中间件（Cookie 解 JWT → req.user）
  → orderController.addOrderItems（asyncHandler 包裹）
      → 逐项从 DB 重新取价（绝不信任前端价格）
      → calcPrices 纯函数计算 items/shipping/tax/total
      → fxService.getSnapshot() 附加汇率参考价（失败则降级不阻塞下单）
      → Order.create(...)
  → 201 + 订单 JSON（errorMiddleware 兜底任何异常）
```

**架构上值得注意的三个细节**：其一，`server.js` 与 `app.js` 分离不是风格洁癖，而是让 supertest 可以在不占端口的情况下直接测完整中间件栈；其二，`orderController` 的服务端重算价格是电商安全的经典必修课，前端传来的价格只用于展示；其三，`fxService` 的三态设计（fresh/stale/unavailable）保证外部依赖故障绝不能阻塞核心交易链路——这正是示例归档任务交付的能力。

## 4. `frontend/` — React 前端（约 3,200 行）

```
frontend/src/
├── index.jsx                # 入口：Provider + Router 装配
├── App.jsx                  # 布局骨架：Header + Outlet + Footer
├── store.js                 # Redux store：apiSlice.reducer + auth/cart/fx/language
├── screens/                 # 15 个页面组件
│   ├── HomeScreen.jsx           #   商品列表 + 分页 + Top 轮播 + 搜索结果
│   ├── ProductScreen.jsx        #   详情 + 数量选择 + 评论提交
│   ├── CartScreen.jsx           #   购物车（增删改数量）
│   ├── ShippingScreen / PaymentScreen / PlaceOrderScreen  # 下单三步
│   ├── OrderScreen.jsx          #   订单详情（支付/发货状态 + 汇率参考价横幅）
│   ├── LoginScreen / RegisterScreen / ProfileScreen
│   ├── WishlistScreen.jsx       #   我的收藏（空态双语）
│   └── admin/                   #   ProductList / ProductEdit / OrderList / UserList
├── components/              # 18 个可复用组件
│   ├── Header.jsx               #   导航 + 购物车角标 + 语言切换 + 用户菜单
│   ├── SearchBox / Paginate / Rating / Loader / Message
│   ├── MoneyDisplay.jsx         #   ★ 金额展示统一出口（主价 + 汇率参考价）
│   ├── FxStatusBanner.jsx       #   ★ 汇率三态横幅（fresh 不显示/stale 黄/unavailable 灰）
│   ├── WishlistHeart.jsx        #   收藏红心（乐观更新）
│   ├── PrivateRoute / AdminRoute #   路由守卫
│   └── ...
├── slices/                  # 8 个 Redux 切片
│   ├── apiSlice.js              #   RTK Query 基座（baseUrl=/api，credentials 携带）
│   ├── productsApiSlice.js      #   注入商品端点（list/detail/review/top/admin CRUD）
│   ├── usersApiSlice.js         #   注入用户端点（login/register/profile/wishlist）
│   ├── ordersApiSlice.js        #   注入订单端点（create/detail/pay/mine）
│   ├── authSlice.js             #   userInfo（localStorage 持久化）
│   ├── cartSlice.js             #   购物车状态 + cartUtils 价格聚合
│   ├── fxSlice.js               #   汇率快照状态（示例任务新增）
│   └── languageSlice.js         #   ui 语言（访客 localStorage / 登录用户偏好合流）
├── hooks/useT.js            # i18n 翻译 Hook：t('key') → 按当前语言取字典
├── utils/
│   ├── i18n.js                  #   双语字典 + 语言解析规则
│   └── cartUtils.js             #   购物车价格聚合纯函数
└── __tests__/               # 6 组 Vitest + Testing Library 组件/切片测试
```

**数据流纪律**：所有服务端数据一律经 RTK Query 端点进出（自动缓存、失效、重取），组件内部禁止出现 fetch/axios——这条纪律由 verify.sh 静态扫描强制。客户端状态（购物车、语言、登录态）走常规 slice 并持久化到 localStorage。这样带来的直接收益是：**AI 新增任何数据交互时只有一种正确写法**，代码风格不可能发散。

**i18n 双级合流**是前端最精巧的一处设计：访客的语言偏好存 localStorage；登录用户的偏好存在 `User.uiLanguage`；登录瞬间执行合流规则（用户档案优先，但不得覆盖访客刚刚手动切换的选择——memory 库中恰好有一条记录此坑的四段式条目 `login-overwrites-guest-uiLanguage`）。

## 5. `e2e/` — Playwright 取证测试

```
e2e/
├── playwright.config.js     # baseURL=http://localhost:3000，截图/trace 配置
└── tests/
    ├── home.spec.js         # 首页加载 + 商品卡渲染
    ├── search.spec.js       # 关键词搜索 → 结果断言
    └── cart.spec.js         # 加购 → 角标变化 → 购物车页数量断言
```

E2E 在 Harness 中的定位不是"覆盖率工具"而是**取证工具**：TE 角色按 B 类用例（与 BDD Scenario 1:1 对照）与 C 类回归用例组织测试，关键步骤截图存入任务的 `evidence/` 目录，成为证据链的一部分。`check-e2e-evidence.py` 校验证据文件的存在性。

## 6. `mcp-server/` — 本地 MCP 工具

103 行的极简 MCP 服务（`mcp.json` 注册），向 IDE 内的 AI 暴露三个工具：`get_board`（读任务看板）、`get_task_status`（读某任务当前状态机阶段）、`run_verify`（触发 verify.sh 并返回结构化结果）。它演示了 Harness 演进方向之一——把门禁与状态查询从"AI 跑 shell 命令"升级为"结构化工具调用"。

## 7. 根目录工程化配置

| 文件 | 作用 |
|------|------|
| `package.json` | 工作区脚本中枢：`dev`（concurrently 起前后端）、`test` / `test:frontend` / `test:e2e`、`data:import`、`verify`、`check:harness` |
| `.env.example` | 7 个环境变量的开箱即用默认值（PORT=5001、MONGO_URI、JWT_SECRET、FX_UPSTREAM_URL、FX_REFRESH_INTERVAL_MS、PAGINATION_LIMIT 等） |
| `.gitignore` | 排除 node_modules、.env、构建产物、hook-results 运行时文件 |

## 8. 阅读源码的推荐路径

建议按以下顺序建立认知，每步约 15—30 分钟：

1. **`.harness/GUIDE.md`** — 先理解框架为什么存在、状态机与四层防线全貌；
2. **`.harness/deliverables/_archive/exchange-rate-cache-fallback/`** — 顺着 7 份文档读完一个真实任务的完整生命周期（强烈推荐，这是理解 Harness 的最短路径）；
3. **`.harness/agents/pm.md` + `developer.md`** — 体会角色契约"输入→职责→产出→禁区"的写法；
4. **`.harness/scripts/verify.sh`** — 逐项阅读 19 条门禁，对照业务代码理解每条的意图；
5. **`backend/app.js` → `orderController.js` → `fxService.js`** — 走通一条后端调用链；
6. **`frontend/src/store.js` → `apiSlice.js` → `OrderScreen.jsx`** — 走通一条前端数据流；
7. **`.cursor/hooks/dispatch-subagent.py`** — 理解旁路验证的实现细节（进程外并行四项验证 + JSON 落盘）。
