# shop-v2 · Harness 工程化 AI 驱动开发系统 — 完整说明文档

> 本文是项目的完整机制参考手册，覆盖 Harness 框架与业务应用的全部设计细节。
> 它包含两部分：一套完整的 **Harness AI 工程化框架**（`.cursor/` + `.harness/`），以及一个作为承载底座的、可直接本地运行的 **MERN 电商项目**（React 18 + Express + MongoDB + Playwright）。
>
> 核心理念：**"智能体的能力上限取决于模型；交付质量的下限取决于流程。"**
> 完成的定义 = 证据链（退出码 + 测试输出 + 截图），而不是 AI 的自我陈述。

---

## 目录

1. [Harness 是什么、解决什么问题](#一harness-是什么解决什么问题)
2. [快速开始（本地运行步骤）](#二快速开始本地运行步骤)
3. [项目目录结构总览](#三项目目录结构总览)
4. [Harness 框架详解（四层防线）](#四harness-框架详解四层防线)
5. [三命令工作流与 8 阶段状态机](#五三命令工作流与-8-阶段状态机)
6. [7 个 AI 角色契约](#六7-个-ai-角色契约)
7. [知识工程：specs / codebase-guide / memory](#七知识工程specs--codebase-guide--memory)
8. [13 个硬门禁脚本](#八13-个硬门禁脚本)
9. [Hooks 旁路验证机制](#九hooks-旁路验证机制)
10. [业务系统功能说明（电商底座）](#十业务系统功能说明电商底座)
11. [测试体系](#十一测试体系)
12. [示例归档任务（完整流程演示）](#十二示例归档任务完整流程演示)
13. [如何在 Cursor 中实际使用](#十三如何在-cursor-中实际使用)
14. [验证结果记录](#十四验证结果记录)
15. [常见问题排查](#十五常见问题排查)

---

## 一、Harness 是什么、解决什么问题

Harness（缰绳/挽具）是给 AI 编码代理（Cursor Agent 等）套上的一整套**工程化约束系统**。实践中裸用 AI 代理存在四类结构性缺陷：

| # | 结构性缺陷 | 表现 | Harness 对策 |
|---|-----------|------|-------------|
| 1 | **规则遗忘** | 上下文一长，此前立的规矩被冲掉 | 规则拆层：rules 常驻 + 契约文件每棒重读 |
| 2 | **约束规避** | 测试跑不过就改测试、跳过测试 | hooks 旁路验证 + scripts 硬门禁（AI 无法篡改退出码） |
| 3 | **自审失效** | 自己写的代码自己审，走过场 | 角色分离：Dev / CR / TE 三棒接力，互为制衡 |
| 4 | **虚报完成** | 声称"已完成"但根本没跑通 | 证据链文化：TDD 红绿记录、退出码、截图缺一不可 |

因此整个系统的**范式转换**是：不追问 AI"你做完了吗"，而是让流程自动产生**不可伪造的证据**。

---

## 二、快速开始（本地运行步骤）

### 2.1 环境要求

| 依赖 | 版本要求 | 说明 |
|------|---------|------|
| Node.js | ≥ 20（建议 22） | `node -v` 检查 |
| npm | ≥ 10 | 随 Node 安装 |
| MongoDB | ≥ 6（建议 7） | 本机 `127.0.0.1:27017`；也可用 Docker |
| Playwright Chromium | 可选 | 只有跑 E2E 时需要 |

MongoDB 快速安装（任选其一）：

```bash
# 方式 A：Docker（最简单）
docker run -d --name shop-mongo -p 27017:27017 mongo:7

# 方式 B：Ubuntu 原生安装
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update && sudo apt-get install -y mongodb-org
sudo systemctl start mongod

# 方式 C：macOS
brew tap mongodb/brew && brew install mongodb-community@7.0 && brew services start mongodb-community@7.0
```

### 2.2 启动步骤（5 步）

```bash
# ① 解压并进入项目
unzip shop-v2-harness.zip && cd shop-v2

# ② 安装依赖（根 + 前端两处）
npm install
cd frontend && npm install && cd ..

# ③ 准备环境变量（默认值开箱即用，无需修改）
cp .env.example .env

# ④ 灌入种子数据（10 个双语商品 + 3 个账号）
npm run data:import

# ⑤ 一键起前后端
npm run dev
```

启动成功后：
- 前端：http://localhost:3000
- 后端 API：http://localhost:5001 （前端已配置代理）

### 2.3 默认账号

| 角色 | 邮箱 | 密码 | 权限 |
|------|------|------|------|
| 管理员 | admin@example.com | 123456 | 商品/订单/用户管理后台 |
| 普通用户 | john@example.com | 123456 | 购物、收藏、下单 |
| 普通用户 | jane@example.com | 123456 | 购物、收藏、下单 |

### 2.4 验证命令速查

```bash
npm test                                  # 后端单测（32 个用例，内存 Mongo，无需装 MongoDB）
npm run test:frontend                     # 前端单测（18 个用例）
bash .harness/scripts/verify.sh           # 19 项硬门禁
bash .harness/scripts/check-harness.sh    # 133 项 Harness 结构体检
bash .harness/scripts/backend-smoke.sh    # 后端冒烟（自动找空闲端口）
npm run test:e2e                          # E2E（需先 npm run dev + 种子数据 + chromium）
```

---

## 三、项目目录结构总览

```
shop-v2/
├── .cursor/                        # 【Cursor 侧入口层】
│   ├── commands/                   #   4 个自定义命令（工作流引擎）
│   │   ├── harness-propose.md      #     /harness-propose — 提案阶段（BA→SA→RR）
│   │   ├── harness-apply.md        #     /harness-apply — 实施阶段（Dev→CR→TE）
│   │   ├── harness-archive.md      #     /harness-archive — 归档（Spec/Memory Merge）
│   │   └── codebase-guide-init.md  #     /codebase-guide-init — 代码知识库初始化
│   ├── rules/                      #   3 个常驻规则（软约束）
│   │   ├── harness-core.mdc        #     研发纪律：先读契约、证据链、禁止越权
│   │   ├── code-standards.mdc      #     代码规范：ESM/asyncHandler/RTK Query/300行
│   │   └── workflow-discipline.mdc #     工作流纪律：阶段门禁、PM 心跳
│   ├── skills/                     #   5 个操作手册（SOP）
│   │   ├── build-test/SKILL.md     #     构建与测试标准流程
│   │   ├── post-verify/SKILL.md    #     开发收尾自检流程
│   │   ├── code-review/SKILL.md    #     代码审查 13 节流程
│   │   ├── test-e2e/SKILL.md       #     Playwright E2E 取证流程
│   │   └── systematic-debug/SKILL.md #   系统化调试（假设→验证→修复）
│   ├── hooks/                      #   钩子脚本（旁路验证，AI 无法绕过）
│   │   ├── dispatch-subagent.py    #     subagentStop 事件分发器
│   │   ├── dispatch-prompt.py      #     beforeSubmitPrompt 事件分发器
│   │   ├── session-node-env.py     #     sessionStart 环境自检
│   │   └── subagent/               #     各角色收工验证器
│   │       ├── _actions_developer.py   # Dev 收工：并行跑单测+verify+baseline
│   │       ├── _actions_reviewer.py    # CR 收工：报告完整性校验
│   │       ├── _actions_tester.py      # TE 收工：证据截图存在性校验
│   │       └── _common.py              # 公共：读写 .hook-results JSON
│   ├── hooks.json                  #   3 事件注册表
│   └── mcp.json                    #   本地 MCP 服务注册
├── .harness/                       # 【Harness 资产层（单一真相源）】
│   ├── GUIDE.md                    #   总纲（为什么/状态机/四层防线/PM纪律/对比）
│   ├── knowledge-engineering.md    #   知识工程说明（specs/guide/memory 三库定位）
│   ├── multi-repo-adaptation.md    #   多仓库/新项目移植指南
│   ├── agents/                     #   7 角色契约（详见第六章）
│   ├── specs/                      #   业务规格库（8 文件，BDD + 唯一编号）
│   ├── codebase-guide/             #   代码知识库（6 文件，调用链一行流）
│   ├── memory/                     #   经验记忆库（index + 4 条示例 entry）
│   ├── templates/                  #   9 个填表式模板 + codebase-guide 骨架
│   ├── scripts/                    #   13 个硬门禁脚本（详见第八章）
│   ├── deliverables/               #   任务交付目录
│   │   └── _archive/exchange-rate-cache-fallback/  # 完整示例归档任务（7 文档全套）
│   ├── tasks/board.md              #   任务看板
│   ├── workflow/                   #   状态机 transitions.json + 子代理编排
│   ├── baseline.json               #   质量基线快照
│   ├── eval-design/                #   评测设计说明
│   └── .hook-logs/ .hook-results/  #   钩子运行日志与结果 JSON
├── backend/                        # 【后端 Express + Mongoose（ESM）】
│   ├── server.js                   #   只负责 listen + fx 定时刷新启动
│   ├── app.js                      #   Express app：中间件 + 5 组路由挂载
│   ├── config/db.js                #   Mongo 连接
│   ├── models/                     #   User / Product / Order（全部 timestamps）
│   ├── routes/                     #   products / users / orders / upload / fx
│   ├── controllers/                #   全部 asyncHandler 包裹 + messageKey 错误
│   ├── services/fxService.js       #   汇率快照缓存 + 降级（示例任务产物）
│   ├── middleware/                 #   protect/admin JWT 鉴权、错误处理、checkObjectId
│   ├── utils/                      #   calcPrices / generateToken / productI18n
│   ├── data/ + seeder.js           #   双语种子数据与灌库脚本
│   └── tests/                      #   Vitest + mongodb-memory-server（32 用例）
├── frontend/                       # 【前端 React 18 + RTK + Vite】
│   ├── src/index.jsx               #   路由树集中注册（verify 检查项）
│   ├── src/store.js                #   Redux store
│   ├── src/slices/                 #   apiSlice(RTK Query 基座)/auth/cart/language/fx/...
│   ├── src/components/             #   Header/Product/SearchBox/WishlistHeart/MoneyDisplay/...
│   ├── src/screens/                #   Home/Product/Cart/Login/.../admin 4 屏
│   ├── src/utils/i18n.js           #   中英双语词典
│   └── src/tests/                  #   前端单测（18 用例）
├── e2e/                            # Playwright E2E（home/search/cart 3 spec）
├── mcp-server/index.js             # 本地 MCP：看板查询/任务状态/verify 触发
├── package.json                    # 根：并发起前后端 + 测试脚本
└── README.md                       # 精简版快速开始
```

---

## 四、Harness 框架详解（四层防线）

框架的核心设计：**约束从软到硬分四层，越往下越不可绕过**。

| 层 | 位置 | 性质 | 触发时机 | AI 能否绕过 |
|----|------|------|---------|------------|
| 1. rules | `.cursor/rules/*.mdc` | 软约束（提示词常驻） | 每次对话注入 | 可能遗忘 |
| 2. skills | `.cursor/skills/*/SKILL.md` | SOP 操作手册 | 角色按契约主动读取 | 可能敷衍 |
| 3. hooks | `.cursor/hooks/` + `hooks.json` | 旁路验证（进程外） | 事件自动触发 | **不能** |
| 4. scripts | `.harness/scripts/` | 硬门禁（退出码） | hooks/PM/人工调用 | **不能** |

关键机制：**Dev 子代理宣布收工时，`subagentStop` 钩子在 AI 进程之外自动并行执行"前端单测 + 后端单测 + verify.sh + baseline.sh"，把真实退出码写进 `.harness/.hook-results/<task>/developer.json`。PM 必须读到该 JSON 全 PASS 才允许交接下一棒。** AI 说什么不重要，退出码说了算。

---

## 五、三命令工作流与 8 阶段状态机

### 5.1 三命令两卡点

```
/harness-propose <task-slug> <一句话需求>
    └─ PM 调度：BA(requirements) → SA(design) → RR(readiness-review)
    └─ ⏸ 人工审批卡点 1（人审提案三件套）

/harness-apply <task-slug>
    └─ PM 调度：Dev(dev-log, TDD) → CR(code-review, 13节) → TE(test-report, E2E取证)
    └─ ⏸ 人工审批卡点 2（AWAITING_ARCHIVE，人审证据链）

/harness-archive <task-slug>
    └─ Spec Merge（Delta 并入 specs/）＋ Memory Merge（经验入库）
    └─ 任务目录移入 _archive/ ＋ 报告截图路径改写 ＋ board 更新 → DONE
```

### 5.2 8 阶段状态机（workflow/transitions.json）

```
PROPOSED → REQUIREMENTS → DESIGN → READINESS → DEVELOPMENT
        → CODE_REVIEW → TESTING → AWAITING_ARCHIVE → DONE
```

### 5.3 三种流程档位（Profile）

在 `proposal.md` 中勾选，是**唯一真相源**：

| Profile | 适用场景 | propose 棒次 | apply 棒次 |
|---------|---------|-------------|-----------|
| quick | 改文案/样式/1-2 文件小修 | BA→SA（SA 文末就绪自评，跳过 RR） | Dev→CR→TE |
| standard | 默认；新功能/改行为 | BA→SA→RR | Dev→CR→TE |
| refactor | 跨 ≥2 域/公共架构重构 | SA 影响面预扫描→BA→SA→RR | Dev→CR→TE |

### 5.4 PM 输出纪律（六类心跳）

PM 在主对话只输出六类 `[PM]` 心跳行，绝不粘贴大段文档内容：

```
[PM] 启动棒次: business-analyst (任务: xxx, profile: standard)
[PM] 收工验证: developer → .hook-results PASS (tests 50/50, verify 0)
[PM] 打回重做: code-review REJECT → developer (第 2/3 次)
[PM] 阶段推进: DESIGN → READINESS (board 已更新)
[PM] 人工卡点: 提案三件套就绪，等待人工审批
[PM] 异常上报: TE 环境阻塞 (mongod 未启动)，等待人工处理
```

同一棒次最多打回 **3 次**，仍失败则升级人工。

---

## 六、7 个 AI 角色契约

每个角色一份契约文件（`.harness/agents/*.md`），子代理启动第一动作是**读自己的契约**：

| 角色 | 文件 | 产出 | 关键约束 |
|------|------|------|---------|
| 项目经理 PM | project-manager.md | 调度与心跳 | 只调度不干活；先读 hook-results 再交棒；打回上限 3 次 |
| 业务分析师 BA | business-analyst.md | requirements.md | BDD（GIVEN/WHEN/THEN）；全库唯一编号（含退役列表核对）；单域归属；禁写实现细节 |
| 方案架构师 SA | solution-architect.md | design.md | W-xx 工作项与 R/S 双向覆盖；Dev/TE-owned 划分；Testing-only 视觉口径逐条写明 |
| 就绪评审 RR | readiness-reviewer.md | readiness-review.md | 10 项 checklist；任一 FAIL 即 BLOCK 打回 |
| 开发工程师 Dev | developer.md | dev-log.md + 代码 | 严格 TDD（先红后绿，记录真实输出）；只做 Dev-owned；收尾跑 post-verify |
| 代码审查 CR | code-reviewer.md | code-review.md | 13 节结构；逐 Scenario 找证据（文件:行号）；审 TDD 记录可信度 |
| 测试工程师 TE | test-engineer.md | test-report.md | B 类与 Scenario 1:1；C 类回归 1-2 spec；截图证据；环境阻塞≠FAIL |

---

## 七、知识工程：specs / codebase-guide / memory

三库分工（`.harness/knowledge-engineering.md`）：

| 库 | 回答的问题 | 更新时机 |
|----|-----------|---------|
| **specs/** | 系统"应该是什么行为"（真相源） | /harness-archive 时 Spec Merge |
| **codebase-guide/** | 代码"现在长什么样、怎么改" | 结构变化时随任务更新 |
| **memory/** | "踩过什么坑、怎么防复发" | /harness-archive 时 Memory Merge |

**specs**：8 文件（_index 总表、_flows 跨域流程、products/user-auth/orders/wishlist/i18n/time-signal 六域）。每条需求 `<域前缀>-R-xxx`，场景 `<域前缀>-S-xxx`，全库唯一且**永不复用**（退役列表占号）。

**codebase-guide**：aider 风格"调用链一行流"，如：
```
GET /api/products → getProducts → buildKeywordFilter(i18n) → Product.find(分页) → projectProductForLang
```

**memory**：每条经验四段式——**症状（怎么爆的）/ 根因（为什么）/ 修复（怎么修）/ 防复发（测试+检测）**。内置 4 条真实沉淀的条目（RTK 缓存残留、登录覆盖访客语言、Vitest CSS Module、视觉去重 ID 错位）。

---

## 八、13 个硬门禁脚本

| 脚本 | 职责 |
|------|------|
| init-task.sh | 建任务目录 + proposal 模板 + board 登记（幂等） |
| stage-doc.sh | 按阶段落模板（已存在则保留） |
| **verify.sh** | **19 项硬门禁**：300 行上限 / console.log / ESM / 路由挂载 / asyncHandler / timestamps / RTK 直调 / 内联 style / 路由注册 / 模板残留 / board 格式 / spec-lint / 索引一致 ×3 / agents 齐全 / hooks 合法 / 测试存在 ×2 |
| **check-harness.sh** | **133 项结构体检**：目录/文件/权限/JSON 合法性/索引一致性全量扫描 |
| backend-smoke.sh | 自动找空闲端口起后端 + curl 探活（环境问题降级 WARN 不误伤） |
| baseline.sh | 质量基线记录/对比（git 干净度 + 测试通过数） |
| build-stamp.sh | 前端构建 + 构建戳记录 |
| ensure-mongodb.sh | mongod 探活/拉起 |
| ensure-playwright.sh | chromium 就绪检查/安装 |
| check-e2e-evidence.py | 校验 test-report 引用截图真实存在；归档时改写路径 |
| spec-lint.py | specs 编号唯一性 + GWT 格式 + 退役列表格式 |
| codebase-guide-init.sh | 采集依赖/目录树/路由事实供 guide 初始化 |
| dev/dev-up.sh, dev/reset-db.sh | 本地开发便捷脚本 |

---

## 九、Hooks 旁路验证机制

`hooks.json` 注册 3 个事件：

```json
{
  "version": 1,
  "hooks": {
    "sessionStart":       [{ "command": "python3 .cursor/hooks/session-node-env.py" }],
    "subagentStop":       [{ "command": "python3 .cursor/hooks/dispatch-subagent.py" }],
    "beforeSubmitPrompt": [{ "command": "python3 .cursor/hooks/dispatch-prompt.py" }]
  }
}
```

- **sessionStart**：会话开始自检 Node 版本 / 依赖完整性，异常写警示。
- **subagentStop**：识别收工的子代理角色 → 分发到 `_actions_developer.py`（并行跑 4 项验证）/ `_actions_reviewer.py` / `_actions_tester.py` → 结果 JSON 写 `.harness/.hook-results/<task>/<role>.json`，日志写 `.harness/.hook-logs/`。
- **beforeSubmitPrompt**：检测 `/harness-*` 命令参数合法性、任务是否存在、阶段是否匹配，不合法直接拦截提示。

---

## 十、业务系统功能说明（电商底座）

| 模块 | 功能 | 关键实现 |
|------|------|---------|
| 商品 | 列表/分页/搜索/详情/Top3 轮播/评论评分 | RTK Query + keyword 双语匹配 + PAGINATION_LIMIT |
| 购物车 | 加购/改数量/删除/本地持久化 | cartSlice + localStorage + calcPrices 服务端复算 |
| 下单 | 地址→支付方式→下单→订单详情→(管理员)发货 | Order 模型 + protect 鉴权 + 状态时间戳 |
| 用户 | 注册/登录/资料/JWT httpOnly cookie | generateToken + protect/admin 中间件 |
| 收藏 | 红心切换/独立页/空态双语/账号隔离 | User.wishlist + /api/users/wishlist 三接口 |
| 双语 | 中英切换；访客 localStorage / 登录随账号 | languageSlice + utils/i18n.js + 后端 messageKey + 商品字段级投影(name_en) |
| 汇率 | USD 主价 + CNY 参考价 + 快照缓存降级 | fxService 内存快照 + 200(fresh/cached)/503 + 前端横幅 |
| 管理端 | 商品/订单/用户 CRUD | AdminRoute 守卫 + admin 中间件 |

后端错误一律返回 `messageKey`（如 `errors.productNotFound`），由前端词典渲染成对应语言——这是**后端不产人话文案**原则。

---

## 十一、测试体系

| 层 | 工具 | 数量 | 说明 |
|----|------|------|------|
| 后端单测 | Vitest + supertest + mongodb-memory-server | 6 文件 32 用例 | 无需真实 MongoDB，内存库自动起 |
| 前端单测 | Vitest + Testing Library + jsdom | 6 文件 18 用例 | slices 状态机 + 组件渲染 + 词典完整性 |
| E2E | Playwright | 3 spec | 首页/搜索/加购（需 npm run dev + 种子数据） |
| 门禁 | verify.sh / check-harness.sh | 19 + 133 项 | 退出码 0/1，hooks 自动触发 |

TDD 纪律（developer 契约）：每个 W-xx 先写失败测试（红），记录**真实失败输出**到 dev-log，再实现转绿，红绿证据齐全才算完成。

---

## 十二、示例归档任务（完整流程演示）

`.harness/deliverables/_archive/exchange-rate-cache-fallback/` 是一个**走完全流程的真实样例**（汇率快照缓存与降级），包含 7 份交付文档全套：

```
proposal.md            # 背景/范围/profile勾选(standard)/验收口径/风险
requirements.md        # FX-R-001/002，FX-S-001..005（BDD）+ Spec Delta 表
design.md              # W-01..W-06 工作项 + API 设计 + Testing-only 视觉口径
readiness-review.md    # 10 项 checklist 全 PASS
dev-log.md             # 变更清单 + TDD 红绿记录 + post-verify 退出码
code-review.md         # 13 节，逐 Scenario 文件:行号证据
test-report.md         # B 类 3 条(1:1) + C 类回归 1 条 + 证据截图
evidence/              # E2E 截图目录
```

对应的**真实代码**就在项目里：`backend/services/fxService.js`、`frontend/src/slices/fxSlice.js`、`MoneyDisplay.jsx`、`FxStatusBarBanner.jsx`——文档与代码互为印证，新任务照此模式滚动。

---

## 十三、如何在 Cursor 中实际使用

1. 用 Cursor 打开 `shop-v2` 目录（rules/skills/hooks/commands 自动生效）。
2. 发起新任务：
   ```
   /harness-propose add-product-tags 给商品增加标签筛选功能
   ```
   PM 会自动：init-task.sh 建目录 → 与你对齐 proposal → 依次调度 BA/SA/RR → 输出心跳 → 停在人工卡点 1。
3. 你人工审阅 `deliverables/add-product-tags/` 三件套，回复批准后：
   ```
   /harness-apply add-product-tags
   ```
   Dev TDD 开发 → 钩子旁路验证 → CR 审查 → TE E2E 取证 → 停在人工卡点 2。
4. 审阅证据链后归档：
   ```
   /harness-archive add-product-tags
   ```
   Spec Merge + Memory Merge + 移入 _archive → DONE。
5. 移植到其他项目：阅读 `.harness/multi-repo-adaptation.md`，核心是复制 `.cursor/` + `.harness/` 两目录并按新技术栈改写 code-standards、codebase-guide 与 verify.sh 检查项。

---

## 十四、验证结果记录

以下均为交付前在干净沙盒环境的实测结果：

| 验证项 | 结果 |
|--------|------|
| `npm install`（根 332 包 / 前端 258 包） | 成功 |
| `npm test` 后端单测 | **32/32 通过**（6 文件，6.96s） |
| `npm run test:frontend` 前端单测 | **18/18 通过**（6 文件，2.59s） |
| `cd frontend && npm run build` | 成功（411 模块，~2.2s） |
| `bash .harness/scripts/verify.sh` | **[VERIFY PASS] 全部 19 项通过** |
| `bash .harness/scripts/check-harness.sh` | **[CHECK-HARNESS PASS] 全部 133 项通过** |
| `bash .harness/scripts/backend-smoke.sh` | [OK] 后端启动成功 + API 根路径可访问 |
| E2E（Playwright） | 沙盒未装 MongoDB 跳过；本地按 2.2 节步骤后 `npm run test:e2e` 即可 |

> 后端单测使用 mongodb-memory-server，**首次运行会自动下载内嵌 Mongo 二进制（约 70MB）**，请保持网络畅通。

---

## 十五、常见问题排查

| 问题 | 原因与处理 |
|------|-----------|
| `npm run dev` 报 MongoDB 连接失败 | mongod 未启动：`bash .harness/scripts/ensure-mongodb.sh` 或 Docker 起 mongo:7 |
| 端口 5001/3000 被占用 | 改 `.env` 的 `PORT`；前端端口在 `frontend/vite.config.js` 的 `server.port` |
| 首页无商品 | 未灌种子数据：`npm run data:import`（清库重灌：`npm run data:destroy && npm run data:import`） |
| 后端单测首次很慢 | mongodb-memory-server 在下载内嵌二进制，等待即可；国内可设 `MONGOMS_DOWNLOAD_MIRROR=https://npmmirror.com/mirrors/mongodb` |
| E2E 报浏览器缺失 | `npx playwright install chromium` |
| 登录后接口 401 | JWT cookie 依赖同源代理，务必通过 http://localhost:3000 访问前端（勿直接开 build 产物） |
| Windows 跑 .sh 脚本失败 | 使用 Git Bash 或 WSL；核心 npm 命令不受影响 |
| 图片不显示 | 商品图为 frontend/public/images 占位图，路径 /images/*.jpg，检查前端静态服务 |

---

*本文档为项目完整机制参考手册；所有机制均已实测可运行。*
