# 代码库全景（Overview）

## 技术栈

| 层 | 选型 |
|----|------|
| 前端 | React 18 + Vite + Redux Toolkit + RTK Query + React Bootstrap + react-router-dom v6 |
| 后端 | Node.js (ESM) + Express + Mongoose |
| 数据库 | MongoDB (127.0.0.1:27017, 库名 shop-v2) |
| 单测 | Vitest（后端 supertest + mongodb-memory-server；前端 @testing-library/react + jsdom） |
| E2E | Playwright（chromium） |
| 认证 | JWT HttpOnly Cookie（protect / admin 中间件） |

## 端口与命令

| 项 | 值 |
|----|----|
| 后端 | 5001（`npm run server`） |
| 前端 | 3000（`npm run client`，vite dev + proxy → 5001） |
| 一键并跑 | `npm run dev`（concurrently） |
| 后端单测 | `npm test` |
| 前端单测 | `npm run test:frontend` |
| E2E | `npm run test:e2e` |
| 种子数据 | `npm run data:import`（清库重灌）/ `npm run data:destroy` |
| 硬门禁 | `npm run verify` / `npm run check:harness` |

## 顶层目录

```
backend/    server.js(只 listen) / app.js(挂路由) / config / models / controllers
            routes / middleware / services / utils / data / seeder.js / tests
frontend/   src/{index.jsx 路由树, store.js, slices, screens(+admin), components,
            utils/i18n.js, hooks, tests}  public/images
e2e/        playwright.config.js + tests/*.e2e.js
mcp-server/ index.js（本地 MCP 工具服务）
.cursor/    commands / hooks / rules / skills / hooks.json / mcp.json
.harness/   本工程（见 GUIDE.md）
```

## 业务域

products（商品）/ orders（订单）/ user-auth（认证）/ wishlist（我的收藏）/ i18n（双语）/ fx（USD-CNY 汇率，挂靠 time-signal 域）。行为真相源见 `.harness/specs/`。
