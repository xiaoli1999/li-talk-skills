/* li-talk-skills 教程 · 第一部分：封面、认识它、装好它、怎么开始（p01–p08）
   风格是方果 fangguo、形象是方方 fangfang。内容以 README.md、SKILL.md 和 li-talk.mjs 的用法说明为准，没有的功能不写 */

/* p01 封面：右边出血的浅蓝底板上一扇「课件」窗口和一扇倾斜的浮窗，左边两行大字 */
Deck.add({
  id: 'p01',
  chapter: '开场',
  scene: 'fangguo',
  title: 'li-talk-skills 教程',
  noTitle: true,
  html: `
    <i class="fg-bleed" hidden></i>
    <div class="abs fg-cover" data-beat="0" style="left:150px;top:220px;width:860px">
      <span class="fg-chip">li-talk-skills 教程</span>
      <h1 class="fg-hero p01-h">把想法交给 AI，<br>换回一份<span class="fg-red">网页课件</span></h1>
      <p class="fg-sub">像幻灯片一样一拍一拍地翻，双击就能离线打开</p>
    </div>
    <div class="abs fg-win" data-beat="0" data-recede="off" style="left:1100px;top:200px;width:700px">
      <div class="fg-win-hd"><i class="fg-ico fg-ico-s" data-fg-ico="doc"></i>我的分享 · index.html<span data-small>双击打开</span></div>
      <div class="fg-phs"><i class="fg-ph on"></i><i class="fg-ph"></i><i class="fg-ph"></i></div>
      <i class="fg-sk" style="width:78%;margin-top:18px"></i><i class="fg-sk" style="width:56%"></i>
      <div class="fg-phs"><i class="fg-ph"></i><i class="fg-ph"></i><i class="fg-ph"></i></div>
      <i class="fg-sk" style="width:38%;margin-bottom:30px"></i>
    </div>
    <div class="abs fg-win fg-float" data-beat="0" data-recede="off" style="left:1000px;top:640px;width:470px">
      <div class="fg-float-b"><i class="fg-ico" data-fg-ico="users" data-fg-tone="teal"></i><p data-small><b>演讲者视图</b>讲词、计时、彩排</p></div>
    </div>
    <p class="abs fg-who" data-beat="1" style="left:150px;top:880px"><span>适合 <b>分享 · 培训 · 汇报 · 演讲</b></span></p>
    <div class="abs fg-fold" data-beat="1" data-recede="off" data-mascot="1" data-mascot-side="stay" data-mascot-pose="happy" style="left:1500px;top:140px">每种风格一个形象</div>
    <div class="mascot guide" style="left:1580px;top:840px"></div>`,
  notes: [
    { beat: 0, key: '网页课件', say: '欢迎使用 li-talk-skills。它做的事很简单：你把想法交给 AI，换回一份网页课件。' },
    { beat: 1, say: '做技术分享、培训、汇报、演讲都合适。下面花几分钟，带你从安装到讲完走一遍。' },
  ],
});

/* p02 它能做什么、不适合什么：三张功能卡依次出现，最后一条「不适合」 */
Deck.add({
  id: 'p02',
  chapter: '一、认识它',
  chapterShort: '认识它',
  topic: '能做什么',
  scene: 'fangguo',
  title: '它能做什么，不适合什么',
  html: `
    <div class="abs fg-feats" style="left:120px;top:270px;width:1680px">
      <div class="fg-fc" data-beat="1"><i class="fg-ico" data-fg-ico="layers"></i><h4>一拍一拍地翻</h4><p>按一下出一块，讲过的变淡</p></div>
      <div class="fg-fc" data-beat="2"><i class="fg-ico" data-fg-ico="doc" data-fg-tone="teal"></i><h4>双击就能打开</h4><p>一个文件夹，离线也能放</p></div>
      <div class="fg-fc" data-beat="3"><i class="fg-ico" data-fg-ico="users" data-fg-tone="purple"></i><h4>演讲者视图</h4><p>另开窗口看讲词和计时</p></div>
    </div>
    <div class="abs fg-plat p02-no" data-beat="4" data-mascot="4" data-mascot-side="right" data-mascot-pose="ok" style="left:120px;top:690px"><span data-small>不适合</span><b>导出 pptx</b><b>导出 pdf</b><b>纯文档</b><b>数据看板</b></div>
    <div class="mascot guide" data-pose="point" style="left:1660px;top:96px"></div>`,
  notes: [
    { beat: 0, say: '先说它能做什么。' },
    { beat: 1, key: '一拍一拍', say: '课件像幻灯片一样，一拍一拍地翻：按一下出一块，讲过的自动变淡，听众的注意力跟着你走。' },
    { beat: 2, key: '双击', say: '课件就是一个文件夹，双击 index.html 就能打开，断网也能放。' },
    { beat: 3, key: '演讲者视图', say: '讲的时候可以另开一个演讲者视图，看讲词、计时，正式讲之前还能彩排。' },
    { beat: 4, key: '不适合', say: '它不做的事也说清楚：不导出 pptx 和 pdf，也不适合做纯文档和数据看板。' },
  ],
});

/* p03 能用在哪：平台汇聚，中间是 li-talk-skills，三个 AI 编程工具一拍连上一个 */
Deck.add({
  id: 'p03',
  chapter: '一、认识它',
  chapterShort: '认识它',
  topic: '用在哪',
  scene: 'fangguo',
  title: 'Claude Code、Codex、Cursor 都能用',
  html: `
    <div class="abs p03-l" data-beat="0" style="left:120px;top:320px;width:640px">
      <p class="p03-big">能跑命令、能读写本地文件的 AI 编程工具，都能用</p>
      <p class="p03-sm">网页版的聊天框用不了：它没法在你的电脑上建文件、开浏览器</p>
    </div>
    <div class="abs fg-hub" data-fg-core="li-talk-skills" data-fg-rx="34" data-fg-ry="36" style="left:860px;top:240px;width:940px;height:720px">
      <b class="fg-plt" data-beat="1" data-mascot="1" data-mascot-side="stay" data-mascot-pose="point">Claude Code</b>
      <b class="fg-plt" data-beat="2">Codex</b>
      <b class="fg-plt" data-beat="3">Cursor</b>
    </div>
    <div class="mascot guide" style="left:460px;top:780px"></div>`,
  notes: [
    { beat: 0, say: '它是一个给 AI 编程工具用的 skill，能跑命令、能读写本地文件的都能用；网页版的聊天框用不了。' },
    { beat: 1, key: 'Claude Code', say: '比如 Claude Code。' },
    { beat: 2, key: 'Codex', say: 'Codex。' },
    { beat: 3, key: 'Cursor', say: '还有 Cursor，都可以。' },
  ],
});

/* p04 安装：三步流程，第二步是一行可以点击复制的安装命令 */
Deck.add({
  id: 'p04',
  chapter: '二、装好它',
  chapterShort: '安装',
  topic: '一行命令',
  scene: 'fangguo',
  title: '装好它：一行命令',
  html: `
    <div class="abs fg-flow p04-flow" style="left:120px;top:260px;width:1680px">
      <div class="fg-step"><div><h4>准备 Node 18 以上</h4><p data-beat="1">在终端里运行 <span class="fg-code">node -v</span> 看一眼版本</p></div></div>
      <div class="fg-step" data-mascot="2" data-mascot-side="stay" data-mascot-pose="idea"><div><h4>运行安装命令</h4><div class="p04-cmd" data-beat="2">
        <button class="copy" type="button" data-copy="npx skills add xiaoli1999/li-talk-skills -g -a claude-code -y">npx skills add xiaoli1999/li-talk-skills -g -a claude-code -y</button>
        <p>用 Codex 就把 claude-code 换成 codex，用 Cursor 换成 cursor</p></div></div></div>
      <div class="fg-step"><div><h4>新开一个对话</h4><p data-beat="3">新装的 skill 要在新对话里才会加载</p></div></div>
    </div>
    <div class="mascot guide" style="left:1660px;top:96px"></div>`,
  notes: [
    { beat: 0, say: '安装只要三步。' },
    { beat: 1, key: 'Node 18', say: '第一步，确认电脑上有 Node 18 以上，在终端里运行 node -v 看一眼。' },
    { beat: 2, key: '安装命令', say: '第二步，运行这行安装命令，点一下就能复制。用 Codex 或 Cursor 的话，把 claude-code 换成 codex 或 cursor。' },
    { beat: 3, key: '新开', say: '第三步，新开一个对话，新装的 skill 才会加载。' },
  ],
});

/* p05 一句话安装：一扇聊天窗，你说一句，AI 回一句；你说的那句点一下就能复制 */
Deck.add({
  id: 'p05',
  chapter: '二、装好它',
  chapterShort: '安装',
  topic: '一句话',
  scene: 'fangguo',
  title: '不想敲命令？对 AI 说一句话',
  html: `
    <div class="abs fg-win" data-beat="0" data-recede="off" style="left:120px;top:250px;width:1160px">
      <div class="fg-win-hd"><i class="fg-ico fg-ico-s" data-fg-ico="bulb"></i>和 AI 的对话<span data-small>点一下你说的那句，复制</span></div>
      <div class="fg-chat">
        <p class="fg-msg me" data-beat="1" data-copy="从 GitHub 仓库 xiaoli1999/li-talk-skills 安装到全局，装好后打开新手教程带我过一遍">从 GitHub 仓库 xiaoli1999/li-talk-skills 安装到全局，装好后打开新手教程带我过一遍</p>
        <p class="fg-msg ai" data-beat="2" data-mascot="2" data-mascot-side="stay" data-mascot-pose="ok">好的，已经装到全局。新开一个对话后就能用，到时我打开新手教程带你过一遍。</p>
      </div>
    </div>
    <div class="abs p05-notes" data-beat="0" style="left:1340px;top:280px;width:460px">
      <p><b>只装到全局</b>不装进某个项目，在哪个目录都能用</p>
      <p><b>装好后新开对话</b>新装的 skill 才会加载</p>
    </div>
    <div class="mascot guide" style="left:1660px;top:820px"></div>`,
  notes: [
    { beat: 0, say: '不想敲命令也行，直接对 AI 说一句话。' },
    { beat: 1, key: '安装到全局', say: '就说：从 GitHub 仓库 xiaoli1999/li-talk-skills 安装到全局，装好后打开新手教程带我过一遍。' },
    { beat: 2, key: '新开一个对话', say: 'AI 会帮你装好。同样记得新开一个对话。' },
  ],
});

/* p06 第一次用：AI 先问要不要看新手教程（编号选项），你回一个数字，AI 打开教程 */
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
    { beat: 0, key: '课件', say: '怎么开始？就一句话：用 li-talk-skills 帮我做一个关于什么什么的课件。' },
    { beat: 1, say: '在任意目录对 AI 说就行。' },
    { beat: 2, say: '这句话点一下就能复制，把省略号换成你的主题。' },
  ],
});

/* p08 三种起点：编辑式网格，一拍点亮一种 */
Deck.add({
  id: 'p08',
  chapter: '三、做一份课件',
  chapterShort: '做课件',
  topic: '三种起点',
  scene: 'fangguo',
  title: 'AI 会先问：你手上有什么',
  html: `
    <div class="abs fg-values p08-v" style="left:120px;top:300px;width:1680px">
      <div class="fg-val"><i></i><b>只有一个主题</b><p data-beat="1">一问一答：讲给谁、讲多久、在哪讲，再起一份提纲</p></div>
      <div class="fg-val"><i></i><b>有笔记、截图</b><p data-beat="2">放进课件目录的 <span class="fg-code">素材/</span>，AI 整理成提纲</p></div>
      <div class="fg-val" data-mascot="3" data-mascot-side="stay" data-mascot-pose="think"><i></i><b>已经有讲稿</b><p data-beat="3">AI 整理成标准格式，补上缺的段落</p></div>
    </div>
    <div class="mascot guide" style="left:1660px;top:96px"></div>`,
  notes: [
    { beat: 0, say: '说完这句话，AI 会先问你手上有什么，从三种起点出发。' },
    { beat: 1, key: '只有一个主题', say: '只有一个主题：AI 一问一答，问清楚讲给谁、讲多久、在什么场合讲，再起一份提纲给你改。' },
    { beat: 2, key: '素材', say: '有想法、笔记、截图：放进课件目录的素材文件夹，AI 列出清单、整理成提纲，只问缺的部分。' },
    { beat: 3, key: '讲稿', say: '已经有讲稿：AI 把它整理成标准格式，补上缺的段落，给你确认。' },
  ],
});
