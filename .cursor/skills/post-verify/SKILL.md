---
name: post-verify
description: 完成前的收尾验证 SOP（verify.sh 硬门禁 + backend-smoke 冒烟 + build-stamp 构建戳），按退出码判定
---

# post-verify — 收尾验证

Dev 宣布收工前的**最后一道自证**，三个脚本按退出码判定：

```bash
bash .harness/scripts/verify.sh        # 19 项硬门禁
bash .harness/scripts/backend-smoke.sh # 后端启动 + API 探活
bash .harness/scripts/build-stamp.sh   # 前端构建 + 构建戳
```

## 判定

- 三个脚本退出码全 0 → **PASS**，把每个脚本的关键输出行贴进 dev-log「post-verify 结果」表。
- 任一非 0 → **FAIL**：先修复再重跑；[WARN] 降级项（如端口占用跳过）如实记录。

## 纪律

- 禁止只跑部分脚本就宣布通过。
- 禁止改脚本本身来"变绿"（脚本属于 Harness 资产，改动需走独立任务）。
- 输出必须含真实退出码，伪造视为虚报完成。
