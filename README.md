# Minimal X 油猴脚本

[![安装脚本](https://img.shields.io/badge/-%E2%AC%87%20%E5%AE%89%E8%A3%85%20Minimal%20X-1da1f2?style=for-the-badge)](https://raw.githubusercontent.com/LiZhenNet/MinimalX/main/minimal-x.user.js)
[![版本](https://img.shields.io/badge/version-1.1.3-brightgreen?style=for-the-badge)](https://github.com/LiZhenNet/MinimalX)
[![许可](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](./minimal-x.user.js)

基于 [typefully/minimal-twitter](https://github.com/typefully/minimal-twitter)
6.4.1 改写的单文件用户脚本，适用于 X/Twitter 网页版。

## 一键安装

1. 先在浏览器中安装 **Tampermonkey** 或 **Violentmonkey**。
2. 点击上方蓝色的「安装 Minimal X」按钮（或直接点
   [此链接](https://raw.githubusercontent.com/LiZhenNet/MinimalX/main/minimal-x.user.js)），
   油猴会自动识别 `.user.js` 并弹出安装页，点「安装」即可。
3. 打开或刷新 `https://x.com/`。

> 若 raw 链接在你的网络下打不开，可改用 jsDelivr CDN 安装：
> [通过 jsDelivr 安装](https://cdn.jsdelivr.net/gh/LiZhenNet/MinimalX@main/minimal-x.user.js)。

<details>
<summary>手动安装（无法一键安装时）</summary>

1. 打开扩展管理面板，选择“添加新脚本”。
2. 将 [`minimal-x.user.js`](./minimal-x.user.js) 的内容粘贴并保存。
3. 打开或刷新 `https://x.com/`。

</details>

通过油猴扩展菜单中的“Minimal X 设置”打开配置面板。Zen 写作模式可在设置中
开启，也可通过菜单切换；开启后按 `Esc` 退出。

## 功能

- 时间线默认在视口正中居中，左右留白等宽，并在 `600–800px` 间响应式调整；也可设置 `600–1000px` 固定宽度。
- 移除推广帖子、关注建议和帖子浏览量。
- 分别隐藏回复、转帖、点赞、关注与粉丝数量。
- 隐藏右侧栏、消息抽屉、搜索框、发帖按钮和 Grok 抽屉。
- 自定义左侧导航项目、文字标签、未读数量和垂直位置。
- 自动补充 X 当前未直接展示的列表、社群、话题等导航入口。
- 支持 Zen 写作模式、Inter 字体和自定义 CSS。
- 设置面板和趋势浮层跟随 X 的浅色、Dim 与黑色主题。
- 配置通过油猴存储持久化，修改后即时生效。

## 与原扩展的差异

- 不包含 Typefully 的品牌推广、草稿导流和 Analytics 入口。
- 设置面板由油猴菜单打开，不依赖浏览器扩展弹窗。
- X 会不定期调整 DOM 结构；若部分规则失效，需要同步更新选择器。

## 许可

本项目沿用上游的 MIT License。原项目版权归 Mailbrew Inc 及其贡献者所有。
