---
name: systematic-debug
description: 系统化调试 SOP（第 0 步查 memory；按 fail 类型分类定位；最小修复；回归并沉淀经验）
---

# systematic-debug — 系统化调试

任何 FAIL 都禁止"瞎试"。按以下步骤：

## 第 0 步：查 memory（必做）

```bash
grep -i "<关键词>" .harness/memory/index.md
```
命中 → 渐进加载对应 entry 全文，historical fix 优先复用。

## 1. 读错误信息，按 fail 类型分类

| 类型 | 定位方法 |
|------|---------|
| 单测失败 | 代码级：读第一个失败断言的期望/实际差异 |
| 前端构建失败 | 看构建输出**尾部 20 行**；优先查 import 路径与依赖缺失 |
| 后端启动失败 | 查端口占用 `EADDRINUSE`；否则找日志里**第一个 error**/connection refused 的路径 |
| E2E 失败 | 区分选择器问题（TE-owned）vs 功能问题（Dev-owned） |

## 2. 复现

用最小命令稳定复现（单个测试文件/单个用例），不能复现的不修。

## 3. 聚焦本次变更

`git diff` / dev-log 变更清单——bug 大概率在本次改动内，别全库乱翻。

## 4. 定位边界

前后端边界（network 面板/接口返回）先切一刀，确定问题侧。

## 5. 最小修复

只改根因点；禁止顺手大重构、禁止注释测试。

## 6. 验证

重跑失败用例 → 绿。

## 7. 回归 + 沉淀

全量单测回归；把可复用的坑写进 dev-log「可复用经验」节（archive 时进 memory）。
