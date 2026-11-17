# 写页面的说明

课件的每一页都是一次 `Deck.add({ … })`，页面内容是一段 HTML。你只管写内容和位置；字体、颜色、动效、形象的走位，由引擎和风格负责。

动手前先读 `templates.md`，找最接近的样板页照着改，比从零写稳得多。这份说明是查用的：样板里没有的写法、想知道某个属性怎么用、自检报了问题不知道怎么改，都来这里找。

目录：

0. 先读这一节：全稿统一的约定
1. 能改哪些文件，新增一章怎么做
2. 技术边界
3. `Deck.add` 的字段
4. 节拍与出场
5. 通用组件（类名加能直接抄的片段）
6. 形象
7. 重点词
8. 讲词 `notes`
9. 自定义动画 `onBeat`（需要时才用）
10. 字号与留白
11. 常见的坑
12. 自己调试时用的地址

坐标一律是舞台坐标：舞台 1920×1080，左上角是 (0, 0)。浏览器窗口多大都按这个比例缩放，所以位置照 1920×1080 写就行。

---

## 0. 先读这一节：全稿统一的约定

1. **一页只有一个视觉重心。** 讲过的拍会自动变淡，别再自己加抢眼的装饰。
2. **每页 2 到 4 拍**（封面、结尾 1 到 2 拍），每拍一块内容、一个重点词。**拍数 = 翻到这页后要点几下，第 0 拍不算**：第 0 拍 + 第 1、2 拍 = 2 拍。拍数和讲稿「节拍」一段一致。
3. **正文不小于 34px。** 确实是注释类的小字，加 `data-small`，也不能小于 24px。
4. **页面 CSS 一律以 `[data-id="页面id"]` 开头**，不写全局选择器。
5. **每页写 `topic`**（左上角一行「章节短名 › 本页主题」），封面、结尾可以不写；新概念第一次出现的页，第 0 拍放一句 `.explain` 解释。
6. **屏幕上的字照讲稿「屏幕」一段原样写**，不自己加字、改字。
7. **页面 id 用讲稿页号**：讲稿第 5 页就是 `id: 'p05'`（两位数，第 12 页是 `p12`）。`guide` 靠它对照讲稿，列出还没写的页。
8. **写完必须跑检查**：`check <课件目录>`（几秒）和 `check <课件目录> --browser`（后台浏览器自检），错误清零才能给用户看。

---

## 1. 能改哪些文件，新增一章怎么做

### 只改这两处

- `slides/` 里的章节文件：`ch1.js`、`ch1.css`、`ch2.js`、`ch2.css`……
- `index.html` 里两对「章节」注释之间的行（下面会给出完整的样子）。

`engine/`、`scenes/`、`mascots/`、`vendor/` 和 `index.html` 的其他行一律不改。原因：这些文件是 skill 内置的，所有风格和样板都按它们调好了；改了以后，自检的结果和样板的效果都不再可信，以后升级也会被覆盖。缺组件、缺效果时，告诉用户这一版还没有，不要自己往引擎里加。

唯一的例外是搭好骨架以后换风格，要改 `index.html` 里引入风格的两行，做法见 `styles.md` 的「搭好骨架后换风格」。

### 页面顺序

页面顺序 = `index.html` 里章节文件的引入顺序 + 每个文件里 `Deck.add` 的书写顺序。`ch1.js` 里的页都排在 `ch2.js` 前面。讲稿第 3 页要放在第 2 页和第 4 页之间，就在文件里按这个顺序写。

### 新增一章：三步

第一步，建两个文件：`slides/ch2.js`（写这一章的 `Deck.add`）和 `slides/ch2.css`（这一章的页面样式，开头写一行注释就行，不能不建：`index.html` 引入了不存在的文件，检查会报错）。

第二步，在 `index.html` 里两对「章节」注释之间各加一行。改完是这样（只动注释之间的行，注释本身别删别改）：

```html
<!-- 章节样式（开始） -->
<link rel="stylesheet" href="slides/ch1.css">
<link rel="stylesheet" href="slides/ch2.css">
<!-- 章节样式（结束） -->
```

```html
<!-- 章节（开始）：页面顺序 = 引入顺序；新增一章就在这里和上面的章节样式里各加一行 -->
<script src="slides/ch1.js"></script>
<script src="slides/ch2.js"></script>
<!-- 章节（结束） -->
```

第三步，运行 `check <课件目录>`。新章节的页数算进去了、没有「没有在 index.html 里引入」的提醒，就对了。

为什么要写在注释之间：检查只认这两对注释之间的章节。写在外面，页面虽然能显示，但检查不查这一章的页面和 CSS，还会提醒「slides/ch2.js 没有在 index.html 里引入」。

一章一个文件就够，不用一页一个文件。按讲稿的章节分：讲稿「一、准备」写进 `ch1.js`，「二、动手」写进 `ch2.js`。

### 章节文件可以跳号

章节文件名只是名字，**页面顺序 = `index.html` 章节区里的引入顺序**（同一个文件里再按 `Deck.add` 的顺序），和 `ch` 后面的数字无关。

所以先做 3 页时，可以只建用到的章：比如 3 页分别在第一、三、四章，就只建 `ch1`、`ch3`、`ch4`（各一个 `.js` 和 `.css`），引入也只写这三章。之后补第二章时，建 `slides/ch2.js` 和 `slides/ch2.css`，把它的两行引入分别插到 `ch3` 那两行的**前面**。插完是这样：

```html
<!-- 章节样式（开始） -->
<link rel="stylesheet" href="slides/ch1.css">
<link rel="stylesheet" href="slides/ch2.css">
<link rel="stylesheet" href="slides/ch3.css">
<link rel="stylesheet" href="slides/ch4.css">
<!-- 章节样式（结束） -->
```

```html
<!-- 章节（开始）：页面顺序 = 引入顺序；新增一章就在这里和上面的章节样式里各加一行 -->
<script src="slides/ch1.js"></script>
<script src="slides/ch2.js"></script>
<script src="slides/ch3.js"></script>
<script src="slides/ch4.js"></script>
<!-- 章节（结束） -->
```

插错位置（比如加在 `ch4` 后面），第二章的页就会排到最后。插完运行 `check <课件目录>`，看页数对不对。

---

## 2. 技术边界

**课件是一个文件夹，双击 `index.html` 就能离线打开**（浏览器用 `file://` 打开，不用起服务、不用联网）。发给别人、拷到会议室的电脑上、断网的内网里，都要能放。所以页面只能用下面「能用」的东西：

| | 能用 | 不能用 |
|---|---|---|
| 加载方式 | 普通 `<script src>`、`<link>`，按顺序引入 | ES module（`type="module"`）、`import`、`fetch`、CDN、网络字体、外链图片 |
| 写法 | 原生 JS；CSS 变量、flex、grid；内联 SVG 和 SVG 滤镜 | npm、构建工具、React / Vue / Tailwind 这类框架 |
| 库 | 只有已经引入的：`gsap`（动画）、`rough`（手绘线），都是全局变量，直接用 | 其他第三方库；canvas 或 WebGL 大场景 |
| 媒体 | 课件目录里的图片、视频，用相对路径 | 外链媒体 |
| 画面 | 舞台 1920×1080，按窗口等比缩放；正文不小于 34px | |

为什么这些不能用：

- `file://` 下浏览器会拦掉 ES module、`import` 和 `fetch` 读本地文件，页面直接白屏。
- CDN、网络字体、外链图片在断网或内网环境下加载不出来，放映时才发现就来不及了。
- 字体已经由 skill 装进 `vendor/fonts/`，不用另外引。

`check` 会查这些写法，查到就报错误，并指向这一节：

| 报告里写的 | 怎么改 |
|---|---|
| `用了 import 语句` / `用了 import(` | 删掉。要用的函数直接写在章节文件里；章节文件之间共用的东西挂在 `window` 上 |
| `用了 fetch(` | 删掉。要用的数据直接写成 JS 里的常量：`const ITEMS = [ … ];` |
| `用了 type="module"` | 改成普通 `<script src="…">`（而且只能加在章节区） |
| `用了 外部地址 https://…` | 把图片、视频下载进课件目录（比如 `素材/`），改成相对路径 `素材/xx.png` |

可以用的例外：普通链接 `<a href="https://…" target="_blank">` 是允许的，点了在新窗口打开，不进拍。

图片、视频的路径相对于 `index.html` 写。用户的素材在课件目录的 `素材/` 里，就写 `素材/设置页.png`。

---

## 3. `Deck.add` 的字段

```js
Deck.add({
  id: 'p05',                       // 必填，全稿唯一，用讲稿页号。页面 CSS 以 [data-id="p05"] 开头
  chapter: '二、准备',              // 章节名，照讲稿的「章节标记」写；同一章写成一模一样
  chapterShort: '准备',             // 可选：主题行里的章节短名；不写就用 chapter 去掉「二、」这类序号
  topic: '要买的东西',              // 本页主题（左上角那一行），封面、结尾可以不写
  scene: 'watercolor',             // 风格的键名，只能用 index.html 里引入了的风格
  title: '动手前，准备三样东西',     // 必填，纯文字。引擎画成大标题；演讲者视图、阅读模式也用它
  titleHtml: '…',                  // 可选：标题里要放重点词时用，如 '准备<em class="key">三样</em>东西'
  noTitle: false,                  // 可选：true 时不画左上角的大标题（封面、结尾自己摆大字时用）
  recede: true,                    // 可选：false 时整页关掉「讲过的拍自动变淡」
  html: `…`,                       // 页面内容，用 data-beat="n" 标出每块属于第几拍
  notes: [ … ],                    // 讲词，按拍写，见第 8 节
  onBeat(n, el, dir) { … },        // 可选：自定义动画，见第 9 节
});
```

- 拍数不用写：引擎取页面里最大的 `data-beat`（也算 `data-mascot`、`data-mark-beat`、`data-arrange`）。最大写到 `data-beat="2"` 就是 2 拍：翻到这页后要点 2 下，第 0 拍不算。
- `title` 就算写了 `noTitle: true` 也要写：演讲者视图、竖屏阅读模式、检查报告都用它。
- `html` 是模板字符串（反引号包起来），文字里有反引号要写成 `` \` ``，有 `${` 要写成 `\${`。

### 主题行 `topic`

大标题常常是一句论点（「少浇勤看，比多浇好」），光看它不知道这页在讲什么。所以每页左上角有一行主题：`动手 › 两种浇法`。

- 第 0 拍就在，不参与节拍，不会变淡。
- 写短，十五个字以内。放不下时引擎会自动缩小；缩到最小还放不下，自检会报一条提醒，叫你改短。
- 它占着 y 18–78 这一条（x 120–1380），别往这里放东西，形象也别站上去。

### 第 0 拍的一句话解释 `.explain`

一个新概念第一次当一页的主角时，这页一翻开就要有一句大白话解释，放在大标题下面：

```html
<p class="explain"><b>育苗盆</b>：底下带排水孔的小花盆</p>
```

- 它自带位置：x 120、y 192（像素手账 y 200），36px，不换行，左边一道风格强调色的竖条。不用写 `abs` 和坐标。
- 第 0 拍的元素可以不写 `data-beat`，写 `data-beat="0"` 也一样：都是第 0 拍就在、不变淡、不算拍数（样板里写的是 `data-beat="0"`，照抄就行）。
- 不换行，所以句子要短：30 个字以内。长了会超出舞台右边。
- `notes` 第 0 拍的讲词开头也念这一句。前面的页已经解释过的词，后面不用再解释。

---

## 4. 节拍与出场

```html
<h3>不写 data-beat：翻到这页就在，不动</h3>
<p data-beat="0">第 0 拍：翻进这页时跟着大标题出场</p>
<div class="card" data-beat="1">按第 1 下出现</div>
<div class="card" data-beat="2" data-in="pop" data-delay=".2">按第 2 下出现，弹出来，晚 0.2 秒</div>
<div class="row" data-beat="3" data-stagger=".1">  <!-- 子元素一个个出来，间隔 0.1 秒 -->
  <span class="tag">一</span><span class="tag">二</span><span class="tag">三</span>
</div>
```

- 按一下进一拍，本页拍完再按就翻页；退一拍时这一拍的内容收回。
- **拍数 = 翻到这页后要点几下**：第 0 拍是翻进来就有的，不用点，不算拍数。上面这段写到第 3 拍，就是 3 拍；只有第 0 拍和第 1 拍的页是 1 拍。
- 同一拍里的几块按书写顺序自动错开 0.12 秒出场；一拍的动效超过约 1.2 秒会被引擎自动压缩，不用自己算时间。
- `data-stagger` 的容器自己默认不动（加 `data-in` 才动），子元素按各自的 `data-in` 或风格默认出场。
- 同一拍里别把 `data-beat` 套 `data-beat`（会动两次）。外层第 1 拍、里层更晚的第 2 拍是可以的。

### 出场方式 `data-in`

不写 `data-in` 时用风格的默认出场，这是最稳的做法：换风格时出场自动跟着换。确实想要某种手感时，只用下面这些通用的名字：

| 值 | 手感 | 适合 |
|---|---|---|
| `rise` | 淡入上浮 | 通用 |
| `fade` | 只淡入 | 底图、大块背景 |
| `pop` | 从小弹到正常，带一点转 | 图标、截图、小标签 |
| `drop` | 从上方落下回弹 | 便签、卡片 |
| `slide` | 横向滑入；配 `data-from="left"`（或 `right`、`top`、`bottom`） | 一条横栏 |
| `write` | 从左往右写出来 | 文字 |
| `type` | 一格一格打出来 | 终端里的命令 |
| `print` | 一截一截打印出来 | 命令条 |
| `draw` | 一笔画出来（`svg.sketch` 里的线默认就是它） | 手绘线、箭头 |
| `stamp` | 盖章：从大砸下来 | 结论 |
| `none` | 不动画，到拍直接出现 | — |

有的风格还有自己的出场名（水彩田园的 `bloom`、`ink`、`letters`，科技暗黑的 `focus`、`lift`、`wipe`、`sweep`，见 `styles.md`）。这些只在那种风格里认：页面换了风格或者临时用 `?scene=` 看别的风格时，引擎会给一条「data-in 不认识」的提醒。所以不要在页面里写它们，让风格自己默认去用。

### 讲过的拍自动变淡

进到第 n 拍时，第 1 到 n−1 拍的内容块自动变淡（各风格淡的程度不同），当前这一拍是唯一的重心；鼠标移上去会亮回来。线稿、形象、第 0 拍的内容不变淡。

关掉的办法：

```html
<div class="abs" data-recede="off" data-beat="1">图里的标签，不变淡</div>   <!-- 这个元素和它里面的都不变淡 -->
```

整页关掉：`Deck.add({ …, recede: false })`。属于一张图的一部分的标签（比如终端窗口旁的说明），建议关掉。

变淡按「顶层的节拍块」算：一张卡片整体变淡。想让卡片里某一行一直亮着，就把它拆成单独一块，或者给卡片写 `data-recede="off"`。

---

## 5. 通用组件（类名加能直接抄的片段）

下面每个组件在 6 种风格里都能用，样子自动跟着风格变，页面不用改。

定位的写法：组件加 `abs`，再写 `style="left:…;top:…;width:…"`。倾斜用 `style="--r:-1deg"`（卡片、小格、标签、金句、终端、命令、截图都认 `--r`；别的元素加 `class="tilt"` 再写 `--r`）。**带 `data-beat` 的元素不要写 `transform`**，会和出场动画打架。

### 卡片 `.card`

颜色 `t-yellow t-mint t-pink t-blue t-white t-peach`，装饰 `tape`（胶带）、`pin`（图钉），`.lab` 是压在上沿的小标签：

```html
<div class="card t-mint tape abs" data-beat="1" style="left:120px;top:300px;width:520px;--r:-1deg">
  <span class="lab">第一样</span>
  <h3>育苗盆</h3>
  <p>底下要有<em class="key">排水孔</em></p>
  <small>补充的小字</small>
  <ul><li>要点</li><li>要点</li></ul>
</div>
```

一排三张卡片，用 `grid` 排（自检通过的写法）：

```html
<div class="abs grid" style="left:120px;top:300px;width:1680px;--cols:3;--gap:60px">
  <div class="card t-blue" data-beat="1" data-mascot="1" data-mascot-side="bottom" style="--r:-1deg">
    <h3>育苗盆</h3><p>底下要有<em class="key">排水孔</em></p>
  </div>
  <div class="card t-yellow" data-beat="2" data-mascot="2" data-mascot-side="bottom" style="--r:.8deg">
    <h3>营养土</h3><p>花店买<em class="key">现成的</em></p>
  </div>
  <div class="card t-mint" data-beat="3" data-mascot="3" data-mascot-side="bottom">
    <h3>种子</h3><p>挑<em class="key">矮生</em>品种</p>
  </div>
</div>
```

- 卡片不要写死 `height`：字一多就溢出，自检会报「文字超出卡片底边」。要几张一样高，在页面 CSS 里写 `min-height`。
- 卡片宽 W 时，一行大约放得下 (W − 72) ÷ 字号 个汉字。上面一张宽 520 的卡片，36px 正文一行约 12 个字。

### 带序号的步骤 `.steps`

竖排写 `steps`，横排加 `h`。序号自动生成：

```html
<ol class="steps h abs" style="left:120px;top:330px;width:1680px;--gap:120px">
  <li data-beat="1" data-mascot="1" data-mascot-side="bottom"><b><em class="key">装土</em></b><span>装到离盆口一指宽</span></li>
  <li data-beat="2" data-mascot="2" data-mascot-side="bottom"><b><em class="key">播种</em></b><span>撒在土面，盖层薄土</span></li>
  <li data-beat="3" data-mascot="3" data-mascot-side="bottom"><b><em class="key">浇透</em>水</b><span>浇到盆底流出水</span></li>
</ol>
<svg class="sketch">
  <path data-beat="2" data-arrow d="M606 370 C632 348 664 346 700 362"/>
  <path data-beat="3" data-arrow d="M1206 366 C1232 388 1264 390 1300 368"/>
</svg>
```

- 横排三步、总宽 1680、间距 120 时，每步宽 480，扣掉序号还剩约 380px：标题（42px）一行约 9 个字，说明（36px）一行约 10 个字。
- 上面两条箭头的坐标正好落在三步之间的空当里（第一步 x 120–600，第二步 720–1200，第三步 1320–1800）。换了宽度或间距要重算箭头位置。

### 左右对比 `.vs`

中间默认写 vs，`data-mid="→"` 可以换成箭头：

```html
<div class="vs abs" data-mid="→" style="left:120px;top:290px;width:1680px">
  <div class="card t-white" data-beat="1"><h3>以前</h3><ul><li>每天浇一大杯</li><li>叶子发黄才发现</li></ul></div>
  <div class="card t-peach" data-beat="2"><h3>现在</h3><ul><li>先摸一摸土</li><li>干了再浇透</li></ul></div>
</div>
```

### 一排小格 `.cells`

状态 `ai`（绿）、`human`（橙，右上角圆点）、`idle`（灰、划掉）：

```html
<div class="cells abs" data-beat="3" data-stagger=".08" style="left:120px;top:420px;width:1680px">
  <div class="cell ai"><i data-small>①</i><b>自动提醒</b><span>到点就提醒</span></div>
  <div class="cell human"><i data-small>②</i><b>你来浇水</b><span>看土干不干</span></div>
  <div class="cell idle"><i data-small>③</i><b>翻日历</b><span>不用再翻了</span></div>
</div>
```

- 小格里的 `<i>` 编号是 28px，自检按注释类小字查，不用另加 `data-small`（加了也没关系）。不要编号就整个去掉 `<i>`。
- 竖着排：在 `style` 里加 `flex-direction:column`。

### 散落再归位 `.scatter` 加 `data-arrange="n"`

东西先散在页面上，第 n 拍一起飞回排好的位置；往回退会再散开：

```html
<div class="cells scatter abs" data-arrange="1" style="left:120px;top:420px;width:1680px">
  <!-- 子元素按「排好以后」的顺序写；--sx --sy 是散落时的位置（相对容器左上角，可以是负数），--sr 是散落时的倾斜 -->
  <div class="cell" style="--sx:40px;--sy:-110px;--sr:-8deg"><b>晒太阳</b></div>
  <div class="cell" style="--sx:620px;--sy:90px;--sr:7deg"><b>间苗</b></div>
  <div class="cell" data-mascot="1" style="--sx:1180px;--sy:-60px;--sr:-5deg"><b>搭支架</b></div>
</div>
```

```css
/* 子元素要写死宽度，散落时和排好时一样大，飞起来才不变形 */
[data-id="p06"] .scatter .cell{flex:none;width:300px}
```

- 容器本身不写 `data-beat`（第 0 拍就在，散着）。
- 散落的位置算一下：容器 left + `--sx` + 子元素宽度不能超过 1920，否则超出舞台。

### 终端窗口 `.term`

`data-title` 是标题栏的字；每行一个 `<p>`：`in` 前面带 `$`，`cc` 前面带 `>`，`dim`（灰）`ok`（绿）`warn`（橙）`hi`（黄）换颜色：

```html
<div class="term abs" data-title="终端" data-beat="1" style="left:120px;top:280px;width:980px">
  <p class="in">water log --today</p>
  <p class="dim">正在记录……</p>
  <p class="ok">已记下：今天浇过水</p>
</div>
```

终端里一行一行出现：给每个 `<p>` 写各自的 `data-beat`，命令行可以加 `data-in="type"`。

### 一行可复制的命令 `.copy`

点一下复制，给出「已复制」反馈，**点它不进拍**：

```html
<button class="copy abs" type="button" data-beat="2" style="left:120px;top:720px" data-copy="water log --today">water log --today</button>
```

- 按钮里只写命令文字，`$` 和复制图标引擎会自动加。
- 任何元素加 `data-copy="要复制的文字"` 都能点击复制，比如行内的网址：`<code data-copy="example.com/docs">example.com/docs</code>`。
- 命令是 34px 等宽字，一个字符约 19px 宽：一行命令最多约 70 个字符，再长就超出舞台。长命令拆成两行，或只放关键的一段。

### 截图位 `.shot`

```html
<figure class="shot abs" data-beat="1" data-src="素材/设置页.png" data-caption="设置页在右上角"
  style="left:1100px;top:280px;width:700px;--r:-1deg"></figure>
```

- `data-caption` 是图片下面的一行说明（不写就没有），算注释类小字，自检允许它小于 34px。
- **截图的说明只写在 `data-caption` 里**，会显示成图下面的图注。屏幕正文里不要另写一行「截图说明：……」：那几个字会原样投出来，还会多占一块位置。讲稿「屏幕」一段写的「图注：……」就是放进 `data-caption` 的字。
- `素材/截图说明.md` 是给 AI 自己看的（每张图是什么、讲哪块用），不是投出来的内容，别把里面的话抄到屏幕上。
- `data-src` 是相对 `index.html` 的路径，文件要在课件目录里。文件不存在时显示「截图待补」，自检报「截图加载失败」。
- 点一下看大图（显示的是原图：只露出一部分时，原图里的敏感信息也会被看到，提醒用户）。
- 可选：`style` 里加 `--ar:4/3`（图框比例，默认 16/9）、`--fit:contain`（整张放进框里，不裁切）、`--pos:50% 0`（裁切时对齐哪里）。
- 截图位宽度至少 420px，不然投影上看不清。

### 大字金句 `.quote`

```html
<p class="quote abs" data-beat="3" style="left:120px;top:760px;width:1680px">土<em class="key">干了</em>再浇</p>
```

金句 84px，一行约 20 个字（宽 1680 时）。

### 手绘线、箭头 `svg.sketch`

在舞台坐标里写普通的 SVG 形状，引擎换成这种风格的手绘线：

```html
<svg class="sketch">
  <rect x="120" y="300" width="800" height="400" data-beat="1"/>                  <!-- 方框 -->
  <ellipse cx="600" cy="500" rx="200" ry="80" data-beat="2"/>                     <!-- 椭圆 -->
  <path d="M600 330 C660 320 720 280 784 252" data-arrow data-beat="2"/>          <!-- 箭头；两头都要写 data-arrow="both" -->
  <line x1="960" y1="300" x2="960" y2="800" stroke-dasharray="12 10" class="c-ink2" data-beat="3"/>   <!-- 虚线 -->
  <rect x="150" y="590" width="600" height="120" fill="#8EC3E6" data-beat="2"/>   <!-- 有 fill 就是斜线涂色 -->
</svg>
```

- `svg.sketch` 铺满整个舞台，不用写 `viewBox` 和大小，直接用舞台坐标。
- 颜色用 `class="c-mark"`（强调色）、`c-ink2`（次要色）、`c-ai`、`c-human`；粗细用 `stroke-width`（不写用风格默认）。
- 几条线一起出现，就包一个 `<g data-beat="2">…</g>`。
- 不想要手绘效果的形状加 `data-plain`。

### 圈注 `data-mark`

在元素外面画一圈，元素出现后再画；颜色是风格的强调色：

```html
<span data-mark="circle">二十分钟就够</span>                     <!-- circle 圈 | box 框 | underline 下划线 | strike 删除线 | cross 叉；可以写多个，空格隔开 -->
<span data-mark="strike" data-mark-beat="2">每天浇一大杯</span>   <!-- 元素早就在，第 2 拍才划掉 -->
```

圈注按元素的盒子画。`div`、`p` 是整行宽，圈出来会很大：要贴着字圈，就圈行内的 `<span>`。

### 小件

- 标签：`<span class="tag">入门</span>`（可以加颜色 `t-blue` 等）
- 图例圆点：`<i class="dot human"></i>需要人`、`<i class="dot ai"></i>自动`、`<i class="dot idle"></i>不用管`
- 文字：`lead`（50px）、`t-xl`（84px）、`t-lg`（50px）、`t-md`（42px）、`t-sm`（34px）、`b`（加粗）、`muted`（次要色）、`faint`（很淡，只给不重要的字）、`mono`（等宽）、`center`、`nowrap`
- 布局：`abs`（绝对定位）、`area`（标题下面的内容区：左右 120、上 240、下 100）、`row`（横排，`--gap`、`--align`）、`col`（竖排，`--gap`）、`grid`（网格，`--cols`、`--gap`）
- 点了不进拍：给元素加 `data-noclick`（链接、按钮、命令、截图、形象本来就不进拍）

### 颜色一律用变量

写页面 CSS 时颜色用变量，换风格自动变；不写死颜色值：

```
--ink 正文   --ink-2 次要   --ink-3 很淡   --line 线条   --mark 强调色（圈注、竖条）   --bg 底色
--t-yellow --t-mint --t-pink --t-blue --t-white --t-peach   卡片、便签的颜色（黑板上只剩白、黄；科技暗黑上只剩冰蓝和浅灰）
--human 需要人   --ai 自动   --idle 不用管
```

---

## 6. 形象

一份课件一个形象（水彩田园等手绘风格默认朵朵 `duoduo`，科技暗黑默认微光 `weiguang`）。形象的长相、眨眼、走路、落地压一下、点头、鼠标移上去变开心、点它蹦一下（不进拍）、复制成功时高兴一下、翻页时从上一页的位置过来、很久没人操作才打盹，都是引擎自动做的，不用写。你只决定**每一拍它站到哪个元素旁边**。

### 放一个形象

每页放一个向导形象，写在 `html` 的最外层（不要放进卡片或别的定位容器里）：

```html
<div class="mascot guide" style="left:1680px;top:860px"></div>
```

- `style` 里的 left、top 是它的起点（还没有目标的拍，它就待在这里）。右下角 `left:1680px;top:860px` 是不挡字的稳妥位置。
- 可选：`data-pose`（起点的姿势：`idle` 平常、`point` 指向、`happy` 开心、`rest` 休息）、`data-face="left"`（朝左）、`data-say="一句话"`（第 0 拍头上的气泡）。
- 一页不想要形象，就不写；用了 `data-mascot` 却没放形象，引擎会在右下角自动放一个。

### 让它在某一拍走到某个元素旁边

给那个元素写 `data-mascot="拍号"`：

```html
<div class="card" data-beat="2" data-mascot="2" data-mascot-side="bottom" data-mascot-say="看这张">…</div>
```

| 属性 | 说明 |
|---|---|
| `data-mascot="2"` | 第 2 拍走过来；退拍时走回上一拍的位置 |
| `data-mascot-side` | 站在哪一侧：`top`（默认，站在上沿）、`left`、`right`、`bottom`、`stay`（原地不动，只换姿势和气泡） |
| `data-mascot-x` | 站在上沿、下沿时的横向位置，0 最左、1 最右，默认 .12 |
| `data-mascot-dx`、`data-mascot-dy` | 再往右（负数往左）、往下（负数往上）挪多少像素 |
| `data-mascot-pose` | 到了摆什么姿势，默认 `point` |
| `data-mascot-face` | 强制朝向 `left` / `right`（默认自动朝向元素） |
| `data-mascot-say` | 气泡里的字：写这一拍的重点词，2 到 4 个字 |

- `data-mascot` 也可以写在不带 `data-beat` 的元素上（比如 `.explain`），写 `data-mascot="0"`，第 0 拍就站过去。
- 同一拍有几个元素都写了 `data-mascot`，形象去写在最后面的那个。
- 旧写法 `data-kid`、`data-kid-side` 这一套（和 `<div class="kid guide">`）也认，效果和 `data-mascot` 一样；新写的页面一律用 `data-mascot`。

### 站位：别让它挡字

形象挡字是自检最常报的错误。先知道它多大：

| 形象 | 舞台上的大小（宽×高） | 气泡 |
|---|---|---|
| 朵朵 `duoduo` | 132×123 | 在头顶上方，高约 60px |
| 微光 `weiguang` | 144×154（看得见的身子约 115 高） | 同上 |

各个 side 需要的空地：

- `top`：站在元素上沿，元素上方要空出一个形象高（说话时再加约 75px）。一排卡片紧挨着标题或一句话解释时，站上沿会压住上面的字，改用 `bottom`。
- `bottom`：站在元素下面 10px 处，下方要空出一个形象高。一排卡片、横排步骤最常用它。
- `right` / `left`：站在元素旁边 14px 处，上下居中，旁边要空出一个形象宽。
- 站在一句话解释 `.explain` 右边时，形象会往上探到大标题，加 `data-mascot-dy="24"` 往下挪一点（实测通过的写法）：

```html
<p class="explain" data-mascot="0" data-mascot-side="right" data-mascot-dy="24"><b>育苗盆</b>：底下带排水孔的小花盆</p>
```

自检报「形象的身子压住了…」或「形象的气泡压住了…」时：先换一侧 `data-mascot-side`；还压，就用 `data-mascot-dx` / `data-mascot-dy` 按报告里的交叠尺寸挪开（交叠 134×6px，就往下挪 6 以上，留点余量挪 12–24）。

---

## 7. 重点词

```html
<em class="key">排水孔</em>
```

- 每拍一个（最多两个）。它在哪一拍出现，就在那一拍被强调（每种风格的强调方式不同：荧光笔、粉笔描一遍、水彩晕开、光扫过……）。
- 只标词，不标整句。
- 标题里要放重点词，用 `titleHtml`：`titleHtml: '准备<em class="key">三样</em>东西'`（`title` 照样写纯文字）。
- 讲稿里这一拍的重点词屏幕上没有，就不标，只写进 `notes` 的 `key`。

---

## 8. 讲词 `notes`

```js
notes: [
  { beat: 0, key: '育苗盆', say: '先说要准备什么。育苗盆就是底下带排水孔的小花盆。' },
  { beat: 1, key: '排水孔', show: '育苗盆', say: '第一样，育苗盆，底下一定要有排水孔。' },
  { beat: 2, key: ['营养土', '现成的'], say: '第二样，营养土，花店买现成的就行。' },
],
```

- `beat`：第几拍（0 是刚翻到这页）。**每一拍都写一条**，从 0 写到最后一拍，和讲稿的【第 n 拍】一一对应；拍号对不上，检查会报「讲词写到第 a 拍，页面写到第 b 拍」。
- `say`：讲词原文，照讲稿抄（去掉 `**` 加粗符号）。
- `key`：这一拍的重点词，字符串或数组；演讲者视图里会高亮。不写就取这一拍页面上的 `.key`。
- `show`：这一拍出现了什么，几个字，演讲者视图「下一拍」预告用。不写就截取这一拍内容的开头。
- 讲者按 S 打开演讲者视图看讲词；观众看不到。手机竖屏的阅读模式默认也不显示，地址加 `?read&notes=1` 才显示。

---

## 9. 自定义动画 `onBeat`（需要时才用）

大多数页面用不到它：`data-beat` 加风格的默认出场已经够了。真要做「进度条长出来」「数字变化」这类效果，按下面的顺序选：

### 先考虑 CSS

引擎会给页面加上 `.b1 .b2 …`（到第几拍就有到第几的类）和 `data-now="当前拍号"`。用它们写过渡，前进、后退、跳页都自动对：

```html
<div class="abs p06-track" data-beat="2" style="left:120px;top:700px;width:1680px"><i class="p06-bar"></i></div>
```

```css
[data-id="p06"] .p06-track{height:16px;border-radius:8px;background:var(--t-blue)}
[data-id="p06"] .p06-bar{display:block;width:0;height:100%;border-radius:8px;background:var(--mark);transition:width .8s}
[data-id="p06"].b2 .p06-bar{width:100%}    /* 注意 [data-id] 和 .b2 之间没有空格：它们在同一个元素上 */
```

### 要用 gsap 时写 `onBeat`

```js
onBeat(n, el, dir) {
  const done = el.querySelector('.p06-done');
  // 后退、跳页、减少动态、自检：不播动画，直接摆成这一拍该有的样子，然后返回
  if (n < 2 || dir !== 1 || !Deck.motion) { gsap.set(done, { clearProps: 'letterSpacing' }); return; }
  // 前进到第 2 拍：返回一段时间线（讲者连按时引擎能把它快进到结尾）
  return gsap.timeline().fromTo(done, { letterSpacing: '.3em' }, { letterSpacing: '0em', duration: .6, ease: 'power2.out' });
},
```

- 参数：`n` 是现在第几拍；`el` 是这一页的元素（用 `el.querySelector` 找页面里的东西，不要用 `document.querySelector`，会找到别的页）；`dir` 是 `1` 前进一拍（含从上一页进来的第 0 拍）、`-1` 后退一拍、`0` 直接跳到这一拍（Home/End、地址栏、刷新、从后一页退回、阅读模式）。
- **一定要返回时间线**，不要自己 `play`、不要 `setTimeout`。
- **「直接摆好」那条路必须对任何 n 都摆对。** 自检时 `Deck.motion` 为假，引擎会一拍拍往前走、再一拍拍退回第 0 拍，每一步都走「直接摆好」那条路；退回第 0 拍后还留着的东西会报「退回第 0 拍后还在」。
- 只改页面里自己的元素；不加全局监听，不改别的页。

散落再归位、圈注、重点词都是现成的写法，不用自己写 `onBeat`。

---

## 10. 字号与留白

### 字号

- 正文不小于 **34px**。默认正文 36px，卡片标题 42px，`lead` 50px，页标题 68px，金句 84px。
- 确实是注释类的小字（编号、图例、出处），给它加 `data-small`，最小 24px；小于 24px 自检会报提醒。不要给整张卡片加 `data-small`，只加在那几个小字上。
- 组件里自带的小字：小格里的 `<i>` 编号（28px）、截图位的说明（`data-caption`），自检本来就按小字查，不用加。
- 主题行、署名、形象的气泡、终端标题栏这些引擎自己的小字，自检不查，不用管。

### 估算一行放几个字

一个汉字的宽度约等于字号；英文字母和数字约半个。所以：

| 位置 | 宽度 | 字号 | 一行约几个汉字 |
|---|---|---|---|
| 大标题 | 最宽 1480 | 68px | 21（超了会换行，压到下面的一句话解释） |
| 一句话解释 | 不换行 | 36px | 30 以内为宜 |
| 整行正文 | 1680 | 36px | 46 |
| 卡片（宽 W） | W − 72 | 36px | (W − 72) ÷ 36 |
| 金句 | 1680 | 84px | 20 |
| 命令（等宽） | — | 34px | 约 70 个英文字符 |

大标题 20 个字以内（像素手账的标题是 72px，19 个字以内），长了改短，不要缩字号。

### 留白和禁区

- 左右各留 120px：内容在 x 120–1800 之间。
- 上方：主题行在 y 18–78，页码和节拍格在右上角（x 1340–1856、y 30–90），大标题从 y 96 开始，一句话解释在 y 192 左右。**内容从 y 270 左右开始**（没有一句话解释时可以从 y 240 开始）。
- 下方：留 100px，内容到 y 980 为止。
- 各风格还有自己的禁区，字进去了自检会报「进了风格的禁区」：方格纸左边 x 66 以内是活页孔；黑板 y 1000 以下是粉笔槽（右边还立着一块板擦）；所有风格的主题行、页码和节拍格所在的那条都是禁区。详见 `styles.md`。
- **最后一页底部要留出约 90px 高的一条**（y 990 以下别放字）：引擎会在那里自动加一行署名，压到字时自检会报提醒。
- 一页正文不超过约 80 个字，放不下就拆页。

---

## 11. 常见的坑

1. **带 `data-beat` 的元素不要写 `transform`**（出场动画会覆盖它，检查也会报错）。位置用 left / top，倾斜用 `--r`。
2. **卡片不要写死 `height`**，字多了就溢出。要等高用 `min-height`。
3. **页面 CSS 每条都以 `[data-id="页面id"]` 开头**。逗号分开的每一段都要带：`[data-id="p05"] .a, [data-id="p05"] .b {…}`。不带的会串到别的页，检查报错。
4. **形象、`svg.sketch` 都放在 `html` 最外层**；放进别的定位容器里，位置会算错。
5. **圈注、形象的目标按元素的盒子算**：块级元素是整行宽。要贴着字，就用行内的 `<span>`。
6. **散落再归位的子元素要写死宽度**，不然飞的过程中会跳一下。
7. **封面、结尾至少 1 拍，别的页至少 2 拍（第 0 拍不算）**：只有第 0 拍的封面、结尾，或者只有第 0、1 拍的普通页，检查会提醒「翻到这页后要点 1 下（有 1 拍）」这类拍数不够。封面让副标题第 1 拍出现，结尾让最后一句第 1 拍出现；普通页把已有内容分到第 1、2 拍，不要为了凑拍数往屏幕上加讲稿里没有的字。
8. **`html` 是模板字符串**：文字里的反引号要写成 `` \` ``。
9. **长命令先算宽度**：34px 等宽字一个字符约 19px，一行最多约 70 个字符。
10. **霞鹜文楷没下载完整时用的是常用字小字库**，个别生僻字会回退成系统楷体，粗细略有不同，属正常。
11. **只用通用的 `data-in` 名字**，风格自己的出场名换了风格会报提醒（见第 4 节）。
12. **截图、图片用课件目录里的相对路径**（`素材/xx.png`），不要写本机的绝对路径，拷给别人就丢了。

### 自检常报的问题，先这样改

完整的「每类问题怎么改」在 `checklist.md`。最常见的几条：

| 报告里写的 | 先这样改 |
|---|---|
| 第 3 张卡片的文字超出卡片底边 46px | 删减这张卡片的字；或者去掉卡片的固定 `height`、改成 `min-height` |
| 「……」超出舞台右边 120px | 把这块往左挪 120 以上，或减小 `width`、删减文字；一句话解释太长就改短 |
| 「A」和「B」叠在一起 | 两块的位置挪开：按报告里的交叠尺寸调 `top` 或 `left`，再留 20px 以上的空 |
| 形象的身子压住了「……」 | 换一侧 `data-mascot-side`，或用 `data-mascot-dx` / `data-mascot-dy` 挪开 |
| 「……」字号 28px，小于 34px | 改到 34px 以上；确实是小字的加 `data-small` |
| 「……」进了风格的禁区「粉笔槽」 | 把这块往上挪出 y 1000；其他禁区见 `styles.md` |
| 退回第 0 拍后，第 1 拍的「……」还看得见 | 检查 `onBeat`：「直接摆好」那条路有没有把 n 较小时的样子摆回去 |

---

## 12. 自己调试时用的地址

打开课件后，在浏览器地址栏 `index.html` 后面加这些，回车：

| 写法 | 作用 |
|---|---|
| `#5/2` | 直接到第 5 页第 2 拍 |
| `#p05` | 直接到 id 是 p05 的页 |
| `?read` | 强制进入竖屏阅读模式（手机上自动进入） |
| `?read&notes=1` | 阅读模式里显示讲词 |
| `?scene=paper` | 整份课件临时换成某种风格看看（只认 `index.html` 里已经引入的风格） |

讲者的按键：→ ↓ 空格 PageDown Enter 或点击下一拍，← ↑ PageUp 上一拍，Home / End 第一页 / 最后一页，S 演讲者视图，T 计时开始或暂停，R 计时归零，F 全屏。

自检不用自己开地址：`check <课件目录> --browser` 会在后台用浏览器跑完，给出中文报告。
