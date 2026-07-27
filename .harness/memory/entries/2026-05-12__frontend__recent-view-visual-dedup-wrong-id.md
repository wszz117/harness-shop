---
tags: [dedup, selector, recent-view]
---

# 最近浏览视觉去重使用错误 id 字段

## 症状（怎么爆的）

最近浏览列表中同一商品出现多张重复卡片；E2E 截图断言「同一商品只出现一次」失败。

## 根因（为什么会发生）

去重 selector 以列表项包装对象的 `item.id`（本地生成的浏览记录 id）作为唯一键，而不是商品实体的 `item.product._id`。每次浏览产生新的记录 id，去重形同虚设。

## 修复（怎么修）

selector 中去重键改为 `item.product._id`；对历史脏数据在 selector 层做一次 `uniqBy` 兜底。

## 防复发措施（测试 + 检测）

- 单测：同一 productId 多条浏览记录 → 断言 selector 输出仅 1 条。
- E2E：连续访问同一商品详情两次 → 断言最近浏览区块该商品卡片数量为 1。
