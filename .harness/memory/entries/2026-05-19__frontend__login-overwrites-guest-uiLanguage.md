---
tags: [i18n, auth, uiLanguage]
---

# 登录后用户偏好语言覆盖访客会话显式选择

## 症状（怎么爆的）

访客在本次会话中手动切到英文继续浏览，随后登录一个偏好为中文的账号，界面立即跳回中文——用户刚做出的显式选择被无提示覆盖。

## 根因（为什么会发生）

登录成功处理逻辑无条件应用 `User.uiLanguage` 到全局语言状态，没有区分「本会话用户是否已显式切换过语言」。

## 修复（怎么修）

新增 `resolveLoginUiLanguage(sessionLang, userLang)` 合流函数：本会话存在显式切换标记（sessionStorage `uiLanguageSessionExplicit`）→ 保持会话语言；否则应用用户偏好；用户无偏好 → 保持会话语言。登录 listener 统一走该函数。

## 防复发措施（测试 + 检测）

- 单测覆盖三分支（显式优先/用户偏好/兜底）。
- Scenario 固化到 specs/i18n.md（I18N 域），语言优先级：会话内显式切换 > 用户级偏好 > 访客级 localStorage > 默认 zh。
