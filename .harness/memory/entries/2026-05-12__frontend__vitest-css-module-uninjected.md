---
tags: [vitest, css-module, jsdom]
---

# Vitest/jsdom 不注入 CSS Module

## 症状（怎么爆的）

组件单测断言元素 className 含有样式类（如 `active` 高亮）时失败；同样逻辑在浏览器手测正常。

## 根因（为什么会发生）

Vitest + jsdom 环境默认不会加载/注入 CSS（配置 `css: false`），CSS Module 导入返回空对象，`styles.active` 为 `undefined`，拼进 className 是 `"undefined"`。

## 修复（怎么修）

- 测试断言不依赖 CSS Module 生成的哈希类名，改用 `data-testid` / `aria-*` 语义属性断言状态。
- 保持 vitest 配置 `css: false`（提速），组件内状态类与语义属性双写。

## 防复发措施（测试 + 检测）

- 约定：单测状态断言一律用 `data-testid`/`aria` 属性，禁止断言 CSS Module 类名（写入 code-standards）。
- code-review §9 规范符合项检查该约定。
