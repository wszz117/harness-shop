# 知识工程（Knowledge Engineering）

Harness 维护三个长期知识库，分别回答三个问题：

| 知识库 | 回答的问题 | 更新时机 | 更新者 |
|--------|-----------|---------|--------|
| `specs/` | **系统应该做什么**（行为真相源） | archive 阶段 Spec Merge | PM（操作者模型） |
| `codebase-guide/` | **代码长什么样**（架构地图） | 结构性变化后 | SA 或人工 |
| `memory/` | **踩过什么坑**（经验教训） | archive 阶段 Memory Merge | PM（单一作者模型） |

## specs：行为规格库

- 每个业务域一个文件（products.md / orders.md / user-auth.md / wishlist.md / i18n.md / time-signal.md）。
- BDD 格式：`## Requirement: <名> (<域>-R-xxx)` + `### Scenario: <名> (<域>-S-xxx)`，GIVEN/WHEN/THEN/AND。
- **编号全库唯一且永不复用**；行为退役时移入文件末尾「退役列表」，编号保留。
- `_index.md` 是域索引；`_flows.md` 记录跨域流程。
- Spec Merge 契约：requirements.md 的「Spec Delta」表逐行落实到对应域文件；无 Delta 则记 N/A。

## codebase-guide：代码知识库（aider 风格）

- `index.md` 入口 → `overview.md` 全景 → `backend-arch.md` / `frontend-arch.md`（路由/组件 → 调用链一行流）→ `deps.md` 依赖清单 → `dev-recipes.md` 开发菜谱。
- 调用链一行流示例：`GET /api/products → getProducts → buildKeywordFilter + Product.find + projectProductForLang`。
- 初始化用 `/codebase-guide-init` 命令：脚本收集事实 → 按骨架模板填表。

## memory：经验记忆库

- 条目命名：`YYYY-MM-DD__<域>__<slug>.md`。
- 四段式：**症状**（怎么爆的）/ **根因**（为什么会发生）/ **修复**（怎么修）/ **防复发措施**（测试+检测）。
- 来源单一：只从 dev-log.md 的「可复用经验」节提炼（单一作者模型，防止污染）。
- 消费方式：systematic-debug skill 第 0 步 grep 关键词渐进加载。

## 知识流转闭环

```
任务执行(dev-log 可复用经验) ──archive──▶ memory/entries
任务需求(requirements Spec Delta) ──archive──▶ specs/<域>.md
结构性变更(design.md) ──人工/SA──▶ codebase-guide
memory + specs + codebase-guide ──propose/apply 阶段──▶ 角色输入
```
