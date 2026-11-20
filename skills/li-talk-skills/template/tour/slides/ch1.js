/* li-talk-skills 教程 · 第一部分：封面、认识它、装好它、怎么开始（p01–p08）
   风格是水彩田园 watercolor、形象是朵朵 duoduo。叙事：你专心讲好内容，其他（版式、风格、动效）交给 AI。
   版式按一本温柔的水彩绘本来：封面是书名加藏书票，和 AI 的对话写成一张张手绘便签（绘本对白），
   三种起点是晾在绳子上的三张小画。水彩田园的自有组件（.wc-*）自己选好出场，页面里只写结构和 data-beat。
   有真截图的放「真图」（figure.shot，图在 素材/），讲界面的地方用便签、小画示意，旁边写一行「示意」；每张图都有一句说明。
   内容以 README.md、SKILL.md 和 li-talk.mjs 的用法说明为准，没有的功能不写 */

/* p01 封面：左边手写的大书名（重点词晕一抹暖阳黄），书名下一道天空蓝笔触托着副题；右边贴一张真图（样册首页）；
   第 1 拍一张藏书票落下来，写着适合的场合 */
Deck.add({
  id: 'p01',
  chapter: '开场',
  scene: 'watercolor',
  title: 'li-talk-skills 教程',
  noTitle: true,
  html: `
    <span class="tag t-blue abs p01-chip" data-beat="0" style="left:150px;top:176px">li-talk-skills 教程</span>
    <p class="wc-title abs p01-h" data-beat="0" style="left:146px;top:262px">你专心讲好内容，<br>其他交给 <em class="key">AI</em></p>
    <i class="wc-wash abs" data-beat="0" style="left:136px;top:548px;width:860px;height:80px"></i>
    <p class="abs p01-sub" data-beat="0" style="left:160px;top:556px">版式、风格、动效都交给 AI，你只管讲</p>
    <figure class="abs shot p01-shot" data-beat="0" data-src="素材/hero.jpg" data-caption="真图：样册首页，16 种风格一屏看完" style="left:1060px;top:330px;width:740px;--ar:16/9;--r:1deg"></figure>
    <span class="tag abs p01-fold" data-beat="0" data-recede="off" style="left:1560px;top:176px">专注分享本身</span>
    <div class="wc-paper wc-plate abs p01-plate" data-beat="1" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".7" data-mascot-pose="happy" style="left:150px;top:690px;--r:-1deg">
      <p>适合 <b>分享 · 培训 · 汇报 · 演讲</b></p>
    </div>
    <div class="mascot guide" style="left:880px;top:830px"></div>`,
  notes: [
    { beat: 0, key: 'AI', say: '欢迎使用 li-talk-skills。它想让你做一件事：专心讲好内容，其他交给 AI。' },
    { beat: 1, say: '做分享、培训、汇报、演讲都合适。下面带你从安装到讲完走一遍。' },
  ],
});

/* p02 专注分享本身：左边两块水彩底的卡（你做什么、AI 做什么）一拍一张，右边贴一张真图，最后一排水彩小标签写「不适合」 */
Deck.add({
  id: 'p02',
  chapter: '一、认识它',
  chapterShort: '认识它',
  topic: '专注分享本身',
  scene: 'watercolor',
  title: '专注分享本身，其他交给 AI',
  html: `
    <div class="abs card t-yellow p02-c" data-beat="1" data-mascot="1" data-mascot-side="right" style="left:120px;top:270px;width:760px;--r:-.8deg"><h3>你：想清楚讲什么</h3><p>主题、想法、笔记、截图，或者一份讲稿</p></div>
    <div class="abs card t-mint p02-c" data-beat="2" data-mascot="2" data-mascot-side="right" data-mascot-pose="happy" style="left:120px;top:520px;width:760px;--r:.6deg"><h3>AI：版式、风格、动效</h3><p>一页页排好，一拍一拍地出，还配好讲词</p></div>
    <figure class="abs shot" data-beat="3" data-mascot="3" data-mascot-side="stay" data-src="素材/styles/watercolor.jpg" data-caption="真图：AI 做出来的一页（水彩田园）" style="left:1000px;top:270px;width:800px;--r:.8deg"></figure>
    <div class="abs p02-no" data-beat="4" style="left:120px;top:810px"><span class="p02-lb" data-small>不适合</span><span class="tag">导出 pptx</span><span class="tag">导出 pdf</span><span class="tag">纯文档</span><span class="tag">数据看板</span></div>
    <div class="mascot guide" style="left:1660px;top:100px"></div>`,
  notes: [
    { beat: 0, say: '先说它到底帮你做什么。' },
    { beat: 1, key: '讲什么', say: '你只管想清楚要讲什么：一个主题、一些想法和截图，或者已经写好的讲稿都行。' },
    { beat: 2, key: '版式', say: '版式、风格、动效交给 AI：它把每页排好，一拍一拍地出，还配好照着讲的讲词。' },
    { beat: 3, say: '这是 AI 做出来的一页，水彩田园风格。课件是网页，双击就能离线打开。' },
    { beat: 4, key: '不适合', say: '它不做的事也说清楚：不导出 pptx 和 pdf，也不适合做纯文档和数据看板。' },
  ],
});

/* p03 能用在哪：右边中间一张水彩纸写着 li-talk-skills，四个智能体是四块水彩底的小卡，一拍一块，铅笔线把它连到中间 */
Deck.add({
  id: 'p03',
  chapter: '一、认识它',
  chapterShort: '认识它',
  topic: '用在哪',
  scene: 'watercolor',
  title: '能跑命令的 AI 智能体，都能用',
  html: `
    <div class="abs p03-l" data-beat="0" style="left:120px;top:300px;width:640px">
      <p class="p03-big">能跑命令、能读写本地文件的 AI 智能体，都能用</p>
      <p class="p03-sm">编程工具、国产智能体都行；网页版的聊天框用不了，它没法在你的电脑上建文件、开浏览器</p>
    </div>
    <svg class="sketch" aria-hidden="true">
      <path data-beat="1" d="M1240 540C1210 500 1180 470 1150 420"/>
      <path data-beat="2" d="M1420 540C1450 500 1500 470 1560 420"/>
      <path data-beat="3" d="M1240 650C1200 700 1160 740 1110 790"/>
      <path data-beat="4" d="M1420 650C1460 700 1500 740 1540 790"/>
    </svg>
    <div class="wc-paper abs p03-core" data-beat="0" style="left:1130px;top:540px;width:400px;--r:-.6deg"><p>li-talk-skills</p></div>
    <div class="abs card t-blue p03-plt" data-beat="1" data-mascot="1" data-mascot-side="left" data-mascot-pose="point" style="left:900px;top:300px;width:400px;--r:-1deg"><p>Claude Code</p></div>
    <div class="abs card t-yellow p03-plt" data-beat="2" style="left:1460px;top:300px;width:340px;--r:.8deg"><p>Codex</p></div>
    <div class="abs card t-peach p03-plt" data-beat="3" style="left:900px;top:790px;width:340px;--r:.6deg"><p>Cursor</p></div>
    <div class="abs card t-mint p03-plt" data-beat="4" style="left:1280px;top:790px;width:520px;--r:-.8deg"><p>DeepSeek · WorkBuddy</p></div>
    <p class="abs p-capt" data-beat="0" data-small style="left:900px;top:940px"><span class="tag">示意</span>li-talk-skills 装进这些智能体里用</p>
    <div class="mascot guide" style="left:460px;top:800px"></div>`,
  notes: [
    { beat: 0, say: '它装在 AI 智能体里用：能跑命令、能读写本地文件的都行。网页版的聊天框用不了。' },
    { beat: 1, key: 'Claude Code', say: '比如 Claude Code。' },
    { beat: 2, key: 'Codex', say: 'Codex。' },
    { beat: 3, key: 'Cursor', say: 'Cursor。' },
    { beat: 4, key: 'DeepSeek', say: '还有 DeepSeek、WorkBuddy 这些国产智能体，也都能用。' },
  ],
});

/* p04 安装：对 AI 说一句话。和 AI 的对话写成绘本对白：一句一张手绘便签，「你」说的贴右边、AI 说的贴左边，
   便签上一块水彩小标签写是谁说的（你是暖桃色，AI 是草绿）。AI 自己检查环境、没有 Node 就先装好 */
Deck.add({
  id: 'p04',
  chapter: '二、装好它',
  chapterShort: '安装',
  topic: '一句话',
  scene: 'watercolor',
  title: '安装：对 AI 说一句话',
  html: `
    <p class="abs p-hd" data-beat="0" style="left:120px;top:250px"><span class="tag t-blue">和 AI 的对话</span><span class="p-hint" data-small>点一下你说的那句，复制</span></p>
    <div class="wc-paper abs p-say p-me" data-beat="1" data-copy="帮我安装 xiaoli1999/li-talk-skills" style="left:420px;top:350px;width:860px;--r:.8deg"><span class="tag t-peach p-who">你</span><p class="p-txt">帮我安装 xiaoli1999/li-talk-skills</p></div>
    <div class="wc-paper abs p-say" data-beat="2" data-mascot="2" data-mascot-side="stay" style="left:120px;top:510px;width:1060px;--r:-.6deg"><span class="tag t-mint p-who">AI</span><p class="p-txt">先检查一下环境：这台电脑还没有 Node，我先帮你装好。</p></div>
    <div class="wc-paper abs p-say" data-beat="3" data-mascot="3" data-mascot-side="stay" data-mascot-pose="happy" style="left:120px;top:690px;width:1060px;--r:.5deg"><span class="tag t-mint p-who">AI</span><p class="p-txt">li-talk-skills 装好了。新开一个对话就能用。</p></div>
    <p class="abs p-capt" data-beat="0" data-small style="left:120px;top:900px"><span class="tag">示意</span>在 AI 智能体里，对它说一句话就能装好</p>
    <div class="abs card t-yellow p04-card" data-beat="0" style="left:1340px;top:290px;width:460px;--r:1deg">
      <h3>不用自己准备环境</h3>
      <p>AI 会检查 Node，没有就先装好；不是开发者也能用</p>
    </div>
    <div class="mascot guide" style="left:1660px;top:820px"></div>`,
  notes: [
    { beat: 0, say: '安装最简单的办法，是直接对 AI 说一句话。环境不用你准备。' },
    { beat: 1, key: '帮我安装', say: '就说：帮我安装 xiaoli1999/li-talk-skills。这句话点一下就能复制。' },
    { beat: 2, key: 'Node', say: 'AI 会先检查环境，电脑上没有 Node，它先帮你装好。' },
    { beat: 3, key: '新开一个对话', say: '装好以后，新开一个对话就能用了。' },
  ],
});

/* p05 自己敲命令：上面一行可以复制的命令（一抹淡黄水彩），左下终端（水彩纸卡片，示意），右边两步（序号是一滴天空蓝颜料） */
Deck.add({
  id: 'p05',
  chapter: '二、装好它',
  chapterShort: '安装',
  topic: '自己敲命令',
  scene: 'watercolor',
  title: '想自己敲命令？就这一行',
  html: `
    <div class="abs p05-cmd" data-beat="0" style="left:120px;top:250px"><button class="copy" type="button" data-copy="npx skills add xiaoli1999/li-talk-skills -g -a claude-code -y">npx skills add xiaoli1999/li-talk-skills -g -a claude-code -y</button></div>
    <div class="abs term" data-title="终端" data-beat="0" data-recede="off" style="left:120px;top:400px;width:900px;--r:-.5deg">
      <p class="in">npx skills add xiaoli1999/li-talk-skills</p>
      <p class="ok" data-beat="1" data-mascot="1" data-mascot-side="stay" data-mascot-pose="point">✓ 已装到全局：li-talk-skills</p>
    </div>
    <p class="abs p-capt" data-beat="0" data-small style="left:120px;top:680px"><span class="tag">示意</span>在终端里运行安装命令</p>
    <ol class="abs steps p05-flow" style="left:1100px;top:400px;width:700px;--gap:44px">
      <li><b>换成你的工具</b><span data-beat="2">用 Codex 就把 claude-code 换成 codex，用 Cursor 换成 cursor</span></li>
      <li><b>新开一个对话</b><span data-beat="3">新装的 skill 要在新对话里才会加载</span></li>
    </ol>
    <div class="mascot guide" style="left:1660px;top:820px"></div>`,
  notes: [
    { beat: 0, say: '想自己敲命令的话，就这一行，点一下就能复制。' },
    { beat: 1, key: '已装到全局', say: '在终端里运行，它会装到全局，在哪个目录都能用。' },
    { beat: 2, key: 'codex', say: '用 Codex 的话把 claude-code 换成 codex，用 Cursor 换成 cursor。' },
    { beat: 3, key: '新开', say: '装好以后同样新开一个对话。' },
  ],
});

/* p06 第一次用：AI 问要不要看新手教程（绘本对白：一句一张便签，AI 的问题下面两块水彩小标签是编号选项） */
Deck.add({
  id: 'p06',
  chapter: '二、装好它',
  chapterShort: '第一次用',
  topic: '新手教程',
  scene: 'watercolor',
  title: '第一次用：先过一遍教程',
  html: `
    <p class="abs p-hd" data-beat="0" style="left:120px;top:250px"><span class="tag t-blue">和 AI 的对话</span><span class="p-hint" data-small>第一次用</span></p>
    <div class="wc-paper abs p-say" data-beat="1" data-mascot="1" data-mascot-side="stay" style="left:120px;top:350px;width:1060px;--r:-.6deg"><span class="tag t-mint p-who">AI</span><div class="p-col"><p class="p-txt">第一次用 li-talk-skills，要不要先过一遍新手教程？</p><p class="p-opts"><span class="tag t-yellow">1 先过一遍</span><span class="tag t-yellow">2 先不学</span></p></div></div>
    <div class="wc-paper abs p-say p-me" data-beat="2" style="left:880px;top:590px;width:300px;--r:1deg"><span class="tag t-peach p-who">你</span><p class="p-txt">1</p></div>
    <div class="wc-paper abs p-say" data-beat="3" style="left:120px;top:720px;width:1060px;--r:.5deg"><span class="tag t-mint p-who">AI</span><p class="p-txt">已经在浏览器里打开了教程，看完我再打开样册，带你看全部风格。</p></div>
    <p class="abs p-capt" data-beat="0" data-small style="left:120px;top:920px"><span class="tag">示意</span>装好后第一次用，AI 会先问这一句</p>
    <div class="abs card t-yellow p06-card" data-beat="0" style="left:1300px;top:290px;width:500px;--r:1deg">
      <h3>以后想再看</h3>
      <p>对 AI 说「打开 li-talk-skills 新手教程」，就是你现在看的这一份</p>
    </div>
    <div class="mascot guide" style="left:1660px;top:820px"></div>`,
  notes: [
    { beat: 0, say: '装好以后第一次用，AI 会先问你一个问题。' },
    { beat: 1, key: '新手教程', say: '要不要先过一遍新手教程。它会给你编号的选项。' },
    { beat: 2, say: '回一个数字就行。' },
    { beat: 3, key: '样册', say: 'AI 会在浏览器里打开教程，看完再打开样册带你看全部风格。不想看可以跳过，以后随时能回来。' },
  ],
});

/* p07 怎么开始（金句页）：一句大字压在一大团很淡的天空蓝水彩上，右下一枝水彩写生作点缀；
   下面一行可以复制的话（一抹淡黄水彩） */
Deck.add({
  id: 'p07',
  chapter: '三、做一份课件',
  chapterShort: '做课件',
  topic: '怎么开始',
  scene: 'watercolor',
  title: '怎么开始',
  noTitle: true,
  html: `
    <div class="wc-art abs" data-beat="0" style="left:1450px;top:500px;width:340px;height:445px">
      <svg class="wc-paint" viewBox="0 0 520 680" aria-hidden="true">
        <path class="sky" d="M60 300C40 160 150 70 280 74C410 78 500 190 490 330C482 470 470 600 330 640C190 676 70 600 60 470C54 410 66 360 60 300Z" style="--o:.14"/>
        <circle class="sun" cx="418" cy="120" r="64" style="--o:.5"/>
        <path class="leaf st" d="M254 644C266 544 242 444 262 354C276 284 284 214 294 154" style="--w:8;--o:.5"/>
        <g transform="translate(256 565) rotate(-160)"><path class="leaf" d="M0 0C57 -57.5 136.8 -47.5 190 0C136.8 47.5 57 57.5 0 0Z" style="--o:.55"/></g>
        <g transform="translate(254 475) rotate(-20)"><path class="leaf" d="M0 0C60 -62.1 144 -51.3 200 0C144 51.3 60 62.1 0 0Z" style="--o:.5"/></g>
        <g transform="translate(260 377) rotate(-152)"><path class="leaf" d="M0 0C48 -50.6 115.2 -41.8 160 0C115.2 41.8 48 50.6 0 0Z" style="--o:.55"/></g>
        <g transform="translate(270 297) rotate(-28)"><path class="leaf" d="M0 0C46.8 -48.3 112.3 -39.9 156 0C112.3 39.9 46.8 48.3 0 0Z" style="--o:.5"/></g>
        <g transform="translate(285 210) rotate(-138)"><path class="mint" d="M0 0C35.4 -36.8 85 -30.4 118 0C85 30.4 35.4 36.8 0 0Z" style="--o:.62"/></g>
        <g transform="translate(291 173) rotate(-48)"><path class="mint" d="M0 0C32.4 -32.2 77.8 -26.6 108 0C77.8 26.6 32.4 32.2 0 0Z" style="--o:.62"/></g>
        <g transform="translate(295 155) rotate(-84)"><path class="mint" d="M0 0C27.6 -19.6 66.2 -16.2 92 0C66.2 16.2 27.6 19.6 0 0Z" style="--o:.7"/></g>
      </svg>
      <svg class="sketch" viewBox="0 0 520 680" aria-hidden="true">
        <path d="M250 640C262 540 238 440 258 350C272 280 280 210 290 150"/>
        <g transform="translate(252 560) rotate(-160)"><path d="M0 0C57 -57.5 136.8 -47.5 190 0C136.8 47.5 57 57.5 0 0Z"/><path d="M7.6 0Q95 -5 171 0" data-roughness=".5" stroke-width="1.6"/></g>
        <g transform="translate(250 470) rotate(-20)"><path d="M0 0C60 -62.1 144 -51.3 200 0C144 51.3 60 62.1 0 0Z"/><path d="M8 0Q100 -5.4 180 0" data-roughness=".5" stroke-width="1.6"/></g>
        <g transform="translate(256 372) rotate(-152)"><path d="M0 0C48 -50.6 115.2 -41.8 160 0C115.2 41.8 48 50.6 0 0Z"/><path d="M6.4 0Q80 -4.4 144 0" data-roughness=".5" stroke-width="1.6"/></g>
        <g transform="translate(266 292) rotate(-28)"><path d="M0 0C46.8 -48.3 112.3 -39.9 156 0C112.3 39.9 46.8 48.3 0 0Z"/><path d="M6.2 0Q78 -4.2 140.4 0" data-roughness=".5" stroke-width="1.6"/></g>
        <g transform="translate(281 205) rotate(-138)"><path d="M0 0C35.4 -36.8 85 -30.4 118 0C85 30.4 35.4 36.8 0 0Z"/></g>
        <g transform="translate(287 168) rotate(-48)"><path d="M0 0C32.4 -32.2 77.8 -26.6 108 0C77.8 26.6 32.4 32.2 0 0Z"/></g>
        <g transform="translate(291 150) rotate(-84)"><path d="M0 0C27.6 -19.6 66.2 -16.2 92 0C66.2 16.2 27.6 19.6 0 0Z" data-roughness=".6"/></g>
      </svg>
    </div>
    <p class="abs quote p07-q" data-beat="0" data-mascot="0" data-mascot-side="right" data-mascot-dy="40" style="left:150px;top:250px">用 li-talk-skills<br>帮我做一个关于<em class="key">「……」</em>的课件</p>
    <p class="abs p07-by" data-beat="1" style="left:154px;top:600px">在任意目录，对 AI 说这一句就能开始</p>
    <div class="abs p07-copy" data-beat="2" style="left:154px;top:710px"><p class="p07-tip" data-small>点一下复制，把省略号换成你的主题：</p><button class="copy" type="button" data-copy="用 li-talk-skills 帮我做一个关于「」的课件">用 li-talk-skills 帮我做一个关于「」的课件</button></div>
    <div class="mascot guide" style="left:1200px;top:820px"></div>`,
  notes: [
    { beat: 0, key: '课件', say: '怎么开始？你只管想好讲什么，然后对 AI 说一句：用 li-talk-skills 帮我做一个关于什么什么的课件。' },
    { beat: 1, say: '在任意目录对 AI 说就行。' },
    { beat: 2, say: '这句话点一下就能复制，把省略号换成你的主题。' },
  ],
});

/* p08 三种起点：两根木杆之间拉一根晾衣绳，三张刚画好的水彩小画一拍一张夹上去（灯泡、笔记和照片、一本讲稿），
   画纸下半截写编号、起点和一句说明；朵朵跑到这张画下面。绳子的算法见 samples/watercolor.js 的晾画绳 */
Deck.add({
  id: 'p08',
  chapter: '三、做一份课件',
  chapterShort: '做课件',
  topic: '三种起点',
  scene: 'watercolor',
  title: 'AI 会先问：你手上有什么',
  html: `
    <svg class="sketch" aria-hidden="true">
      <g data-beat="0">
        <path d="M134 906L132 284" stroke-width="3"/>
        <path d="M1786 900L1788 284" stroke-width="3"/>
        <path d="M120 300Q960 428 1800 300"/>
      </g>
    </svg>
    <div class="wc-paper wc-hang abs p08-h" data-beat="1" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".37" style="left:170px;top:346px;width:500px;--r:-1.2deg">
      <div class="wc-art">
        <svg class="wc-paint" viewBox="0 0 400 220" aria-hidden="true">
          <path class="sun" d="M40 118C40 50 120 18 210 20C300 22 370 60 366 126C362 188 290 212 200 210C110 208 40 188 40 118Z" style="--o:.28"/>
          <circle class="sun" cx="200" cy="92" r="50" style="--o:.6"/>
          <path class="shade" d="M178 140H222V176Q200 188 178 176Z" style="--o:.3"/>
          <ellipse class="shade" cx="204" cy="202" rx="80" ry="8" style="--o:.16"/>
        </svg>
        <svg class="sketch" viewBox="0 0 400 220" aria-hidden="true">
          <path d="M178 140C150 126 146 100 150 84C156 58 176 42 200 42C224 42 244 58 250 84C254 100 250 126 222 140Z"/>
          <path d="M178 140H222M180 154H220M182 168H218" data-roughness=".5"/>
          <path d="M190 182Q200 190 210 182" data-roughness=".4" stroke-width="1.6"/>
          <path d="M188 136L192 100L200 112L208 100L212 136" data-roughness=".4" stroke-width="1.5"/>
          <path d="M120 60L100 48M118 96L94 98M282 60L302 48M284 96L308 98M200 22L200 6" data-roughness=".4" stroke-width="1.6"/>
        </svg>
      </div>
      <h3><i class="wc-no">1</i>只有一个主题</h3>
      <p>一问一答：讲给谁、讲多久、在哪讲，再起一份提纲</p>
    </div>
    <div class="wc-paper wc-hang abs p08-h" data-beat="2" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".37" style="left:710px;top:372px;width:500px;--r:.8deg">
      <div class="wc-art">
        <svg class="wc-paint" viewBox="0 0 400 220" aria-hidden="true">
          <path class="mint" d="M36 122C34 56 118 20 208 22C302 24 370 62 366 128C362 190 288 212 198 210C108 208 38 190 36 122Z" style="--o:.3"/>
          <g transform="translate(96 52) rotate(-6)"><rect class="white" x="0" y="0" width="140" height="150" style="--o:.95"/></g>
          <g transform="translate(196 44) rotate(5)">
            <rect class="sky" x="0" y="0" width="150" height="112" style="--o:.4"/>
            <path class="grass" d="M0 112L0 80L44 46L82 82L108 60L150 96L150 112Z" style="--o:.55"/>
            <circle class="sun" cx="116" cy="28" r="14" style="--o:.7"/>
          </g>
        </svg>
        <svg class="sketch" viewBox="0 0 400 220" aria-hidden="true">
          <g transform="translate(96 52) rotate(-6)"><rect x="0" y="0" width="140" height="150"/><path d="M20 34H118M20 62H112M20 90H118M20 118H90" data-roughness=".4" stroke-width="1.5"/></g>
          <g transform="translate(196 44) rotate(5)"><rect x="0" y="0" width="150" height="112"/><rect x="-10" y="-10" width="170" height="146" data-roughness=".5" stroke-width="1.5"/><path d="M0 80L44 46L82 82L108 60L150 96" data-roughness=".5" stroke-width="1.6"/></g>
        </svg>
      </div>
      <h3><i class="wc-no">2</i>有笔记、截图</h3>
      <p>放进课件目录的 素材/，AI 整理成提纲</p>
    </div>
    <div class="wc-paper wc-hang abs p08-h" data-beat="3" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".37" data-mascot-pose="happy" style="left:1250px;top:346px;width:500px;--r:-.6deg">
      <div class="wc-art">
        <svg class="wc-paint" viewBox="0 0 400 220" aria-hidden="true">
          <path class="peach" d="M42 116C44 52 122 18 212 20C304 22 368 62 364 126C360 188 290 212 200 210C110 208 40 182 42 116Z" style="--o:.3"/>
          <path class="white" d="M200 60C170 46 128 42 90 50V184C128 176 170 180 200 194Z" style="--o:.95"/>
          <path class="white" d="M200 60C230 46 272 42 310 50V184C272 176 230 180 200 194Z" style="--o:.95"/>
          <path class="sky" d="M200 194C170 180 128 176 90 184V196C128 188 170 192 200 206C230 192 272 188 310 196V184C272 176 230 180 200 194Z" style="--o:.5"/>
          <ellipse class="shade" cx="202" cy="210" rx="120" ry="7" style="--o:.16"/>
        </svg>
        <svg class="sketch" viewBox="0 0 400 220" aria-hidden="true">
          <path d="M200 60C170 46 128 42 90 50V184C128 176 170 180 200 194C230 180 272 176 310 184V50C272 42 230 46 200 60Z"/>
          <path d="M200 60V194"/>
          <path d="M112 78Q150 72 184 82M112 104Q150 98 184 108M112 130Q150 124 184 134M216 82Q250 72 288 78M216 108Q250 98 288 104M216 134Q250 124 274 128" data-roughness=".4" stroke-width="1.5"/>
        </svg>
      </div>
      <h3><i class="wc-no">3</i>已经有讲稿</h3>
      <p>AI 整理成标准格式，补上缺的段落</p>
    </div>
    <div class="mascot guide" style="left:1660px;top:100px"></div>`,
  notes: [
    { beat: 0, say: '说完这句话，AI 会先问你手上有什么，从三种起点出发。' },
    { beat: 1, key: '只有一个主题', say: '只有一个主题：AI 一问一答，问清楚讲给谁、讲多久、在什么场合讲，再起一份提纲给你改。' },
    { beat: 2, key: '素材', say: '有想法、笔记、截图：放进课件目录的素材文件夹，AI 列出清单、整理成提纲，只问缺的部分。' },
    { beat: 3, key: '讲稿', say: '已经有讲稿：AI 把它整理成标准格式，补上缺的段落，给你确认。' },
  ],
});
