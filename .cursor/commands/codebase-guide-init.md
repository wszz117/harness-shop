# /codebase-guide-init — 代码知识库初始化

为当前仓库生成/重建 `.harness/codebase-guide/` 六文档。

## 执行流程

1. **收集客观事实**：`bash .harness/scripts/codebase-guide-init.sh` → 事实落 `.reports/codebase-guide-init-facts.txt`（package.json、目录树、路由声明、挂载、前端路由树、slices 清单）。
2. **按骨架填表**：读 `.harness/templates/codebase-guide-skeletons/*.tpl`，逐一生成：
   - index.md（导览表）
   - overview.md（技术栈/端口命令/目录/业务域）
   - backend-arch.md（**路由映射表：每行一条调用链一行流**，事实来自收集文件，不许臆造）
   - frontend-arch.md（路由→页面→状态源映射 + store 表 + 关键组件表）
   - deps.md（依赖表 + 选型说明）
   - dev-recipes.md（增接口/增页面/增 slice/增域/自证/调试 六个菜谱）
3. **自检**：`bash .harness/scripts/check-harness.sh` 中 codebase-guide 相关项全过。

## 纪律

- 只写**从事实文件可验证**的内容；推断性描述必须标注「推断」。
- 调用链一行流格式：`<METHOD> <path> → <controller> → <关键函数/模型链>`。
