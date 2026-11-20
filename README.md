<div align="center">

# li-talk-skills

**支持在线编辑 · 16 种风格 · 一句话生成的 AI 演讲课件 Skill**

把主题、笔记或讲稿交给 AI，得到一份能直接上台讲的 HTML 课件：一拍一拍地翻，双击离线打开，带演讲者视图、计时彩排和专属形象；想改哪里，在浏览器里直接改，改完一键交回 AI 合进源码。

[![在线体验](https://img.shields.io/badge/在线体验-xiaoli1999.github.io-2f6bff?style=flat-square&logo=githubpages&logoColor=white)](https://xiaoli1999.github.io/li-talk-skills/)
[![License](https://img.shields.io/badge/License-Apache_2.0-22c55e?style=flat-square)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.4.4-111827?style=flat-square)](CHANGELOG.md)
[![Styles](https://img.shields.io/badge/风格-16_种-7c5cff?style=flat-square)](#16-种风格)
[![Mascots](https://img.shields.io/badge/形象-16_个-ef4f64?style=flat-square)](#16-种风格)
[![Live Editing](https://img.shields.io/badge/在线编辑-支持-00b4d8?style=flat-square)](#在线编辑)
[![Responsive](https://img.shields.io/badge/多端-响应式适配-f59e0b?style=flat-square)](#功能)
[![Offline](https://img.shields.io/badge/HTML-离线_·_零依赖-e34f26?style=flat-square&logo=html5&logoColor=white)](#功能)

[![Claude Code](https://img.shields.io/badge/Claude_Code-支持-d97757?style=flat-square&logo=anthropic&logoColor=white)](#快速开始)
[![Codex](https://img.shields.io/badge/Codex-支持-10a37f?style=flat-square&logo=openai&logoColor=white)](#快速开始)
[![Cursor](https://img.shields.io/badge/Cursor-支持-000000?style=flat-square&logo=cursor&logoColor=white)](#快速开始)
[![DeepSeek](https://img.shields.io/badge/DeepSeek-支持-4d6bfe?style=flat-square)](#快速开始)
[![WorkBuddy](https://img.shields.io/badge/WorkBuddy-支持-0052d9?style=flat-square)](#快速开始)

**[🌐 介绍页](https://xiaoli1999.github.io/li-talk-skills/)** · **[📖 新手教程](https://xiaoli1999.github.io/li-talk-skills/tour/)** · **[🎨 全部风格](https://xiaoli1999.github.io/li-talk-skills/gallery.html)** · **[📝 更新日志](CHANGELOG.md)** · 中文 | [English](README.en.md)

</div>

![样册首页：16 种风格一屏看完](docs/images/hero.jpg)

## 功能

| | 功能 | 说明 |
|---|---|---|
| 💬 | **一句话生成** | 一个主题、零散笔记、现成讲稿都能开工；AI 写讲稿、选风格、排版、加动效，关键处停下等你确认 |
| ✏️ | **在线编辑** | 浏览器里双击改字、拖动缩放、改字号颜色和拍号，改完一键交给 AI 合进源码 |
| 🎨 | **16 种风格 · 16 个形象** | 手绘、现代、像素、企业四大家族，每种风格有自己的版式、动效和一个会走动的小形象 |
| 🎤 | **上台就能讲** | 一拍一拍出内容；演讲者视图看讲词、计时彩排；黑屏、激光笔、总览跳页，翻页笔直接用 |
| 📱 | **多端响应式适配** | 大屏、笔记本、平板到手机竖屏自动适配，交付前在 5 种屏幕尺寸逐页逐拍自检 |
| 📦 | **离线 · 零依赖** | 纯 HTML，双击 `index.html` 就能放映，不联网、不装软件，拷走文件夹就能分享 |
| 🤖 | **多种 AI 都能用** | Claude Code、Codex、Cursor、DeepSeek、WorkBuddy 等，能跑命令、能读写本地文件就行 |

**适合** 技术分享、培训、汇报、演讲、客户方案 · **不适合** 导出 pptx / pdf、纯文档、数据看板

## 快速开始

### 懒人必备

把这句话发给你的 AI，剩下的它来做（没有 Node 也会先帮你装好）：

```text
从 GitHub 仓库 xiaoli1999/li-talk-skills 安装到全局，装好后打开新手教程带我过一遍
```

### 命令安装

```bash
npx skills add xiaoli1999/li-talk-skills -g -a claude-code -y
```

用 Codex 把 `claude-code` 换成 `codex`，用 Cursor 换成 `cursor`。需要 Node 18 以上；装好后新开一个对话生效。

### 做第一份课件

```text
用 li-talk-skills 帮我做一个关于「……」的课件
```

AI 从你手上有的东西出发（只有主题、有笔记截图、有讲稿都行），在 **提纲 → 讲稿 → 风格 → 先做 3 页 → 过稿** 五处停下等你点头；中途换对话、换模型也能接着做。

> 第一次用想先看看？[在线新手教程](https://xiaoli1999.github.io/li-talk-skills/tour/) 五分钟讲完安装、流程、选风格和放映。

## 在线编辑

![在线编辑：双击路牌上的「投茶」进入改字，旁边浮出字号、颜色、对齐工具条，顶部是改动数、撤销重做和「通知 AI 修改」](docs/images/edit.jpg)

对 AI 说「我要在线改」，浏览器打开就是编辑模式：

- **改字**：双击改文字、设重点词；选到文字才出现字号和颜色，改一处不牵动别处
- **改版面**：拖动挪位置，拖角整块等比缩放，按住 Alt 改框大小，Delete 隐藏；选中一块后再点里面的字，可以单独拖这段字
- **改节奏**：调整每块第几拍出现；演讲者视图里点讲词就能改
- **随时反悔**：Ctrl+Z / Ctrl+Y 撤销重做，一键还原
- **交给 AI**：改动自动保存，点「通知 AI 修改」，AI 写回源码、跑完自检，页面自动刷新

## 16 种风格

不只是换配色：版式、结构和每一拍的动作都按风格自己的样子来。一份课件可以按章换风格（同一类里换），每种风格都备好了整套样板页。

### 手绘风（楷书）

| 样子 | 风格 | 默认形象 | 适合讲什么 |
|---|---|---|---|
| <img src="docs/images/styles/paper.jpg" width="240" alt="方格纸"> | **方格纸** `paper` | 尖尖：一截用短了的黄色铅笔头 | 开场、总览、愿景、收尾 |
| <img src="docs/images/styles/board.jpg" width="240" alt="黑板"> | **黑板** `board` | 沙沙：一截白粉笔头 | 基础教学、命令清单、安装步骤 |
| <img src="docs/images/styles/journal.jpg" width="240" alt="像素手账"> | **像素手账** `journal` | 点点：一只像素墨水瓶 | 以角色为主线的章节、讲原理的示意图 |
| <img src="docs/images/styles/desk.jpg" width="240" alt="工位桌面"> | **工位桌面** `desk` | 卷卷：一卷和纸胶带 | 讲者自己的故事、多方协作 |
| <img src="docs/images/styles/watercolor.jpg" width="240" alt="水彩田园"> | **水彩田园** `watercolor` | 朵朵：一朵水彩小积云 | 入门教程、上手流程、温和的分享、面向非技术同事 |
| <img src="docs/images/styles/ink.jpg" width="240" alt="水墨国风"> | **水墨国风** `ink` | 墨丸：一滴墨，眉心一粒朱砂 | 人文、方法论、流程讲解，开场和收尾要有仪式感的时候 |
| <img src="docs/images/styles/blueprint.jpg" width="240" alt="蓝图"> | **蓝图** `blueprint` | 圈圈：一只会画圈的制图圆规 | 搭建、组成、拆成几块讲的系统和结构 |
| <img src="docs/images/styles/comic.jpg" width="240" alt="漫画"> | **漫画** `comic` | 叨叨：一个毛笔墨线的对话框 | 讲故事、前后对比、有情绪的转折、轻松的吐槽和反转 |

### 现代风（黑体，杂志复古用宋体）

| 样子 | 风格 | 默认形象 | 适合讲什么 |
|---|---|---|---|
| <img src="docs/images/styles/dark.jpg" width="240" alt="科技暗黑"> | **科技暗黑** `dark` | 微光：悬浮的小方块机器人 | 技术分享、命令行教学、发布会、产品介绍 |
| <img src="docs/images/styles/frost.jpg" width="240" alt="毛玻璃"> | **毛玻璃** `frost` | 小雾：一块磨砂玻璃小果冻 | 产品介绍、工具上手、新功能发布 |
| <img src="docs/images/styles/glass.jpg" width="240" alt="液态玻璃"> | **液态玻璃** `glass` | 透透：一颗玻璃小液滴 | 产品、界面、设计、科技类，每页信息不多 |
| <img src="docs/images/styles/flat.jpg" width="240" alt="扁平插画"> | **扁平插画** `flat` | 小页：围着黄围巾的几何小狐狸 | 上手教程、产品介绍、流程步骤、新人或非技术听众 |
| <img src="docs/images/styles/magazine.jpg" width="240" alt="杂志复古"> | **杂志复古** `magazine` | 小铅：一枚橘红铅字块 | 观点、方法论、读书分享、复盘总结 |
| <img src="docs/images/styles/brutal.jpg" width="240" alt="新粗野主义"> | **新粗野主义** `brutal` | 砰砰：黄色爆炸贴纸小怪物 | 上手教程、流程步骤、产品和工具介绍、内部分享 |

### 像素风（中文像素字体）

| 样子 | 风格 | 默认形象 | 适合讲什么 |
|---|---|---|---|
| <img src="docs/images/styles/pixel.jpg" width="240" alt="像素游戏"> | **像素游戏** `pixel` | 小旗：背一面三角旗的像素小向导 | 上手教程、新人引导、闯关式分步、轻松的团队分享 |

### 企业风（公司品牌专属）

| 样子 | 风格 | 默认形象 | 适合讲什么 |
|---|---|---|---|
| <img src="docs/images/styles/fangguo.jpg" width="240" alt="方果"> | **方果** `fangguo` | 方小果：公司 IP「方小果」，圆角方脑袋的小果子 | 给客户演讲、领导汇报、产品介绍、经营数据 |

## 放映快捷键

| 键 | 作用 | 键 | 作用 |
|---|---|---|---|
| → 空格 / 点击 | 下一拍 | ← | 上一拍 |
| S | 演讲者视图（讲词、下一拍、计时） | H | 彩排（超时的页标红） |
| O | 总览跳页 | B 或 . | 黑屏 |
| L | 激光笔 | F | 全屏 |
| T / R | 计时开始暂停 / 归零 | E | 编辑模式 |

手机、平板竖屏自动变成阅读模式，左右滑动翻页；翻页笔直接可用。

## 质量保证

每写完一批，AI 都会跑两道检查：先秒查写法和讲词拍数，再用本机浏览器在 5 种屏幕尺寸下逐页逐拍检查溢出、遮挡、字号和对比度，出一份中文报告。**错误清零才交给你**，看不了图的模型也能照着报告改干净。

## 更新

每天第一次使用时自动检查新版本，只下载变了的文件、校验通过才替换，AI 会把更新要点转告你。已经做好的课件不会被改动。

## 常见问题

<details>
<summary><b>能离线打开吗？怎么发给别人？</b></summary>

能。课件就是一个文件夹，双击 `index.html` 打开，不加载任何外部资源；把文件夹压成 zip 发给对方即可。
</details>

<details>
<summary><b>能发成在线链接吗？</b></summary>

用 WorkBuddy、Codex 等能托管网页的工具时，AI 做完会问要不要发；你同意才上传。注意截图等内容会一起公开。
</details>

<details>
<summary><b>字体要联网吗？</b></summary>

手绘风的楷书第一次用时会下载完整字库（约 8.8 MB，之后复用）；下载失败也不影响，先用自带的常用字库。
</details>

<details>
<summary><b>支持哪些浏览器？</b></summary>

Chrome、Edge 全部功能正常；Safari、Firefox 可以看，个别效果会降级。自检需要本机装有 Edge 或 Chrome。
</details>

<details>
<summary><b>能导出 pptx 或 pdf 吗？</b></summary>

不能，这个 skill 专注做 HTML 课件。
</details>

后续计划见 [docs/roadmap.md](docs/roadmap.md)。

## 许可与署名

以 [Apache License 2.0](LICENSE) 开源，可免费使用、修改和商用。**转载、fork 或二次开发时，请保留 [NOTICE](NOTICE) 中的署名和出处**（基于 li-talk-skills，作者 xiaoli1999），并在修改过的文件里注明已修改。

第三方组件保留各自的许可证（见 `skills/li-talk-skills/template/vendor/`）：[GSAP](https://gsap.com)（GreenSock Standard License）、[rough.js](https://roughjs.com)（MIT）、[霞鹜文楷](https://github.com/lxgw/LxgwWenKai)（OFL 1.1）、[缝合像素字体](https://github.com/TakWolf/fusion-pixel-font)（OFL 1.1）。

## 友情推荐

- [skillhey.com](https://skillhey.com)：精选 AI Skills 合集，想给你的 AI 再添几项本领，可以去这里逛逛
