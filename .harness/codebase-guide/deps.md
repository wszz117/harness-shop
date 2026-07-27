# 依赖清单（deps）

## 根 package.json（后端 + 工具链）

| 依赖 | 用途 |
|------|------|
| express / mongoose | Web 框架 / ODM |
| jsonwebtoken / cookie-parser / bcryptjs | JWT Cookie 认证与密码散列 |
| dotenv | .env 配置 |
| multer | 图片上传 |
| concurrently | dev 并跑前后端 |
| nodemon (dev) | 后端热重载 |
| vitest / supertest / mongodb-memory-server (dev) | 后端单测（内存 Mongo，不依赖本机 mongod） |
| @playwright/test (dev) | E2E |

## frontend/package.json

| 依赖 | 用途 |
|------|------|
| react / react-dom (18) | UI |
| @reduxjs/toolkit / react-redux | 状态 + RTK Query |
| react-router-dom (v6) | 路由 |
| react-bootstrap / bootstrap / react-icons | UI 组件（禁内联 style） |
| react-toastify | 提示 |
| vite / @vitejs/plugin-react (dev) | 构建（端口 3000, proxy /api → 5001, outDir build） |
| vitest / jsdom / @testing-library/* (dev) | 前端单测 |

## 选型说明

- **ESM-only 后端**：根 package.json `"type": "module"`，后端禁 `require()`（verify.sh 检测）。
- **mongodb-memory-server**：单测不依赖本机 mongod，CI 友好；运行时才需要真 MongoDB。
- **Vite 取代 CRA**：dev 端口固定 3000，构建产物 `frontend/build`（与 smoke/E2E 脚本约定一致）。
