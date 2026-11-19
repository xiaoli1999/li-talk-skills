/* li-talk-skills 教程 · 第一部分：封面、认识它、装好它、怎么开始（p01–p08）
   风格是方果 fangguo、形象是方小果 fangfang。叙事：你专心讲好内容，其他（版式、风格、动效）交给 AI。
   有真截图的放「真图」（figure.shot，图在 素材/），讲界面的地方画拟态示意图并贴「示意」；每张图都有一句说明。
   内容以 README.md、SKILL.md 和 li-talk.mjs 的用法说明为准，没有的功能不写 */

/* p01 封面：右边出血的浅蓝底板上放一张真图（样册首页），左边主标语 */
Deck.add({
  id: 'p01',
  chapter: '开场',
  scene: 'fangguo',
  title: 'li-talk-skills 教程',
  noTitle: true,
  html: `
    <i class="fg-bleed" hidden></i>
    <div class="abs fg-cover" data-beat="0" style="left:150px;top:230px;width:840px">
      <span class="fg-chip">li-talk-skills 教程</span>
      <h1 class="fg-hero p01-h">你专心讲好内容，<br>其他交给 <span class="fg-red">AI</span></h1>
      <p class="fg-sub">版式、风格、动效都交给 AI，你只管讲</p>
    </div>
    <figure class="abs shot p01-shot" data-beat="0" data-src="素材/hero.jpg" data-caption="真图：样册首页，16 种风格一屏看完" style="left:1040px;top:250px;width:760px;--ar:2040/1620"></figure>
    <div class="abs fg-fold" data-beat="0" data-recede="off" style="left:1560px;top:190px">专注分享本身</div>
    <p class="abs fg-who" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="happy" style="left:150px;top:860px"><span>适合 <b>分享 · 培训 · 汇报 · 演讲</b></span></p>
    <div class="mascot guide" style="left:880px;top:820px"></div>`,
  notes: [
    { beat: 0, key: 'AI', say: '欢迎使用 li-talk-skills。它想让你做一件事：专心讲好内容，其他交给 AI。' },
    { beat: 1, say: '做分享、培训、汇报、演讲都合适。下面带你从安装到讲完走一遍。' },
  ],
});

/* p02 专注分享本身：左边两张卡（你做什么、AI 做什么）一拍一张，右边一张真图，最后一条「不适合」 */
Deck.add({
  id: 'p02',
  chapter: '一、认识它',
  chapterShort: '认识它',
  topic: '专注分享本身',
  scene: 'fangguo',
  title: '专注分享本身，其他交给 AI',
  html: `
    <div class="abs fg-fc p02-c" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="think" style="left:120px;top:260px;width:760px"><i class="fg-ico" data-fg-ico="bulb"></i><div><h4>你：想清楚讲什么</h4><p>主题、想法、笔记、截图，或者一份讲稿</p></div></div>
    <div class="abs fg-fc p02-c" data-beat="2" data-mascot="2" data-mascot-side="right" data-mascot-pose="idea" style="left:120px;top:510px;width:760px"><i class="fg-ico" data-fg-ico="layers" data-fg-tone="purple"></i><div><h4>AI：版式、风格、动效</h4><p>一页页排好，一拍一拍地出，还配好讲词</p></div></div>
    <figure class="abs shot" data-beat="3" data-mascot="3" data-mascot-side="stay" data-mascot-pose="ok" data-src="素材/styles/watercolor.jpg" data-caption="真图：AI 做出来的一页（水彩田园）" style="left:1000px;top:260px;width:800px"></figure>
    <div class="abs fg-plat p02-no" data-beat="4" style="left:120px;top:800px"><span data-small>不适合</span><b>导出 pptx</b><b>导出 pdf</b><b>纯文档</b><b>数据看板</b></div>
    <div class="mascot guide" style="left:1660px;top:96px"></div>`,
  notes: [
    { beat: 0, say: '先说它到底帮你做什么。' },
    { beat: 1, key: '讲什么', say: '你只管想清楚要讲什么：一个主题、一些想法和截图，或者已经写好的讲稿都行。' },
    { beat: 2, key: '版式', say: '版式、风格、动效交给 AI：它把每页排好，一拍一拍地出，还配好照着讲的讲词。' },
    { beat: 3, say: '这是 AI 做出来的一页，水彩田园风格。课件是网页，双击就能离线打开。' },
    { beat: 4, key: '不适合', say: '它不做的事也说清楚：不导出 pptx 和 pdf，也不适合做纯文档和数据看板。' },
  ],
});

/* p03 能用在哪：平台汇聚，中间是 li-talk-skills，智能体一拍连上一个 */
Deck.add({
  id: 'p03',
  chapter: '一、认识它',
  chapterShort: '认识它',
  topic: '用在哪',
  scene: 'fangguo',
  title: '能跑命令的 AI 智能体，都能用',
  html: `
    <div class="abs p03-l" data-beat="0" style="left:120px;top:300px;width:640px">
      <p class="p03-big">能跑命令、能读写本地文件的 AI 智能体，都能用</p>
      <p class="p03-sm">编程工具、国产智能体都行；网页版的聊天框用不了，它没法在你的电脑上建文件、开浏览器</p>
    </div>
    <div class="abs fg-hub" data-fg-core="li-talk-skills" data-fg-rx="36" data-fg-ry="36" style="left:860px;top:230px;width:940px;height:700px">
      <b class="fg-plt" data-beat="1" data-mascot="1" data-mascot-side="stay" data-mascot-pose="point">Claude Code</b>
      <b class="fg-plt" data-beat="2">Codex</b>
      <b class="fg-plt" data-beat="3">Cursor</b>
      <b class="fg-plt" data-beat="4">DeepSeek · WorkBuddy</b>
    </div>
    <p class="abs fg-capt" data-beat="0" style="left:1030px;top:950px"><b>示意</b>li-talk-skills 装进这些智能体里用</p>
    <div class="mascot guide" style="left:460px;top:800px"></div>`,
  notes: [
    { beat: 0, say: '它装在 AI 智能体里用：能跑命令、能读写本地文件的都行。网页版的聊天框用不了。' },
    { beat: 1, key: 'Claude Code', say: '比如 Claude Code。' },
    { beat: 2, key: 'Codex', say: 'Codex。' },
    { beat: 3, key: 'Cursor', say: 'Cursor。' },
    { beat: 4, key: 'DeepSeek', say: '还有 DeepSeek、WorkBuddy 这些国产智能体，也都能用。' },
  ],
});

/* p04 安装：对 AI 说一句话（拟态示意：对话窗）。AI 自己检查环境、没有 Node 就先装好 */
Deck.add({
  id: 'p04',
  chapter: '二、装好它',
  chapterShort: '安装',
  topic: '一句话',
  scene: 'fangguo',
  title: '安装：对 AI 说一句话',
  html: `
    <div class="abs fg-win" data-beat="0" data-recede="off" style="left:120px;top:250px;width:1160px">
      <div class="fg-win-hd"><i class="fg-ico fg-ico-s" data-fg-ico="bulb"></i>和 AI 的对话<span data-small>点一下你说的那句，复制</span></div>
      <div class="fg-chat">
        <p class="fg-msg me" data-beat="1" data-copy="帮我安装 xiaoli1999/li-talk-skills">帮我安装 xiaoli1999/li-talk-skills</p>
        <p class="fg-msg ai" data-beat="2" data-mascot="2" data-mascot-side="stay" data-mascot-pose="think">先检查一下环境：这台电脑还没有 Node，我先帮你装好。</p>
        <p class="fg-msg ai" data-beat="3" data-mascot="3" data-mascot-side="stay" data-mascot-pose="ok">li-talk-skills 装好了。新开一个对话就能用。</p>
      </div>
    </div>
    <span class="abs fg-stamp" data-beat="0" style="left:1220px;top:226px">示意</span>
    <p class="abs fg-capt" data-beat="0" style="left:120px;top:940px"><b>示意</b>在 AI 智能体里，对它说一句话就能装好</p>
    <div class="abs card p04-card" data-beat="0" style="left:1340px;top:280px;width:460px">
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

/* p05 自己敲命令：上面一行可以复制的命令，左下终端（拟态示意），右下两步 */
Deck.add({
  id: 'p05',
  chapter: '二、装好它',
  chapterShort: '安装',
  topic: '自己敲命令',
  scene: 'fangguo',
  title: '想自己敲命令？就这一行',
  html: `
    <div class="abs p05-cmd" data-beat="0" style="left:120px;top:250px"><button class="copy" type="button" data-copy="npx skills add xiaoli1999/li-talk-skills -g -a claude-code -y">npx skills add xiaoli1999/li-talk-skills -g -a claude-code -y</button></div>
    <div class="abs term" data-title="终端" data-beat="0" data-recede="off" style="left:120px;top:400px;width:900px">
      <p class="in">npx skills add xiaoli1999/li-talk-skills</p>
      <p class="ok" data-beat="1" data-mascot="1" data-mascot-side="stay" data-mascot-pose="point">✓ 已装到全局：li-talk-skills</p>
    </div>
    <span class="abs fg-stamp" data-beat="0" style="left:960px;top:378px">示意</span>
    <p class="abs fg-capt" data-beat="0" style="left:120px;top:660px"><b>示意</b>在终端里运行安装命令</p>
    <div class="abs fg-flow p05-flow" style="left:1100px;top:400px;width:700px">
      <div class="fg-step"><div><h4>换成你的工具</h4><p data-beat="2">用 Codex 就把 claude-code 换成 codex，用 Cursor 换成 cursor</p></div></div>
      <div class="fg-step"><div><h4>新开一个对话</h4><p data-beat="3">新装的 skill 要在新对话里才会加载</p></div></div>
    </div>
    <div class="mascot guide" style="left:1660px;top:96px"></div>`,
  notes: [
    { beat: 0, say: '想自己敲命令的话，就这一行，点一下就能复制。' },
    { beat: 1, key: '已装到全局', say: '在终端里运行，它会装到全局，在哪个目录都能用。' },
    { beat: 2, key: 'codex', say: '用 Codex 的话把 claude-code 换成 codex，用 Cursor 换成 cursor。' },
    { beat: 3, key: '新开', say: '装好以后同样新开一个对话。' },
  ],
});

/* p06 第一次用：AI 问要不要看新手教程（拟态示意：对话窗） */
Deck.add({
  id: 'p06',
  chapter: '二、装好它',
  chapterShort: '第一次用',
  topic: '新手教程',
  scene: 'fangguo',
  title: '第一次用：先过一遍教程',
  html: `
    <div class="abs fg-win" data-beat="0" data-recede="off" style="left:120px;top:250px;width:1120px">
      <div class="fg-win-hd"><i class="fg-ico fg-ico-s" data-fg-ico="bulb"></i>和 AI 的对话<span data-small>第一次用</span></div>
      <div class="fg-chat">
        <div class="fg-msg ai" data-beat="1" data-mascot="1" data-mascot-side="stay" data-mascot-pose="ask">第一次用 li-talk-skills，要不要先过一遍新手教程？<p class="fg-opts"><span>1 先过一遍</span><span>2 先不学</span></p></div>
        <p class="fg-msg me" data-beat="2">1</p>
        <p class="fg-msg ai" data-beat="3">已经在浏览器里打开了教程，看完我再打开样册，带你看全部风格。</p>
      </div>
    </div>
    <span class="abs fg-stamp" data-beat="0" style="left:1180px;top:226px">示意</span>
    <p class="abs fg-capt" data-beat="0" style="left:120px;top:900px"><b>示意</b>装好后第一次用，AI 会先问这一句</p>
    <div class="abs card p06-card" data-beat="0" style="left:1300px;top:290px;width:500px">
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

/* p07 怎么开始（金句页）：一句话就能开始，点一下复制 */
Deck.add({
  id: 'p07',
  chapter: '三、做一份课件',
  chapterShort: '做课件',
  topic: '怎么开始',
  scene: 'fangguo',
  title: '怎么开始',
  noTitle: true,
  html: `
    <i class="fg-bleed fg-wash" hidden></i>
    <p class="abs fg-quote p07-q" data-beat="0" data-mascot="0" data-mascot-side="right" data-mascot-pose="idle" data-mascot-dy="60" style="left:150px;top:260px;white-space:nowrap">用 li-talk-skills<br>帮我做一个关于<span class="fg-hl">「……」</span>的课件</p>
    <p class="abs fg-quote-by" data-beat="1" style="left:154px;top:620px">在任意目录，对 AI 说这一句就能开始</p>
    <p class="abs p07-copy" data-beat="2" style="left:154px;top:720px"><span data-small>点一下复制，把省略号换成你的主题：</span><span class="fg-code" data-copy="用 li-talk-skills 帮我做一个关于「」的课件">用 li-talk-skills 帮我做一个关于「」的课件</span></p>
    <i class="abs fg-deco" style="left:1260px;top:220px;width:600px"></i>
    <div class="mascot guide" style="left:1500px;top:760px"></div>`,
  notes: [
    { beat: 0, key: '课件', say: '怎么开始？你只管想好讲什么，然后对 AI 说一句：用 li-talk-skills 帮我做一个关于什么什么的课件。' },
    { beat: 1, say: '在任意目录对 AI 说就行。' },
    { beat: 2, say: '这句话点一下就能复制，把省略号换成你的主题。' },
  ],
});

/* p08 三种起点：编辑式网格，一拍出一整块（编号、图标、关键词、说明），当前那块的关键词变蓝，方小果跟着走 */
Deck.add({
  id: 'p08',
  chapter: '三、做一份课件',
  chapterShort: '做课件',
  topic: '三种起点',
  scene: 'fangguo',
  title: 'AI 会先问：你手上有什么',
  html: `
    <div class="abs fg-values p08-v" style="left:120px;top:290px;width:1680px">
      <div class="fg-val" data-beat="1" data-mascot="1" data-mascot-side="stay" data-mascot-pose="ask"><i></i><span class="fg-ico" data-fg-ico="bulb"></span><b>只有一个主题</b><p>一问一答：讲给谁、讲多久、在哪讲，再起一份提纲</p></div>
      <div class="fg-val" data-beat="2" data-mascot="2" data-mascot-side="stay" data-mascot-pose="point"><i></i><span class="fg-ico" data-fg-ico="img" data-fg-tone="teal"></span><b>有笔记、截图</b><p>放进课件目录的 <span class="fg-code">素材/</span>，AI 整理成提纲</p></div>
      <div class="fg-val" data-beat="3" data-mascot="3" data-mascot-side="stay" data-mascot-pose="ok"><i></i><span class="fg-ico" data-fg-ico="doc" data-fg-tone="purple"></span><b>已经有讲稿</b><p>AI 整理成标准格式，补上缺的段落</p></div>
    </div>
    <div class="mascot guide" style="left:1660px;top:96px"></div>`,
  notes: [
    { beat: 0, say: '说完这句话，AI 会先问你手上有什么，从三种起点出发。' },
    { beat: 1, key: '只有一个主题', say: '只有一个主题：AI 一问一答，问清楚讲给谁、讲多久、在什么场合讲，再起一份提纲给你改。' },
    { beat: 2, key: '素材', say: '有想法、笔记、截图：放进课件目录的素材文件夹，AI 列出清单、整理成提纲，只问缺的部分。' },
    { beat: 3, key: '讲稿', say: '已经有讲稿：AI 把它整理成标准格式，补上缺的段落，给你确认。' },
  ],
});
