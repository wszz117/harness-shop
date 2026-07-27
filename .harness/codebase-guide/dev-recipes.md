# 开发菜谱（dev-recipes）

> 常见开发动作的标准步骤。照方抓药，别自由发挥。

## 菜谱 1：新增后端接口

1. `backend/routes/<域>Routes.js` 声明路由（注意静态路径在 `/:id` 之前）。
2. `backend/controllers/<域>Controller.js` 写 controller，**必须 asyncHandler 包裹**；鉴权用 `protect`/`admin`；参数含 :id 加 `checkObjectId`。
3. 若新路由文件 → `backend/app.js` 挂载 `app.use('/api/<域>', <域>Routes)`。
4. 错误响应带稳定 `messageKey`（i18n 域约定）。
5. 先写 `backend/tests/<域>.test.js`（supertest + 内存 Mongo）红 → 实现绿（TDD）。

## 菜谱 2：新增前端页面

1. `frontend/src/screens/<Name>Screen.jsx`（admin 页放 `screens/admin/`）。
2. `frontend/src/index.jsx` 路由树注册；需登录包 `<PrivateRoute>`，管理员包 `<AdminRoute>`。
3. 数据经 RTK Query：在对应 `slices/<域>ApiSlice.js` `injectEndpoints`，**禁止 fetch/axios 直调**（verify.sh 检测）。
4. 文案全部走 `useT()` 词典 key，zh/en 双写（en 覆盖率单测强制）。
5. UI 用 React Bootstrap，禁内联 style。

## 菜谱 3：新增 Redux 状态

1. `frontend/src/slices/<name>Slice.js` createSlice；需持久化则在 reducer 内写 localStorage。
2. `store.js` 注册 reducer。
3. 单测 `frontend/src/tests/<name>Slice.test.js` 覆盖核心 reducer 分支。

## 菜谱 4：新增业务域

1. `.harness/specs/<domain>.md` 建域文件（BDD + 唯一编号 `<前缀>-R/S-xxx`），`_index.md` 加行。
2. 后端按菜谱 1，前端按菜谱 2/3。
3. E2E 关键路径 1-2 条进 `e2e/tests/`。

## 菜谱 5：改动后自证（提交前必跑）

```bash
npm test && npm run test:frontend          # 单测全绿
cd frontend && npm run build && cd ..      # 构建过
bash .harness/scripts/verify.sh            # 19 项硬门禁
bash .harness/scripts/backend-smoke.sh     # 后端冒烟
```

## 菜谱 6：调试失败

调用 `systematic-debug` skill：第 0 步先 `grep .harness/memory/index.md` 查历史坑，再按 SOP 分类定位。
