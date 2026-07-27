# 快速上手指南（Getting Started）

> 本指南带您从零环境到跑通整个项目：先把电商应用运行起来，再体验一次 Harness 工作流。预计耗时 15—30 分钟。

## 1. 环境准备

| 依赖 | 版本要求 | 检查命令 | 安装参考 |
|------|---------|---------|---------|
| Node.js | ≥ 20（建议 22） | `node -v` | [nodejs.org](https://nodejs.org/) 或 nvm |
| MongoDB | ≥ 6 | `mongod --version` | 见下方两种方式 |
| Git | 任意较新版本 | `git --version` | [git-scm.com](https://git-scm.com/) |

**MongoDB 两种安装方式**（择一）：

```bash
# 方式 A：Docker（最省事）
docker run -d --name mongo -p 27017:27017 mongo:7

# 方式 B：本机安装（Ubuntu 示例）
sudo apt install -y mongodb-org && sudo systemctl start mongod
```

## 2. 克隆与安装

```bash
git clone https://github.com/wszz117/harness-shop.git
cd harness-shop

# 安装根依赖（后端 + 工具链）
npm install

# 安装前端依赖
cd frontend && npm install && cd ..
```

## 3. 配置环境变量

```bash
cp .env.example .env
```

默认值开箱即用，无需修改即可本地运行。各变量含义：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `NODE_ENV` | development | 运行模式 |
| `PORT` | 5001 | 后端端口 |
| `MONGO_URI` | mongodb://127.0.0.1:27017/shop-v2 | 数据库连接串 |
| `JWT_SECRET` | （样例值） | **生产环境务必更换**为强随机串 |
| `FX_UPSTREAM_URL` | （样例值） | 汇率上游接口（不可用时自动降级，不影响运行） |
| `FX_REFRESH_INTERVAL_MS` | 3600000 | 汇率快照刷新间隔 |
| `PAGINATION_LIMIT` | 8 | 商品列表每页数量 |

## 4. 灌入种子数据并启动

```bash
# 若 MongoDB 尚未运行，可用脚本拉起（本机安装了 mongod 时）
bash .harness/scripts/ensure-mongodb.sh

# 灌入种子数据：双语商品 + 两个演示账号
npm run data:import

# 一键并发启动前后端
npm run dev
```

启动成功后：前端 [http://localhost:3000](http://localhost:3000)，后端 API [http://localhost:5001/api](http://localhost:5001/api)。

| 演示账号 | 邮箱 | 密码 | 能做什么 |
|------|------|------|---------|
| 管理员 | admin@example.com | 123456 | 全部功能 + 后台商品/订单/用户管理 |
| 普通用户 | john@example.com | 123456 | 浏览/购物/下单/收藏/双语切换 |

**建议的体验路线**：首页浏览商品 → 右上角切换中英文 → 搜索商品 → 进入详情页写评论 → 加入购物车 → 走完下单三步（地址/支付方式/确认）→ 在订单页观察 USD/CNY 双币价格与汇率状态横幅 → 用管理员账号看后台。

## 5. 运行测试与门禁

```bash
npm test                # 后端单测：Vitest + 内存 MongoDB，完全离线可跑
npm run test:frontend   # 前端单测：Vitest + Testing Library
npm run test:e2e        # E2E：需要 npm run dev 正在运行 + 已灌种子数据
                        # 首次需要：npx playwright install chromium

bash .harness/scripts/verify.sh         # 19 项工程规范硬门禁
bash .harness/scripts/check-harness.sh  # 90+ 项框架结构体检
```

看到 `verify.sh` 输出全绿并以退出码 0 结束，就是 Harness 所说的"硬门禁通过"——这正是 AI 每次收工时被自动检查的内容。

## 6. 体验一次 Harness 工作流（Cursor 用户）

如果您使用 [Cursor](https://cursor.com/)，用它打开本仓库即可获得完整的 Harness 体验（commands、rules、hooks 均已就位）：

1. **读总纲**：先花 10 分钟读 `.harness/GUIDE.md`；
2. **看示例**：浏览 `.harness/deliverables/_archive/exchange-rate-cache-fallback/` 的 7 份文档，理解一个任务的完整生命周期；
3. **发起任务**：在 Cursor 对话框输入 `/harness-propose my-first-task 给商品卡片增加"新品"角标，上架 7 天内的商品显示`；
4. **观察接力**：BA → SA →（RR）依次产出 requirements.md / design.md / readiness-review.md，PM 以 `[PM]` 心跳汇报进度；
5. **人工审批 1**：审阅文档后回复批准；
6. **实施**：输入 `/harness-apply my-first-task`，观察 Dev 的 TDD 红绿循环，以及收工时 hooks 自动验证写入的 `.harness/.hook-results/`；
7. **人工审批 2 与归档**：核验证据链后 `/harness-archive my-first-task`，观察 Spec Merge 与 Memory Merge。

> 不使用 Cursor 也没关系：`.harness/` 的全部资产（契约/模板/脚本/状态机）是纯 Markdown + Shell/Python，其思想适用于任何 AI 编码工具；hooks 旁路验证目前依赖 Cursor 的事件机制，是唯一强绑定项。

## 7. 常见问题（FAQ）

| 问题 | 处理 |
|------|------|
| `mongod` 未安装 / 连接失败 | 用 Docker：`docker run -d -p 27017:27017 mongo:7`，确认 `.env` 的 `MONGO_URI` 指向 127.0.0.1:27017 |
| 端口被占用 | 后端改 `.env` 的 `PORT`；前端端口在 `frontend/vite.config.js` |
| E2E 报浏览器缺失 | `npx playwright install chromium` |
| 后端单测首次运行较慢 | mongodb-memory-server 首次会下载内嵌 Mongo 二进制，之后离线可跑 |
| 汇率横幅显示"暂不可用" | 正常现象：上游接口不可达时自动降级，不影响任何购物功能（这正是该功能的设计目标） |
| Windows 下脚本无法运行 | 门禁脚本为 Bash 编写，建议使用 WSL2 或 Git Bash |

## 8. 下一步

跑通之后，推荐按 [代码结构深度解析](architecture/code-structure-analysis.md) 第 8 节的"源码阅读路径"深入；想把 Harness 用到自己项目的读者，请阅读 [移植指南](../.harness/multi-repo-adaptation.md)。
