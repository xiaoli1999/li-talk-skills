# 样板页

写页面时先找最接近的样板，整段抄过去再改，不要从零写。这 4 个样板在 15 种风格（手绘家 8 种、现代家 6 种、像素游戏）× 5 个尺寸下都自检过，0 个错误：位置、字号、形象每一拍的落点都调好了，照着改最不容易出错。

| 样板 | 样板里的 id | 什么时候用 | 拍数（翻到这页后要点几下，第 0 拍不算） |
|---|---|---|---|
| 封面 | `t-cover` | 第一页 | 1 |
| 清单 | `t-list` | 并列的三样东西、三个要点，一拍出一张卡片 | 3 |
| 步骤（图示） | `t-steps` | 有先后的三步、一个流程；最后一步可以带一行命令 | 3 |
| 结尾 | `t-end` | 最后一页：一句收尾金句加致谢 | 1 |

样板的源码在本 skill 的 `template/samples/samples.js`（页面）和 `template/samples/samples.css`（页面样式），下面每一节都原样贴出来了，直接从这里抄。

想看样板在各种风格下的样子：运行 `styles --open` 打开样册（`template/gallery.html`），左下角的小条点一下就换风格；地址后面加 `?scene=<键名>` 也一样。样册里的截图位是一张灰色的示意图，做课件时换成 `素材/` 里的真实截图。

---

## 先做 3 页：怎么选

流程 ⑥「先做 3 页」要做的是：封面，加讲稿里最典型的两页——一页图示、一页清单。

**最典型的两页这样挑**：从讲稿里挑一页步骤或图示（有先后、有箭头的）和一页清单（并列的几件事）；同类的有好几页时，优先挑内容最多、最能代表这份课件的那两页。页面 id 仍用讲稿页号（挑的是讲稿第 3 页和第 4 页，就是 `p03`、`p04`），中间没做的页以后写全稿时再补。

1. **封面**：`new` 已经生成了一页最简单的封面 `p01`（大标题加副标题）。照讲稿第 1 页改字就行；想要标签、讲者一行和右边一张封面图，就用下面的 `t-cover` 整页换掉它（id 还是 `p01`）。
2. **一页图示**：挑讲稿里最像「一步接一步」的那页，用 `t-steps`。讲的不是步骤，而是先后、因果、从输入到输出，只要能画成「三块加两个箭头」，也用它。
3. **一页清单**：挑讲稿里「几样东西、几个要点并列」的那页，用 `t-list`。

结尾 `t-end` 留到写全稿时用在最后一页。3 页写完，跑 `check <课件目录>` 和 `check <课件目录> --browser`，错误清零再给用户看。

---

## 抄过去以后，每个样板都要改的地方

1. **id**：`'t-list'` 换成讲稿页号，比如讲稿第 5 页就是 `'p05'`（两位数）。
2. **页面 CSS**：样板在 `samples.css` 里有规则的，把规则一起抄进本章的 `slides/ch1.css`，**每条开头的 `[data-id="t-…"]` 都换成新 id**，比如 `[data-id="t-list"]` 换成 `[data-id="p05"]`，一条不漏。漏换的规则不生效，页面就不是调好的样子了。
3. **scene**：`'paper'` 换成用户选定的风格键名。只能用 `index.html` 里引入了的风格，写错了检查会报错。
4. **字**：`chapter`、`topic`、`title` 和 `html` 里的字，照讲稿这一页的页头和「屏幕」一段原样换掉；`<em class="key">` 套在讲稿「节拍」里写的那个重点词上。
5. **讲词**：`notes` 照讲稿的「讲词」一拍一条，`beat` 和页面上的 `data-beat` 对上，`key` 写这一拍的重点词。
6. **截图**：`data-src="samples/placeholder.svg"` 是样册里的示意图，换成 `素材/` 里的真实截图（文件名照 `素材/截图说明.md` 写）；没有截图就按那一节说的删掉。课件目录里没有 `samples/`，不换的话自检会报「截图加载失败」。截图要配一句说明时，写在 `figure.shot` 的 `data-caption` 里（会显示成图下面的图注），屏幕正文里不要另写「截图说明：……」这样的一行；`素材/截图说明.md` 是给 AI 自己看的，不是投出来的内容。

样板里自己起的类名（比如封面的 `cover-title`）可以原样留着，它们只在这一页的 CSS 里用。

**每个样板都别碰的**：

- 组件的类名和结构（`card`、`lab`、`steps`、`copy`、`shot`、`explain`、`mascot guide`……）：各种风格就是按它们画样子的，改了以后换风格就不对了。
- 不要往样板里加颜色（`color`、`background` 写死的颜色值）：颜色交给风格，写死了换风格就难看。要强调用 `<em class="key">`，要换卡片颜色用 `t-yellow` 这类类名。
- 带 `data-beat` 的元素不要写 `transform`：位置用 `left` / `top`，倾斜用 `--r`。

---

## 1. 封面 `t-cover`

**什么时候用**：第一页。左边一组字（标签、大标题、副标题、讲者），右边一张封面图（产品截图、一张照片）；形象站在封面图的上沿，第 1 拍讲者那行出现时高兴一下。

**页面**（写进 `slides/ch1.js`）：

```js
Deck.add({
  id: 't-cover',
  chapter: '开场',
  scene: 'paper',
  title: '怎么泡好一杯茶',
  noTitle: true,
  html: `
    <div class="abs col" style="left:150px;top:320px;width:940px;align-items:flex-start;--gap:30px">
      <span class="tag" data-beat="0" style="--r:-2deg">新人茶话会</span>
      <p class="cover-title b" data-beat="0">怎么泡好一杯茶</p>
      <p class="lead muted" data-beat="0">水温、茶量、时间，三件事讲清楚</p>
      <p class="muted" data-beat="1" data-mascot="1" data-mascot-side="stay" data-mascot-pose="happy">讲者：〈你的名字〉　·　〈日期〉</p>
    </div>
    <figure class="abs shot" data-beat="0" data-src="samples/placeholder.svg" data-mascot="0" data-mascot-side="top" data-mascot-x=".84" style="left:1150px;top:360px;width:650px;--r:2deg"></figure>
    <div class="mascot guide" style="left:1240px;top:440px"></div>`,
  notes: [
    { beat: 0, key: '泡好', say: '大家好，今天聊一件小事：怎么泡好一杯茶。' },
    { beat: 1, say: '我是〈你的名字〉，平时爱喝茶，也踩过不少坑。' },
  ],
});
```

**页面 CSS**（写进 `slides/ch1.css`，`[data-id="t-cover"]` 换成新 id）：

```css
[data-id="t-cover"] .cover-title{font-size:112px;line-height:1.15;letter-spacing:.03em}
```

**可以改**：

- 标签「新人茶话会」：场合或系列名，6 个字以内；不要就删掉这一行。
- 大标题：112px，宽 940 一行放约 8 个字。超过 8 个字就在意思断开的地方加 `<br>` 断成两行（自动换行常常只剩一个字落在第二行，难看）；最多两行（16 个字），再长就改短。
- 副标题：一句话，18 个字以内。
- 讲者一行：〈你的名字〉、〈日期〉连同尖括号一起换掉。不要讲者这一行时，把它的 `data-beat="1" data-mascot="1" data-mascot-side="stay" data-mascot-pose="happy"` 挪到副标题上，再删掉这一行：封面至少要有 1 拍。
- 封面图：`data-src` 换成 `素材/` 里的图。没有图就**整行删掉 `<figure …>`**，别的不用动：形象会待在它的起点（`mascot guide` 上的 `left:1240px;top:440px`，大标题右边）。
- 封面图的倾斜 `--r`：-3deg 到 3deg 之间（现代风格自动摆正）。

**别碰**：

- 字那一组的 `width:940px`：再宽会碰到右边的封面图。
- 封面图的 `top:360px`：形象站在它的上沿，往上挪会让形象顶到右上角的页码。
- 讲者那行的 `data-mascot-side="stay"`：形象原地不动、只换成开心的姿势；改成 `right` 它会跳到讲者旁边，压住上面的副标题。

**常见的坑**：

- 封面没有主题行和页标题（`noTitle: true`），但 `title` 还是要写：演讲者视图和阅读模式要用。
- 封面图默认按 16:9 裁切；图片比例差得多，在 `style` 里加 `--fit:contain`，整张放进框里不裁切。

---

## 2. 清单 `t-list`

**什么时候用**：并列的三样东西、三个要点、三个原因，一拍出一张卡片，每张卡片一个重点词。这一页有新概念第一次出现时，第 0 拍先有一句话解释（`.explain`）。形象第 0 拍待在左下角，之后每拍站到当前卡片下面。

**页面**（写进 `slides/ch1.js`）：

```js
Deck.add({
  id: 't-list',
  chapter: '一、准备',
  topic: '要备的三样东西',
  scene: 'paper',
  title: '泡茶之前，备好三样东西',
  html: `
    <p class="explain" data-beat="0"><b>盖碗</b>：带盖的小茶碗，泡茶、闻香、出汤都用它</p>
    <div class="abs grid" style="left:120px;top:360px;width:1680px;--cols:3;--gap:60px">
      <div class="card t-yellow" data-beat="1" data-mascot="1" data-mascot-side="bottom" style="--r:-1deg">
        <span class="lab">器具</span><h3>一只<em class="key">盖碗</em></h3><p>白瓷的最好，看得清茶色</p>
      </div>
      <div class="card t-mint" data-beat="2" data-mascot="2" data-mascot-side="bottom" style="--r:.8deg">
        <span class="lab">茶叶</span><h3><em class="key">三克</em>绿茶</h3><p>大约铺满碗底薄薄一层</p>
      </div>
      <div class="card t-blue" data-beat="3" data-mascot="3" data-mascot-side="bottom" style="--r:-.6deg">
        <span class="lab">水</span><h3>一壶<em class="key">热水</em></h3><p>烧开后晾到<span data-mark="circle">八十度</span></p>
      </div>
    </div>
    <div class="mascot guide" style="left:150px;top:840px"></div>`,
  notes: [
    { beat: 0, key: '盖碗', say: '动手之前先备齐东西。盖碗就是带盖的小茶碗，泡、闻、倒都用它。' },
    { beat: 1, key: '盖碗', say: '第一样是盖碗，白瓷的最好，茶汤什么颜色一眼就看清。' },
    { beat: 2, key: '三克', say: '第二样是茶叶，三克就够，大约铺满碗底薄薄一层。' },
    { beat: 3, key: '热水', say: '第三样是热水。水烧开后别急，晾到八十度左右再用。' },
  ],
});
```

**页面 CSS**（写进 `slides/ch1.css`，两条的 `[data-id="t-list"]` 都换成新 id）：

```css
[data-id="t-list"] .card{min-height:270px}
[data-id="t-list"] [data-mark]{margin:0 .5em}
```

**可以改**：

- 一句话解释：写成「概念：大白话解释」，30 个字以内（它不换行）。这一页没有新概念就整行删掉，卡片不用挪。
- 每张卡片：小标签 `lab` 2 到 4 个字（不要就删掉 `<span class="lab">…</span>`）；`h3` 标题 8 个字以内；`p` 说明一行约 12 个字（卡片宽约 520，去掉内边距剩约 440，36px 的字一行 12 个），最多两行。
- 卡片颜色：`t-yellow`、`t-mint`、`t-blue` 可以换成 `t-pink`、`t-peach`、`t-white`。每种风格会换成自己的颜色（黑板只有白、黄两色，科技暗黑一律是缎面卡片），所以三张选不同的类名就行，不用管具体是什么颜色。
- 倾斜 `--r`：-1.5deg 到 1.5deg 之间，三张别一样（现代风格自动摆正）。
- 圈注 `data-mark="circle"`：套在说明里的一个词上；不要圈注就把 `<span data-mark="circle">` 和 `</span>` 删掉，字留着。

**别碰**：

- 卡片那一排的 `top:360px`：上面是一句话解释（y 192 左右），再往上，卡片上沿的小标签会碰到它。
- 卡片上的 `data-mascot-side="bottom"`：卡片上面紧挨着一句话解释，形象站卡片上沿会压字。
- 不要给卡片写死 `height`：字多了会溢出。要等高、要更高，改页面 CSS 里的 `min-height`。

**常见的坑**：

- 一张卡片只放一个重点词，和讲稿「节拍」那一拍写的一样；卡片里不放大段文字，两行以内。
- 圈注的圈比字宽出一圈（左右各约 22px），所以页面 CSS 里给被圈的词前后留了 `.5em` 的空，不然圈会划过旁边的字。这条 CSS 别漏抄。
- 要点不是三个时，先跟讲稿核对能不能凑成三个；硬塞四张卡片，说明那行只剩 8 个字左右的宽度。

---

## 3. 步骤（图示）`t-steps`

**什么时候用**：有先后的三步、一个流程。三步横排，中间用手绘箭头连起来，一拍出一步；最后一步下面带一行可复制的命令（点一下复制，不会翻页）。形象每拍走到当前这一步下面，最后一拍站到命令左边。

**页面**（写进 `slides/ch1.js`）：

```js
Deck.add({
  id: 't-steps',
  chapter: '二、动手',
  topic: '泡茶三步',
  scene: 'paper',
  title: '泡一杯绿茶，只要三步',
  html: `
    <ol class="abs steps h" style="left:120px;top:420px;width:1680px;--gap:140px">
      <li data-beat="1" data-mascot="1" data-mascot-side="bottom"><b><em class="key">温杯</em></b><span>热水把盖碗烫一遍</span></li>
      <li data-beat="2" data-mascot="2" data-mascot-side="bottom"><b><em class="key">投茶</em></b><span>三克茶叶铺满碗底</span></li>
      <li data-beat="3"><b><em class="key">注水</em></b><span>八十度水沿碗边倒</span></li>
    </ol>
    <svg class="sketch">
      <path data-beat="2" data-arrow d="M604 470 C634 450 676 450 708 470"/>
      <path data-beat="3" data-arrow d="M1210 470 C1240 450 1282 450 1314 470"/>
    </svg>
    <button class="abs copy" type="button" data-beat="3" data-mascot="3" data-mascot-side="left" style="right:120px;top:650px" data-copy="tea brew --green --temp 80">tea brew --green --temp 80</button>
    <div class="mascot guide" style="left:150px;top:840px"></div>`,
  notes: [
    { beat: 0, key: '三步', say: '东西备齐了，泡一杯绿茶其实只要三步。' },
    { beat: 1, key: '温杯', say: '第一步温杯：热水把盖碗里外烫一遍，倒掉。' },
    { beat: 2, key: '投茶', say: '第二步投茶：三克茶叶放进去，铺满碗底就行。' },
    { beat: 3, key: '注水', say: '第三步注水：八十度的水沿着碗边慢慢倒。懒得记的话，下面这行命令点一下就能复制。' },
  ],
});
```

**页面 CSS**（写进 `slides/ch1.css`，`[data-id="t-steps"]` 换成新 id）：

```css
[data-id="t-steps"] .steps>li>b{font-size:var(--fs-lg)}
```

**可以改**：

- 每一步：`<b>` 里是步骤名，2 到 4 个字，套上重点词；`<span>` 是说明，8 个字以内。科技暗黑里每一步是一张小卡片，说明一行只放得下 8 个字，再长会换行（自检能过，但三步高低不齐）。
- 命令：按钮里的文字和 `data-copy` **两处一起换，写成一样的**。按钮里只写命令本身，`$` 和复制图标引擎会自己加。
- 不需要命令：整行删掉 `<button …>`，再给第 3 步的 `<li>` 加上 `data-mascot="3" data-mascot-side="bottom"`，形象最后一拍就站到第 3 步下面。
- 只有两步：删掉第 3 个 `<li>` 和第 2 条箭头（第二个 `<path>`），把第 1 条箭头改成 `d="M908 470 C938 450 980 450 1012 470"`（两步时中间的空隙在 x 890–1030）；命令照样放在最后一步（第 2 步）下面，把它的 `data-beat`、`data-mascot` 改成 2。
- 整排上下挪：`ol` 的 `top` 和两条箭头的 y（470、450）挪同样多，命令的 `top` 也跟着挪，三样保持原来的间距。

**别碰**：

- `ol` 的 `left:120px`、`width:1680px` 和 `--gap:140px`：箭头的横坐标是按它们算的（每一步宽约 467，箭头画在两步之间 140px 的空隙里）。改了它们，箭头就不在空隙里了。
- 命令的 `right:120px`：右端对齐页边，命令变长时往左伸，始终在第 3 步下面。
- 第 3 拍形象的 `data-mascot-side="left"`：命令贴着右边页边，右边没地方站；第 3 步的 `<li>` 上也不要再写 `data-mascot="3"`——同一拍有几个目标时，形象只去写在最后面的那个。

**常见的坑**：

- **长命令先算宽度**：命令是 34px 的等宽字，在 1920 宽的舞台上一个英文字符约 19px，中文一个字约 34px。一行命令的总宽约「字符数 × 19 + 130px」（130 是 `$`、复制图标和内边距）。这里建议 35 个字符以内；超过 50 个字符，命令会伸到第 1 步下面，形象也没地方站了，就只放关键的一段。
- 箭头写在 `svg.sketch` 里，放在 `html` 的最外层；箭头的 `data-beat` 跟后一步一样（第 2 步出现时画第 1 条箭头）。
- 步骤多于三步：横排放不下，拆成两页，或者改用竖排的步骤（写法见 `authoring.md` 的「带序号的步骤」）。

---

## 4. 结尾 `t-end`

**什么时候用**：最后一页。居中一句收尾金句，第 1 拍出致谢；形象先站在金句右边，第 1 拍跳到致谢旁边，开心地说一句话。引擎会在最后一页底部自动加一行署名，不用写。

**页面**（写进最后一章的 `slides/chN.js`，放在最后一个）：

```js
Deck.add({
  id: 't-end',
  chapter: '结尾',
  scene: 'paper',
  title: '谢谢',
  noTitle: true,
  html: `
    <div class="abs col" style="left:160px;right:160px;top:360px;align-items:center;--gap:130px">
      <p class="quote" data-beat="0" data-mascot="0" data-mascot-side="right">水温对了，茶就<em class="key">不苦</em></p>
      <p class="lead muted" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="happy" data-mascot-say="谢谢！">谢谢大家，欢迎提问</p>
    </div>
    <div class="mascot guide"></div>`,
  notes: [
    { beat: 0, key: '不苦', say: '最后只记一句：水温对了，茶就不苦。' },
    { beat: 1, say: '谢谢大家，有问题现在可以问。' },
  ],
});
```

这一页没有页面 CSS。

**可以改**：

- 金句：84px，一行 16 个字以内（右边还要站一个形象）；两行就在中间加 `<br>`，三行以上太长，改短。重点词套一个就够。
- 致谢：一句话，18 个字以内。
- 形象说的话 `data-mascot-say`：2 到 4 个字；不想让它说话就删掉这个属性。

**别碰**：

- `--gap:130px`：形象说话时，气泡在它头顶上方，高约 60px，正好夹在金句和致谢之间；间距再小，气泡会压住金句。
- 页面底部 y 990 以下留空：署名会放在那里（黑板放在粉笔槽上沿）。

**常见的坑**：

- 结尾也要至少 1 拍：致谢第 1 拍出现。
- 结尾必须是最后一页，署名才会加在这里；它后面不要再写别的 `Deck.add`。

---

## 所有样板都适用的坑

1. **长命令在 1920 宽下一个等宽字符约 19px**（中文约 34px）：放之前先算总宽，超出舞台或盖到别的东西，自检会报「超出舞台」或「叠在一起」。
2. **形象落点要给气泡留位置**：写了 `data-mascot-say` 的那一拍，形象头顶上方要空出约 75px（气泡高约 60px，再留点空），气泡朝形象面对的那一侧伸出去，宽约「字数 × 34 + 40px」。站在 `right` 一侧时它面朝左，气泡往左伸。
3. **正文不小于 34px**：样板里的字号都够；改字号只往大改。确实是注释类的小字才加 `data-small`（不小于 24px）。
4. **圈注包在行内元素上**：`data-mark` 写在 `<span>` 上，圈才贴着字；写在 `<p>`、`<div>` 上，圈的是整行。被圈的词前后留点空（见清单样板的 CSS）。
5. **位置都是 1920×1080 的舞台坐标**：浏览器窗口多大都按比例缩放，照样板的数字改就行。
6. **改完就跑检查**：`check <课件目录>`（几秒）和 `check <课件目录> --browser`（5 个尺寸逐页逐拍量）。报告里每条都写了在第几页第几拍、什么问题、怎么改；照着改，不要猜。
