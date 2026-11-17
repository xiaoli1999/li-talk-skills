/* 水彩田园测试课件：6 页，把通用组件都用一遍
   1 封面（逐字显出的大字、标签逐个出现）
   2 清单（卡片 + 标签 + 重点词 + 胶带 + 圈注）
   3 步骤（带序号的步骤 + 手绘箭头 + 带填充色的线稿 + 下划线圈注）
   4 终端（终端窗口 + 可复制的一行 + 一排小格）
   5 对比（左右对比 + 白纸卡片 + 删除线圈注 + 重点词）
   6 结尾（截图位 + 大字金句） */

Deck.add({
  id: 'cover',
  chapter: '开场',
  scene: 'watercolor',
  title: '做一份会动的分享课件',
  noTitle: true,
  html: `
    <p class="abs t-xl b" data-beat="0" data-in="letters" data-mascot="0" data-mascot-side="right" style="left:150px;top:330px">做一份会动的分享课件</p>
    <p class="abs lead muted" data-beat="0" style="left:150px;top:470px">一页一页、一拍一拍地讲，双击就能打开</p>
    <div class="abs row" data-beat="1" data-stagger data-mascot="1" data-mascot-side="right" style="left:150px;top:610px;--gap:34px;--align:center">
      <span class="tag">入门</span><span class="tag t-blue">二十分钟</span><span class="tag t-mint">不用写代码</span>
    </div>
    <div class="mascot guide"></div>`,
  notes: [
    { beat: 0, say: '今天讲怎么做一份会动的分享课件。' },
    { beat: 1, key: '入门', say: '面向第一次做的人，二十分钟，不用写代码。' },
  ],
});

Deck.add({
  id: 'list',
  chapter: '一、上手',
  topic: '动手之前',
  scene: 'watercolor',
  title: '先准备好三样东西',
  html: `
    <p class="explain" data-beat="0" data-mascot="0" data-mascot-side="right" data-mascot-dx="90"><b>讲稿</b>：按页写下的、你要说的话</p>
    <div class="abs grid" style="left:150px;top:330px;width:1620px;--cols:3;--gap:60px">
      <div class="card t-blue" data-beat="1" data-mascot="1" data-mascot-side="bottom" style="--r:-1deg">
        <span class="lab">第一样</span><h3>一份<em class="key">讲稿</em></h3><p>按页写下想讲的话</p>
      </div>
      <div class="card t-yellow" data-beat="2" data-mascot="2" data-mascot-side="bottom" style="--r:.8deg">
        <span class="lab">第二样</span><h3>几张<em class="key">截图</em></h3><p>放进素材文件夹</p>
      </div>
      <div class="card t-mint tape" data-beat="3" data-mascot="3" data-mascot-side="bottom" style="--r:-.6deg">
        <h3>一点时间</h3><p><span data-mark="circle">二十分钟就够</span></p>
      </div>
    </div>
    <div class="mascot guide"></div>`,
  notes: [
    { beat: 0, say: '动手之前，先准备三样东西。' },
    { beat: 1, key: '讲稿', say: '第一样是讲稿，按页写下你要说的话。' },
    { beat: 2, key: '截图', say: '第二样是截图，放进素材文件夹。' },
    { beat: 3, say: '第三样是时间，二十分钟就够。' },
  ],
});

Deck.add({
  id: 'steps',
  chapter: '一、上手',
  topic: '三步做出一份课件',
  scene: 'watercolor',
  title: '一份课件，三步做完',
  html: `
    <p class="explain" data-beat="0" data-mascot="0" data-mascot-side="right" data-mascot-say="三步就好">课件就是一个能一拍一拍翻的网页，双击就能打开。</p>
    <ol class="steps h abs" style="left:120px;top:400px;width:1680px;--gap:120px">
      <li data-beat="1" data-mascot="1" data-mascot-side="bottom"><b>写<em class="key">讲稿</em></b><span>把想讲的话按页写下来</span></li>
      <li data-beat="2" data-mascot="2" data-mascot-side="bottom"><b><em class="key">选风格</em></b><span>从样册里挑一个顺眼的</span></li>
      <li data-beat="3" data-mascot="3" data-mascot-side="bottom"><b>出页面</b><span data-mark="underline">一条命令搭好骨架</span></li>
    </ol>
    <svg class="sketch">
      <path data-beat="2" data-arrow d="M606 440 C632 418 664 416 700 432"/>
      <path data-beat="3" data-arrow d="M1206 436 C1232 458 1264 460 1300 438"/>
      <rect data-beat="3" x="1540" y="664" width="260" height="170" fill="#8EC3E6"/>
      <circle data-beat="3" cx="1748" cy="712" r="22" fill="#F4C35A"/>
      <path data-beat="3" d="M1548 796 C1604 764 1664 772 1792 780"/>
    </svg>
    <div class="mascot guide"></div>`,
  notes: [
    { beat: 0, say: '一份课件，三步就能做完。' },
    { beat: 1, key: '讲稿', say: '第一步写讲稿。' },
    { beat: 2, key: '选风格', say: '第二步从样册里挑一个风格。' },
    { beat: 3, say: '第三步一条命令搭好骨架。' },
  ],
});

Deck.add({
  id: 'term',
  chapter: '二、动手',
  topic: '装好以后试一试',
  scene: 'watercolor',
  title: '一条命令，骨架就搭好了',
  html: `
    <div class="abs term" data-beat="1" data-title="终端" data-mascot="1" data-mascot-side="right" style="left:150px;top:260px;width:980px">
      <p class="in">node li-talk.mjs new 我的分享</p>
      <p class="dim">复制引擎、风格和起步章节……</p>
      <p class="ok">好了：我的分享/index.html</p>
    </div>
    <p class="abs muted" data-beat="2" style="left:150px;top:620px">点一下就能复制这行命令：</p>
    <button class="copy abs" data-beat="2" data-mascot="2" data-mascot-side="bottom" style="left:150px;top:700px" data-copy="node li-talk.mjs new 我的分享">node li-talk.mjs new 我的分享</button>
    <div class="abs cells" data-beat="3" data-stagger data-mascot="3" data-mascot-side="bottom" style="left:1240px;top:260px;width:540px">
      <div class="cell ai"><b>AI 写页面</b><span>照着讲稿来</span></div>
      <div class="cell human"><b>你来挑选</b><span>风格和截图</span></div>
      <div class="cell idle"><b>手动排版</b><span>不用再做了</span></div>
    </div>
    <div class="mascot guide" style="left:1660px;top:860px"></div>`,
  notes: [
    { beat: 0, say: '装好以后试一试。' },
    { beat: 1, say: '在终端里运行这条命令。' },
    { beat: 2, say: '这行命令点一下就能复制。' },
    { beat: 3, say: '页面交给 AI 写，风格和截图你来挑，手动排版就不用了。' },
  ],
});

Deck.add({
  id: 'vs',
  chapter: '二、动手',
  topic: '以前和现在',
  scene: 'watercolor',
  title: '做课件这件事，变轻了',
  html: `
    <div class="abs vs" data-mid="→" style="left:150px;top:300px;width:1620px">
      <div class="card t-white" data-beat="1" data-mascot="1" data-mascot-side="bottom">
        <h3>以前</h3><ul><li><span data-mark="strike" data-mark-beat="2">一页页拖文本框</span></li><li>动画一个个调</li><li>换个样子从头改</li></ul>
      </div>
      <div class="card t-peach" data-beat="2" data-mascot="2" data-mascot-side="bottom">
        <h3>现在</h3><ul><li>写好讲稿</li><li>挑一个风格</li><li>一拍一拍地讲</li></ul>
      </div>
    </div>
    <p class="abs t-lg" data-beat="3" data-mascot="3" data-mascot-side="right" style="left:585px;top:730px">省下的时间，用来想清楚<em class="key">要讲什么</em></p>
    <div class="mascot guide" style="left:1660px;top:860px"></div>`,
  notes: [
    { beat: 0, say: '做课件这件事，变轻了。' },
    { beat: 1, say: '以前一页页拖文本框，动画一个个调。' },
    { beat: 2, say: '现在写好讲稿、挑个风格就行。' },
    { beat: 3, key: '要讲什么', say: '省下的时间，用来想清楚要讲什么。' },
  ],
});

Deck.add({
  id: 'end',
  chapter: '结尾',
  topic: '最后',
  scene: 'watercolor',
  title: '做好之后，浏览器里直接打开',
  html: `
    <figure class="abs shot" data-beat="1" data-src="img/shot.svg" data-caption="做好的课件，双击就能打开" data-mascot="1" data-mascot-side="bottom" style="left:150px;top:250px;width:860px;--r:-1.2deg"></figure>
    <p class="abs quote" data-beat="2" data-mascot="2" data-mascot-side="bottom" style="left:1120px;top:400px;width:660px">先讲清楚，<br>再讲<em class="key">好看</em>。</p>
    <div class="mascot guide" style="left:1660px;top:860px"></div>`,
  notes: [
    { beat: 0, say: '做好之后，浏览器里直接打开。' },
    { beat: 1, say: '这是做好的样子。' },
    { beat: 2, key: '好看', say: '最后一句：先讲清楚，再讲好看。' },
  ],
});
