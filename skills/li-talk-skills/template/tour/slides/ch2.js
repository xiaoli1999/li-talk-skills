/* li-talk-skills 教程 · 第二部分：九步流程、接着做、选风格（两页图墙）、样册、形象、质量把关、「关于我」页（p09–p16）
   选风格那两页：每种风格一张真图（这种风格的招牌页），点一下在新窗口打开样册看这种风格（../gallery.html?scene=键名，不进拍） */

/* p09 九步流程、五处停下：上面一排九步，五处停下的点成蓝色；下面一条流水线，一拍走到下一处停下 */
Deck.add({
  id: 'p09',
  chapter: '三、做一份课件',
  chapterShort: '做课件',
  topic: '九步流程',
  scene: 'fangguo',
  title: '九步流程，五处停下来等你点头',
  html: `
    <p class="abs p09-road" data-beat="0" style="left:120px;top:210px;width:1680px"><span>① 起点</span><span class="on">② 提纲</span><span class="on">③ 讲稿</span><span class="on">④ 风格</span><span>⑤ 搭骨架</span><span class="on">⑥ 先做 3 页</span><span>⑦ 写全稿</span><span class="on">⑧ 过稿</span><span>⑨ 完成</span></p>
    <div class="abs fg-pipe" style="left:120px;top:360px;width:1680px">
      <div class="fg-st"><i class="fg-ico" data-fg-ico="doc"></i><b>提纲</b><p data-beat="0" data-small>分几部分</p></div>
      <div class="fg-st" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".32" data-mascot-pose="point"><i class="fg-ico" data-fg-ico="layers" data-fg-tone="teal"></i><b>讲稿</b><p data-beat="1" data-small>字、拍数、讲词</p></div>
      <div class="fg-st" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".32"><i class="fg-ico" data-fg-ico="img" data-fg-tone="purple"></i><b>风格</b><p data-beat="2" data-small>看样册，你来选</p></div>
      <div class="fg-st" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".32"><i class="fg-ico" data-fg-ico="bolt" data-fg-tone="amber"></i><b>先做 3 页</b><p data-beat="3" data-small>封面加两页</p></div>
      <div class="fg-st" data-mascot="4" data-mascot-side="bottom" data-mascot-x=".32" data-mascot-pose="ok"><i class="fg-ico" data-fg-ico="check" data-fg-tone="coral"></i><b>过稿</b><p data-beat="4" data-small>整份看一遍</p></div>
    </div>
    <p class="abs fg-cap" data-beat="0" style="left:120px;top:800px">每处停下，你说「可以」，AI 才往下走：内容由你把关，样子它来做</p>
    <div class="mascot guide" style="left:1660px;top:820px"></div>`,
  notes: [
    { beat: 0, key: '五处', say: '接下来 AI 一步步往下走，一共九步，其中五处停下来等你说可以。内容由你把关，样子它来做。第一处是提纲。' },
    { beat: 1, key: '讲稿', say: '第二处是讲稿：每页屏幕上的字、分几拍、照着讲的讲词。' },
    { beat: 2, key: '风格', say: '第三处是风格：AI 按内容推荐，并打开样册让你看，你说了算。' },
    { beat: 3, key: '先做 3 页', say: '第四处，先做三页：封面加两页最典型的内容，自检通过后给你看，满意了再写全稿。' },
    { beat: 4, key: '过稿', say: '最后一处是过稿：整份课件给你看，按你的意见改。' },
  ],
});

/* p10 换对话也能接着做：左边一句话说清楚，右边终端（拟态示意）里 AI 先跑 guide，一拍一行 */
Deck.add({
  id: 'p10',
  chapter: '三、做一份课件',
  chapterShort: '做课件',
  topic: '接着做',
  scene: 'fangguo',
  title: '换对话、换模型，也能接着做',
  html: `
    <div class="abs p10-l" data-beat="0" style="left:120px;top:300px;width:620px">
      <p class="p10-big">进度记在课件目录里</p>
      <p class="p10-sm">确认过哪些环节，都写在课件目录的文件里。AI 每次开工，都先跑一次 <span class="fg-code">guide</span> 看做到哪一步。</p>
    </div>
    <div class="abs term p10-term" data-title="终端" data-beat="0" data-recede="off" style="left:820px;top:290px;width:980px">
      <p class="in" data-beat="1">guide 我的分享</p>
      <p class="ok" data-beat="2">【现在在哪一步】⑥ 先做 3 页</p>
      <p class="hi" data-beat="3" data-mascot="3" data-mascot-side="stay" data-mascot-pose="think">【下一步做什么】写封面和两页最典型的内容</p>
    </div>
    <span class="abs fg-stamp" data-beat="0" style="left:1740px;top:268px">示意</span>
    <p class="abs fg-capt" data-beat="0" style="left:820px;top:640px"><b>示意</b>换了对话，AI 先跑 guide，再接着往下做</p>
    <div class="mascot guide" style="left:1660px;top:820px"></div>`,
  notes: [
    { beat: 0, key: '课件目录', say: '中途换对话、换模型都不怕：进度记在课件目录里，AI 每次开工都先查一遍。' },
    { beat: 1, key: 'guide', say: '它先跑一次 guide。' },
    { beat: 2, say: 'guide 会告诉它现在在哪一步。' },
    { beat: 3, say: '下一步做什么也写得清清楚楚，接着往下做就行。' },
  ],
});

/* p11 选风格（一）：企业风、现代风、像素风。每张图点一下，新窗口打开样册看这种风格 */
Deck.add({
  id: 'p11',
  chapter: '三、做一份课件',
  chapterShort: '选风格',
  topic: '企业风 · 现代风 · 像素风',
  scene: 'fangguo',
  title: '选风格：16 种，分四类',
  html: `
    <p class="abs fg-cap" data-beat="0" style="left:120px;top:186px">点一张图，在新窗口打开样册看这种风格；按章换风格，只能在同一类里换</p>
    <div class="abs p-tw p11-big" data-beat="1" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".1" data-mascot-pose="point" style="left:120px;top:290px;width:640px">
      <a class="p-ti" href="../gallery.html?scene=fangguo" target="_blank" rel="noopener"><img src="素材/styles/fangguo.jpg" alt="方果"><b>方果</b><span data-small>企业风 · 公司品牌专属</span></a>
    </div>
    <div class="abs p-tw p11-grid" data-beat="2" data-mascot="2" data-mascot-side="stay" data-mascot-pose="wow" style="left:840px;top:290px;width:960px">
      <a class="p-ti" href="../gallery.html?scene=dark" target="_blank" rel="noopener"><img src="素材/styles/dark.jpg" alt="科技暗黑"><b>科技暗黑</b><span data-small>现代风</span></a>
      <a class="p-ti" href="../gallery.html?scene=frost" target="_blank" rel="noopener"><img src="素材/styles/frost.jpg" alt="毛玻璃"><b>毛玻璃</b><span data-small>现代风</span></a>
      <a class="p-ti" href="../gallery.html?scene=glass" target="_blank" rel="noopener"><img src="素材/styles/glass.jpg" alt="液态玻璃"><b>液态玻璃</b><span data-small>现代风</span></a>
      <a class="p-ti" href="../gallery.html?scene=flat" target="_blank" rel="noopener"><img src="素材/styles/flat.jpg" alt="扁平插画"><b>扁平插画</b><span data-small>现代风</span></a>
      <a class="p-ti" href="../gallery.html?scene=magazine" target="_blank" rel="noopener"><img src="素材/styles/magazine.jpg" alt="杂志复古"><b>杂志复古</b><span data-small>现代风</span></a>
      <a class="p-ti" href="../gallery.html?scene=brutal" target="_blank" rel="noopener"><img src="素材/styles/brutal.jpg" alt="新粗野主义"><b>新粗野主义</b><span data-small>现代风</span></a>
    </div>
    <div class="abs p-tw p11-px" data-beat="3" style="left:120px;top:800px;width:640px">
      <a class="p-ti p-row" href="../gallery.html?scene=pixel" target="_blank" rel="noopener"><img src="素材/styles/pixel.jpg" alt="像素游戏"><span><b>像素游戏</b><span data-small>像素风 · 自成一套</span></span></a>
    </div>
    <div class="mascot guide" style="left:1660px;top:96px"></div>`,
  notes: [
    { beat: 0, say: '到了选风格这一步。一共十六种，分四类。每张图都是这种风格做出来的一页，点一下会在新窗口打开样册。' },
    { beat: 1, key: '企业风', say: '企业风现在有一种，方果，就是这份教程用的风格。' },
    { beat: 2, key: '现代风', say: '现代风有六种：科技暗黑、毛玻璃、液态玻璃、扁平插画、杂志复古、新粗野主义。' },
    { beat: 3, key: '像素风', say: '还有一种像素游戏，自成一套。按章换风格的话，只能在同一类里换。' },
  ],
});

/* p12 选风格（二）：手绘风 8 种，一拍一排 */
Deck.add({
  id: 'p12',
  chapter: '三、做一份课件',
  chapterShort: '选风格',
  topic: '手绘风',
  scene: 'fangguo',
  title: '手绘风：8 种，楷书写的',
  html: `
    <p class="abs fg-cap" data-beat="0" style="left:120px;top:186px">同样点一张图，新窗口打开样册</p>
    <div class="abs p-tw p12-row" data-beat="1" data-mascot="1" data-mascot-side="stay" data-mascot-pose="happy" style="left:120px;top:280px;width:1680px">
      <a class="p-ti" href="../gallery.html?scene=paper" target="_blank" rel="noopener"><img src="素材/styles/paper.jpg" alt="方格纸"><b>方格纸</b><span data-small>手绘风</span></a>
      <a class="p-ti" href="../gallery.html?scene=board" target="_blank" rel="noopener"><img src="素材/styles/board.jpg" alt="黑板"><b>黑板</b><span data-small>手绘风</span></a>
      <a class="p-ti" href="../gallery.html?scene=journal" target="_blank" rel="noopener"><img src="素材/styles/journal.jpg" alt="像素手账"><b>像素手账</b><span data-small>手绘风</span></a>
      <a class="p-ti" href="../gallery.html?scene=desk" target="_blank" rel="noopener"><img src="素材/styles/desk.jpg" alt="工位桌面"><b>工位桌面</b><span data-small>手绘风</span></a>
    </div>
    <div class="abs p-tw p12-row" data-beat="2" style="left:120px;top:620px;width:1680px">
      <a class="p-ti" href="../gallery.html?scene=watercolor" target="_blank" rel="noopener"><img src="素材/styles/watercolor.jpg" alt="水彩田园"><b>水彩田园</b><span data-small>手绘风</span></a>
      <a class="p-ti" href="../gallery.html?scene=ink" target="_blank" rel="noopener"><img src="素材/styles/ink.jpg" alt="水墨国风"><b>水墨国风</b><span data-small>手绘风</span></a>
      <a class="p-ti" href="../gallery.html?scene=blueprint" target="_blank" rel="noopener"><img src="素材/styles/blueprint.jpg" alt="蓝图"><b>蓝图</b><span data-small>手绘风</span></a>
      <a class="p-ti" href="../gallery.html?scene=comic" target="_blank" rel="noopener"><img src="素材/styles/comic.jpg" alt="漫画"><b>漫画</b><span data-small>手绘风</span></a>
    </div>
    <div class="mascot guide" style="left:1660px;top:96px"></div>`,
  notes: [
    { beat: 0, say: '剩下八种是手绘风，字是楷书写的。' },
    { beat: 1, key: '方格纸', say: '方格纸、黑板、像素手账、工位桌面。' },
    { beat: 2, key: '水彩田园', say: '水彩田园、水墨国风、蓝图、漫画。AI 会按你的内容推荐，选哪个你说了算。' },
  ],
});

/* p13 样册（真图）：左边一张样册首页的真图，右边一拍一条怎么看 */
Deck.add({
  id: 'p13',
  chapter: '三、做一份课件',
  chapterShort: '做课件',
  topic: '样册',
  scene: 'fangguo',
  title: '样册：全部风格一屏看完',
  html: `
    <figure class="abs shot" data-beat="0" data-src="素材/hero.jpg" data-caption="真图：样册首页，点一张卡片就从第一页看" style="left:120px;top:250px;width:860px;--ar:2040/1620"></figure>
    <div class="abs card p13-n" data-beat="1" data-mascot="1" data-mascot-side="left" data-mascot-pose="point" style="left:1260px;top:260px;width:540px"><h3>点一张卡片</h3><p>从第一页看这种风格的样板</p></div>
    <div class="abs card p13-n" data-beat="2" style="left:1260px;top:500px;width:540px"><h3>左下角的小条</h3><p>随时换一种风格看</p></div>
    <div class="abs card p13-n" data-beat="3" data-mascot="3" data-mascot-side="left" data-mascot-pose="ok" style="left:1260px;top:740px;width:540px"><h3>想再看</h3><p>对 AI 说「打开样册」</p></div>
    <div class="mascot guide" style="left:1660px;top:96px"></div>`,
  notes: [
    { beat: 0, say: '到选风格这一步，AI 会自动在浏览器里打开样册，首页一屏放下全部风格。' },
    { beat: 1, key: '卡片', say: '点一张卡片，就从第一页看这种风格的样板。' },
    { beat: 2, key: '小条', say: '左下角有个小条，随时换一种风格看，点全部风格回到首页。' },
    { beat: 3, key: '打开样册', say: '关掉了也没关系，对 AI 说打开样册就行。' },
  ],
});

/* p14 形象：左边四条一拍一条，方小果走到这一条旁边、换一个动作；右边一张真图 */
Deck.add({
  id: 'p14',
  chapter: '三、做一份课件',
  chapterShort: '做课件',
  topic: '形象',
  scene: 'fangguo',
  title: '每种风格，都有一个小形象',
  html: `
    <div class="abs p14-list" style="left:120px;top:280px;width:900px">
      <p data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="point"><b>会走过去</b>走到正在讲的内容旁边</p>
      <p data-beat="2" data-mascot="2" data-mascot-side="right" data-mascot-pose="wow"><b>会换动作</b>指一指、惊讶一下、点个赞</p>
      <p data-beat="3" data-mascot="3" data-mascot-side="right" data-mascot-pose="happy"><b>会和你玩</b>鼠标移上去会开心，点它会蹦一下</p>
      <p data-beat="4" data-mascot="4" data-mascot-side="right" data-mascot-pose="rest"><b>会打个盹</b>很久没人操作，它就睡一会儿</p>
    </div>
    <figure class="abs shot" data-beat="0" data-src="素材/styles/flat.jpg" data-caption="真图：扁平插画风格的一页和它的形象" style="left:1180px;top:300px;width:620px"></figure>
    <div class="mascot guide" style="left:1500px;top:820px"></div>`,
  notes: [
    { beat: 0, say: '每种风格都有一个小形象。这份教程里的是方小果。' },
    { beat: 1, key: '走过去', say: '讲到哪，它就走到哪块内容旁边。' },
    { beat: 2, key: '换动作', say: '它会换动作，指一指、惊讶一下、点个赞。' },
    { beat: 3, key: '玩', say: '鼠标移上去它会开心，点它会蹦一下，点它不会翻页。' },
    { beat: 4, key: '打个盹', say: '很久没人操作，它就打个盹。' },
  ],
});

/* p15 质量把关：左边三步一拍一步，右边一份自检报告（拟态示意）同步出一行 */
Deck.add({
  id: 'p15',
  chapter: '三、做一份课件',
  chapterShort: '做课件',
  topic: '质量把关',
  scene: 'fangguo',
  title: '写完先检查，错误清零才给你看',
  html: `
    <div class="abs fg-flow p15-flow" style="left:120px;top:270px;width:760px">
      <div class="fg-step"><div><h4>不开浏览器的检查</h4><p data-beat="1">几秒查完写法错误、拍数对不上</p></div></div>
      <div class="fg-step"><div><h4>后台浏览器自检</h4><p data-beat="2">五个尺寸逐页逐拍量：溢出、重叠、字太小</p></div></div>
      <div class="fg-step" data-mascot="3" data-mascot-side="right" data-mascot-pose="ok"><div><h4>错误清零才给你看</h4><p data-beat="3">有错 AI 自己照报告改</p></div></div>
    </div>
    <div class="abs term p15-term" data-title="自检报告" data-beat="0" data-recede="off" style="left:1000px;top:290px;width:800px">
      <p class="in">check 我的分享 --browser</p>
      <p class="dim" data-beat="1">检查：12 页，0 个错误</p>
      <p class="dim" data-beat="2">5 个尺寸逐页逐拍量完</p>
      <p class="ok" data-beat="3">没有发现问题。</p>
    </div>
    <span class="abs fg-stamp" data-beat="0" style="left:1740px;top:268px">示意</span>
    <p class="abs fg-capt" data-beat="0" style="left:1360px;top:640px"><b>示意</b>AI 写完一批，先跑检查</p>
    <div class="mascot guide" style="left:1660px;top:820px"></div>`,
  notes: [
    { beat: 0, say: '页面是 AI 写的，写完怎么知道效果对不对？靠两种检查。' },
    { beat: 1, key: '不开浏览器', say: '第一种不开浏览器，几秒查完写法错误、讲词和拍数对不上这类问题。' },
    { beat: 2, key: '后台浏览器', say: '第二种在后台用浏览器打开课件，按五个尺寸逐页逐拍量一遍。' },
    { beat: 3, key: '错误清零', say: '有错误 AI 自己照报告改，清零了才给你看。' },
  ],
});

/* p16 「关于我」页（金句页）：过稿前 AI 转告的那句愿景 */
Deck.add({
  id: 'p16',
  chapter: '三、做一份课件',
  chapterShort: '做课件',
  topic: '「关于我」页',
  scene: 'fangguo',
  title: '分享知识的最后，也分享一下你自己',
  noTitle: true,
  html: `
    <i class="fg-bleed fg-wash" hidden></i>
    <p class="abs fg-quote p16-q" data-beat="0" style="left:150px;top:260px;white-space:nowrap">在分享知识和经验的最后，<br>也<span class="fg-hl">分享一下你自己</span></p>
    <p class="abs fg-quote-by" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="happy" style="left:154px;top:620px">小黎的愿景 · 过稿前，AI 会问你要不要加一页「关于我」</p>
    <p class="abs p16-note" data-beat="2" style="left:154px;top:730px"><span class="fg-chip">用方果风格时，问的是「关于我们」</span></p>
    <i class="abs fg-deco" style="left:1260px;top:220px;width:600px"></i>
    <div class="mascot guide" style="left:1500px;top:820px"></div>`,
  notes: [
    { beat: 0, key: '分享一下你自己', say: '过稿之前，AI 会转告一句话：小黎的愿景，希望你在分享知识和经验的最后，也分享一下你自己。' },
    { beat: 1, key: '关于我', say: '然后问你要不要在结尾前加一页关于我，让听众认识讲这堂课的人。' },
    { beat: 2, key: '关于我们', say: '用方果风格时，问的是要不要加一页关于我们。' },
  ],
});
