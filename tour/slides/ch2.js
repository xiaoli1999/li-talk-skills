/* li-talk-skills 教程 · 第二部分：九步流程、接着做、选风格（两页图墙）、样册、形象、质量把关、「关于我」页（p09–p16）
   风格是水彩田园 watercolor：九步流程是招牌的「小路路牌」（一条乡间小路边立起五块木路牌），「关于我」页是「绘本跨页」（一幅画加一句旁白）。
   选风格那两页：每种风格一张真图（这种风格的招牌页），贴在一张张水彩纸上，点一下在新窗口打开样册看这种风格（../gallery.html?scene=键名，不进拍） */

/* p09 九步流程、五处停下：上面一排九步，五处停下的晕一块天空蓝；下面一条弯弯的土路从左下往右上去，
   路边立着五块箭头木牌（提纲 → 讲稿 → 风格 → 先做 3 页 → 过稿），一拍刷一段路、立起一块牌子，朵朵沿着路跑到牌子脚下。
   路和牌子的算法见 samples/watercolor.js 的小路路牌：柱子脚落在路的上沿，--post 是牌子底边到路上沿的长度 */
Deck.add({
  id: 'p09',
  chapter: '三、做一份课件',
  chapterShort: '做课件',
  topic: '九步流程',
  scene: 'watercolor',
  title: '九步流程，五处停下来等你点头',
  html: `
    <p class="abs p09-road" data-beat="0" style="left:120px;top:200px;width:1680px"><span class="p09-off">① 起点</span><span class="tag t-blue">② 提纲</span><span class="tag t-blue">③ 讲稿</span><span class="tag t-blue">④ 风格</span><span class="p09-off">⑤ 搭骨架</span><span class="tag t-blue">⑥ 先做 3 页</span><span class="p09-off">⑦ 写全稿</span><span class="tag t-blue">⑧ 过稿</span><span class="p09-off">⑨ 完成</span></p>
    <p class="abs p09-cap" data-beat="0" style="left:120px;top:286px">每处停下，你说「可以」，AI 才往下走：内容由你把关，样子它来做</p>
    <div class="wc-art abs" style="left:0;top:0;width:1920px;height:1080px">
      <svg class="wc-paint" viewBox="0 0 1920 1080" data-beat="0" style="--bx:12%;--by:85%" aria-hidden="true">
        <path class="grass" d="M-40 800C300 770 620 790 960 770C1300 752 1620 730 1960 744L1960 1100L-40 1100Z" style="--o:.24"/>
        <circle class="pink" cx="420" cy="960" r="9" style="--o:.6"/>
        <circle class="sun" cx="452" cy="982" r="8" style="--o:.7"/>
        <circle class="pink" cx="880" cy="900" r="8" style="--o:.6"/>
        <circle class="sun" cx="1220" cy="860" r="8" style="--o:.7"/>
        <circle class="pink" cx="1560" cy="830" r="9" style="--o:.55"/>
      </svg>
      <svg class="sketch" viewBox="0 0 1920 1080" aria-hidden="true">
        <g data-beat="0">
          <path d="M-40 800C300 770 620 790 960 770C1300 752 1620 730 1960 744"/>
          <path d="M396 988q4 -16 8 0q4 -18 8 0q4 -14 8 0M856 928q4 -14 8 0q4 -16 8 0M1196 888q4 -14 8 0q4 -16 8 0q4 -12 8 0M1536 858q4 -16 8 0q4 -14 8 0" data-roughness=".4" stroke-width="1.6"/>
        </g>
      </svg>
    </div>
    <svg class="wc-brush" aria-hidden="true">
      <path class="earth" data-beat="0" stroke-width="120" d="M40 1110C110 1010 190 935 280 900C340 880 400 872 450 866"/>
      <path class="earth" data-beat="1" stroke-width="100" d="M450 866C520 858 570 846 620 840C680 832 740 824 790 818"/>
      <path class="earth" data-beat="2" stroke-width="84" d="M790 818C850 812 900 804 960 800C1020 795 1080 788 1130 784"/>
      <path class="earth" data-beat="3" stroke-width="68" d="M1130 784C1190 780 1240 774 1300 770C1360 766 1420 760 1470 757"/>
      <path class="earth" data-beat="4" stroke-width="54" d="M1470 757C1530 753 1590 748 1640 745C1700 741 1750 738 1800 735"/>
    </svg>
    <div class="wc-sign abs p09-s" data-beat="0" data-mascot="0" data-mascot-side="bottom" data-mascot-x=".5" data-mascot-dx="20" data-mascot-dy="176" style="left:120px;top:420px;width:320px;--post:284px;--r:-1deg">
      <b><i class="wc-no">1</i>提纲</b><span>分几部分</span>
    </div>
    <div class="wc-sign abs p09-s" data-beat="1" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".5" data-mascot-dx="20" data-mascot-dy="144" style="left:460px;top:400px;width:320px;--post:254px;--r:.8deg">
      <b><i class="wc-no">2</i>讲稿</b><span>字、拍数、讲词</span>
    </div>
    <div class="wc-sign abs p09-s" data-beat="2" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".5" data-mascot-dx="20" data-mascot-dy="132" style="left:800px;top:380px;width:320px;--post:242px;--r:-.6deg">
      <b><i class="wc-no">3</i>风格</b><span>看样册，你来选</span>
    </div>
    <div class="wc-sign abs p09-s" data-beat="3" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".5" data-mascot-dx="20" data-mascot-dy="130" style="left:1140px;top:360px;width:320px;--post:240px;--r:.6deg">
      <b><i class="wc-no">4</i>先做 3 页</b><span>封面加两页</span>
    </div>
    <div class="wc-sign abs p09-s" data-beat="4" data-mascot="4" data-mascot-side="bottom" data-mascot-x=".5" data-mascot-dx="20" data-mascot-dy="132" data-mascot-pose="happy" style="left:1480px;top:340px;width:320px;--post:242px;--r:-.8deg">
      <b><i class="wc-no">5</i>过稿</b><span>整份看一遍</span>
    </div>
    <div class="mascot guide" style="left:300px;top:880px"></div>`,
  notes: [
    { beat: 0, key: '五处', say: '接下来 AI 一步步往下走，一共九步，其中五处停下来等你说可以。内容由你把关，样子它来做。第一处是提纲。' },
    { beat: 1, key: '讲稿', say: '第二处是讲稿：每页屏幕上的字、分几拍、照着讲的讲词。' },
    { beat: 2, key: '风格', say: '第三处是风格：AI 按内容推荐，并打开样册让你看，你说了算。' },
    { beat: 3, key: '先做 3 页', say: '第四处，先做三页：封面加两页最典型的内容，自检通过后给你看，满意了再写全稿。' },
    { beat: 4, key: '过稿', say: '最后一处是过稿：整份课件给你看，按你的意见改。' },
  ],
});

/* p10 换对话也能接着做：左边一句话说清楚，右边终端（水彩纸卡片，示意）里 AI 先跑 guide，一拍一行 */
Deck.add({
  id: 'p10',
  chapter: '三、做一份课件',
  chapterShort: '做课件',
  topic: '接着做',
  scene: 'watercolor',
  title: '换对话、换模型，也能接着做',
  html: `
    <div class="abs p10-l" data-beat="0" style="left:120px;top:300px;width:620px">
      <p class="p10-big">进度记在课件目录里</p>
      <p class="p10-sm">确认过哪些环节，都写在课件目录的文件里。AI 每次开工，都先跑一次 <span class="tag t-blue p10-code">guide</span> 看做到哪一步。</p>
    </div>
    <div class="abs term p10-term" data-title="终端" data-beat="0" data-recede="off" style="left:820px;top:290px;width:980px;--r:.5deg">
      <p class="in" data-beat="1">guide 我的分享</p>
      <p class="ok" data-beat="2">【现在在哪一步】⑥ 先做 3 页</p>
      <p class="hi" data-beat="3" data-mascot="3" data-mascot-side="stay">【下一步做什么】写封面和两页最典型的内容</p>
    </div>
    <p class="abs p-capt" data-beat="0" data-small style="left:820px;top:660px"><span class="tag">示意</span>换了对话，AI 先跑 guide，再接着往下做</p>
    <div class="mascot guide" style="left:1660px;top:820px"></div>`,
  notes: [
    { beat: 0, key: '课件目录', say: '中途换对话、换模型都不怕：进度记在课件目录里，AI 每次开工都先查一遍。' },
    { beat: 1, key: 'guide', say: '它先跑一次 guide。' },
    { beat: 2, say: 'guide 会告诉它现在在哪一步。' },
    { beat: 3, say: '下一步做什么也写得清清楚楚，接着往下做就行。' },
  ],
});

/* p11 选风格（一）：先看手绘风 8 种，一拍一排；这份教程用的就是第二排的水彩田园。
   风格家族按「手绘风 → 现代风 → 像素风 → 企业风」的顺序讲，企业风（方果）放最后、只给一张小图。
   每张图贴在一张水彩纸上，点一下新窗口打开样册看这种风格 */
Deck.add({
  id: 'p11',
  chapter: '三、做一份课件',
  chapterShort: '选风格',
  topic: '手绘风',
  scene: 'watercolor',
  title: '选风格：16 种，分四类',
  html: `
    <p class="abs p-cap" data-beat="0" style="left:120px;top:186px">点一张图，在新窗口打开样册看这种风格；按章换风格，只能在同一类里换</p>
    <div class="abs p-tw p11-row" data-beat="1" data-mascot="1" data-mascot-side="stay" data-mascot-pose="happy" style="left:120px;top:280px;width:1680px">
      <a class="p-ti wc-paper" href="../gallery.html?scene=paper" target="_blank" rel="noopener"><img src="素材/styles/paper.jpg" alt="方格纸"><b>方格纸</b><span data-small>手绘风</span></a>
      <a class="p-ti wc-paper" href="../gallery.html?scene=board" target="_blank" rel="noopener"><img src="素材/styles/board.jpg" alt="黑板"><b>黑板</b><span data-small>手绘风</span></a>
      <a class="p-ti wc-paper" href="../gallery.html?scene=journal" target="_blank" rel="noopener"><img src="素材/styles/journal.jpg" alt="像素手账"><b>像素手账</b><span data-small>手绘风</span></a>
      <a class="p-ti wc-paper" href="../gallery.html?scene=desk" target="_blank" rel="noopener"><img src="素材/styles/desk.jpg" alt="工位桌面"><b>工位桌面</b><span data-small>手绘风</span></a>
    </div>
    <div class="abs p-tw p11-row" data-beat="2" style="left:120px;top:620px;width:1680px">
      <a class="p-ti wc-paper" href="../gallery.html?scene=watercolor" target="_blank" rel="noopener"><img src="素材/styles/watercolor.jpg" alt="水彩田园"><b>水彩田园</b><span data-small>手绘风</span></a>
      <a class="p-ti wc-paper" href="../gallery.html?scene=ink" target="_blank" rel="noopener"><img src="素材/styles/ink.jpg" alt="水墨国风"><b>水墨国风</b><span data-small>手绘风</span></a>
      <a class="p-ti wc-paper" href="../gallery.html?scene=blueprint" target="_blank" rel="noopener"><img src="素材/styles/blueprint.jpg" alt="蓝图"><b>蓝图</b><span data-small>手绘风</span></a>
      <a class="p-ti wc-paper" href="../gallery.html?scene=comic" target="_blank" rel="noopener"><img src="素材/styles/comic.jpg" alt="漫画"><b>漫画</b><span data-small>手绘风</span></a>
    </div>
    <div class="mascot guide" style="left:1660px;top:100px"></div>`,
  notes: [
    { beat: 0, say: '到了选风格这一步。一共十六种，分四类：手绘风、现代风、像素风，另有企业风。每张图都是这种风格做出来的一页，点一下会在新窗口打开样册。' },
    { beat: 1, key: '方格纸', say: '先看手绘风，一共八种，字是楷书写的：方格纸、黑板、像素手账、工位桌面。' },
    { beat: 2, key: '水彩田园', say: '水彩田园、水墨国风、蓝图、漫画。这份教程用的就是水彩田园。按章换风格的话，只能在同一类里换。' },
  ],
});

/* p12 选风格（二）：左边现代风 6 种（三列两排），右边一列小图：像素风一张，最后是企业风（方果）一张，都只放小图 */
Deck.add({
  id: 'p12',
  chapter: '三、做一份课件',
  chapterShort: '选风格',
  topic: '现代风 · 像素风 · 企业风',
  scene: 'watercolor',
  title: '现代风、像素风，另有企业风',
  html: `
    <p class="abs p-cap" data-beat="0" style="left:120px;top:186px">同样点一张图，新窗口打开样册</p>
    <div class="abs p-tw p12-grid" data-beat="1" data-mascot="1" data-mascot-side="stay" data-mascot-pose="happy" style="left:120px;top:280px;width:1100px">
      <a class="p-ti wc-paper" href="../gallery.html?scene=dark" target="_blank" rel="noopener"><img src="素材/styles/dark.jpg" alt="科技暗黑"><b>科技暗黑</b><span data-small>现代风</span></a>
      <a class="p-ti wc-paper" href="../gallery.html?scene=frost" target="_blank" rel="noopener"><img src="素材/styles/frost.jpg" alt="毛玻璃"><b>毛玻璃</b><span data-small>现代风</span></a>
      <a class="p-ti wc-paper" href="../gallery.html?scene=glass" target="_blank" rel="noopener"><img src="素材/styles/glass.jpg" alt="液态玻璃"><b>液态玻璃</b><span data-small>现代风</span></a>
      <a class="p-ti wc-paper" href="../gallery.html?scene=flat" target="_blank" rel="noopener"><img src="素材/styles/flat.jpg" alt="扁平插画"><b>扁平插画</b><span data-small>现代风</span></a>
      <a class="p-ti wc-paper" href="../gallery.html?scene=magazine" target="_blank" rel="noopener"><img src="素材/styles/magazine.jpg" alt="杂志复古"><b>杂志复古</b><span data-small>现代风</span></a>
      <a class="p-ti wc-paper" href="../gallery.html?scene=brutal" target="_blank" rel="noopener"><img src="素材/styles/brutal.jpg" alt="新粗野主义"><b>新粗野主义</b><span data-small>现代风</span></a>
    </div>
    <div class="abs p-tw" data-beat="2" data-mascot="2" data-mascot-side="stay" style="left:1300px;top:280px;width:500px">
      <a class="p-ti p-row wc-paper" href="../gallery.html?scene=pixel" target="_blank" rel="noopener"><img src="素材/styles/pixel.jpg" alt="像素游戏"><span><b>像素游戏</b><span data-small>像素风 · 自成一套</span></span></a>
    </div>
    <div class="abs p-tw" data-beat="3" style="left:1300px;top:500px;width:500px">
      <a class="p-ti p-row wc-paper" href="../gallery.html?scene=fangguo" target="_blank" rel="noopener"><img src="素材/styles/fangguo.jpg" alt="方果"><span><b>方果</b><span data-small>企业风 · 公司品牌专属</span></span></a>
    </div>
    <div class="mascot guide" style="left:1660px;top:100px"></div>`,
  notes: [
    { beat: 0, say: '再看另外三类。' },
    { beat: 1, key: '现代风', say: '现代风有六种：科技暗黑、毛玻璃、液态玻璃、扁平插画、杂志复古、新粗野主义。' },
    { beat: 2, key: '像素风', say: '像素游戏自成一套，是像素风。' },
    { beat: 3, key: '企业风', say: '另有一种企业风，方果，是公司品牌专属的风格。AI 会按你的内容推荐，选哪个你说了算。' },
  ],
});

/* p13 样册（真图）：左边一张样册首页的真图，右边三张水彩纸便签一拍一张（编号是一滴天空蓝颜料） */
Deck.add({
  id: 'p13',
  chapter: '三、做一份课件',
  chapterShort: '做课件',
  topic: '样册',
  scene: 'watercolor',
  title: '样册：全部风格一屏看完',
  html: `
    <figure class="abs shot" data-beat="0" data-src="素材/hero.jpg" data-caption="真图：样册首页，点一张卡片就从第一页看" style="left:120px;top:300px;width:900px;--ar:16/9;--r:-.8deg"></figure>
    <div class="wc-paper abs p13-n" data-beat="1" data-mascot="1" data-mascot-side="left" style="left:1260px;top:260px;width:540px;--r:-1deg"><h3><i class="wc-no">1</i>点一张卡片</h3><p>从第一页看这种风格的样板</p></div>
    <div class="wc-paper abs p13-n" data-beat="2" style="left:1260px;top:500px;width:540px;--r:.8deg"><h3><i class="wc-no">2</i>左下角的小条</h3><p>随时换一种风格看</p></div>
    <div class="wc-paper abs p13-n" data-beat="3" data-mascot="3" data-mascot-side="left" data-mascot-pose="happy" style="left:1260px;top:740px;width:540px;--r:-.6deg"><h3><i class="wc-no">3</i>想再看</h3><p>对 AI 说「打开样册」</p></div>
    <div class="mascot guide" style="left:1660px;top:100px"></div>`,
  notes: [
    { beat: 0, say: '到选风格这一步，AI 会自动在浏览器里打开样册，首页一屏放下全部风格。' },
    { beat: 1, key: '卡片', say: '点一张卡片，就从第一页看这种风格的样板。' },
    { beat: 2, key: '小条', say: '左下角有个小条，随时换一种风格看，点全部风格回到首页。' },
    { beat: 3, key: '打开样册', say: '关掉了也没关系，对 AI 说打开样册就行。' },
  ],
});

/* p14 形象：左边四块水彩底的条一拍一条，朵朵走到这一条旁边、换一个动作；右边一张真图 */
Deck.add({
  id: 'p14',
  chapter: '三、做一份课件',
  chapterShort: '做课件',
  topic: '形象',
  scene: 'watercolor',
  title: '每种风格，都有一个小形象',
  html: `
    <div class="abs p14-list" style="left:120px;top:270px;width:900px">
      <div class="card t-blue p14-r" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="point" style="--r:-.6deg"><b>会走过去</b><span>走到正在讲的内容旁边</span></div>
      <div class="card t-yellow p14-r" data-beat="2" data-mascot="2" data-mascot-side="right" data-mascot-pose="happy" style="--r:.5deg"><b>会换动作</b><span>指一指、惊讶一下、点个赞</span></div>
      <div class="card t-peach p14-r" data-beat="3" data-mascot="3" data-mascot-side="right" data-mascot-pose="happy" style="--r:-.4deg"><b>会和你玩</b><span>鼠标移上去会开心，点它会蹦一下</span></div>
      <div class="card t-mint p14-r" data-beat="4" data-mascot="4" data-mascot-side="right" data-mascot-pose="rest" style="--r:.6deg"><b>会打个盹</b><span>很久没人操作，它就睡一会儿</span></div>
    </div>
    <figure class="abs shot" data-beat="0" data-src="素材/styles/flat.jpg" data-caption="真图：扁平插画风格的一页和它的形象" style="left:1180px;top:300px;width:620px;--r:1deg"></figure>
    <div class="mascot guide" style="left:1500px;top:820px"></div>`,
  notes: [
    { beat: 0, say: '每种风格都有一个小形象。这份教程里的是朵朵，一朵圆滚滚的水彩小云。' },
    { beat: 1, key: '走过去', say: '讲到哪，它就走到哪块内容旁边。' },
    { beat: 2, key: '换动作', say: '它会换动作，指一指、惊讶一下、点个赞。' },
    { beat: 3, key: '玩', say: '鼠标移上去它会开心，点它会蹦一下，点它不会翻页。' },
    { beat: 4, key: '打个盹', say: '很久没人操作，它就打个盹。' },
  ],
});

/* p15 质量把关：左边三步（序号是一滴天空蓝颜料）一拍一步，右边一份自检报告（水彩纸终端，示意）同步出一行 */
Deck.add({
  id: 'p15',
  chapter: '三、做一份课件',
  chapterShort: '做课件',
  topic: '质量把关',
  scene: 'watercolor',
  title: '写完先检查，错误清零才给你看',
  html: `
    <ol class="abs steps p15-flow" style="left:120px;top:270px;width:780px;--gap:40px">
      <li><b>不开浏览器的检查</b><span data-beat="1">几秒查完写法错误、拍数对不上</span></li>
      <li><b>后台浏览器自检</b><span data-beat="2">五个尺寸逐页逐拍量：溢出、重叠、字太小</span></li>
      <li data-mascot="3" data-mascot-side="bottom" data-mascot-x=".3" data-mascot-pose="happy"><b>错误清零才给你看</b><span data-beat="3">有错 AI 自己照报告改</span></li>
    </ol>
    <div class="abs term p15-term" data-title="自检报告" data-beat="0" data-recede="off" style="left:1000px;top:290px;width:800px;--r:.5deg">
      <p class="in">check 我的分享 --browser</p>
      <p class="dim" data-beat="1">检查：12 页，0 个错误</p>
      <p class="dim" data-beat="2">5 个尺寸逐页逐拍量完</p>
      <p class="ok" data-beat="3">没有发现问题。</p>
    </div>
    <p class="abs p-capt" data-beat="0" data-small style="left:1000px;top:660px"><span class="tag">示意</span>AI 写完一批，先跑检查</p>
    <div class="mascot guide" style="left:1660px;top:820px"></div>`,
  notes: [
    { beat: 0, say: '页面是 AI 写的，写完怎么知道效果对不对？靠两种检查。' },
    { beat: 1, key: '不开浏览器', say: '第一种不开浏览器，几秒查完写法错误、讲词和拍数对不上这类问题。' },
    { beat: 2, key: '后台浏览器', say: '第二种在后台用浏览器打开课件，按五个尺寸逐页逐拍量一遍。' },
    { beat: 3, key: '错误清零', say: '有错误 AI 自己照报告改，清零了才给你看。' },
  ],
});

/* p16 「关于我」页（绘本跨页）：上面一幅大插画——草坡上立着一个画架，画布上是一张小小的自画像；
   下面一行绘本旁白就是那句愿景；第 1 拍出「小黎的愿景」一行，第 2 拍一块水彩小标签写方果的说法 */
Deck.add({
  id: 'p16',
  chapter: '三、做一份课件',
  chapterShort: '做课件',
  topic: '「关于我」页',
  scene: 'watercolor',
  title: '分享知识的最后，也分享一下你自己',
  noTitle: true,
  html: `
    <div class="wc-art wc-book abs" style="left:120px;top:110px;width:1680px;height:560px">
      <svg class="wc-paint" viewBox="0 0 1680 560" data-beat="0" style="--bx:50%;--by:45%" aria-hidden="true">
        <path class="sky" d="M0 30C320 0 700 26 1020 14C1320 4 1560 24 1680 40L1680 360C1300 380 760 352 0 400Z" style="--o:.22"/>
        <circle class="sun" cx="1420" cy="110" r="60" style="--o:.5"/>
        <path class="grass" d="M-10 412C260 372 540 352 820 372C1100 392 1380 358 1690 322L1690 570L-10 570Z" style="--o:.34"/>
        <path class="leaf" d="M-10 512C300 490 620 506 900 498C1200 490 1460 470 1690 456L1690 570L-10 570Z" style="--o:.12"/>
        <ellipse class="shade" cx="846" cy="476" rx="150" ry="14" style="--o:.18"/>
        <path class="wood st" d="M836 150L832 170M789 386L772 470M856 150L860 170M903 386L920 470M846 150L846 170M846 386L846 480" style="--w:9;--o:.55"/>
        <rect class="white" x="720" y="170" width="252" height="210" style="--o:.95"/>
        <rect class="sky" x="736" y="186" width="220" height="178" style="--o:.18"/>
        <circle class="peach" cx="846" cy="252" r="38" style="--o:.6"/>
        <path class="sky-d" d="M776 364C784 318 812 298 846 298C880 298 908 318 916 364Z" style="--o:.4"/>
        <path class="wood st" d="M708 386L984 386" style="--w:10;--o:.55"/>
        <circle class="pink" cx="420" cy="440" r="9" style="--o:.6"/>
        <circle class="sun" cx="462" cy="462" r="8" style="--o:.7"/>
        <circle class="pink" cx="1240" cy="420" r="9" style="--o:.6"/>
        <circle class="sun" cx="1288" cy="444" r="8" style="--o:.7"/>
        <circle class="pink" cx="260" cy="500" r="8" style="--o:.55"/>
      </svg>
      <svg class="sketch" viewBox="0 0 1680 560" aria-hidden="true">
        <g data-beat="0">
          <path d="M0 412C260 372 540 352 820 372C1100 392 1380 358 1680 322"/>
          <path d="M836 150L832 170M789 386L772 470M856 150L860 170M903 386L920 470M846 150L846 170M846 386L846 480"/>
          <rect x="720" y="170" width="252" height="210"/>
          <rect x="736" y="186" width="220" height="178" data-roughness=".5" stroke-width="1.5"/>
          <circle cx="846" cy="252" r="38"/>
          <path d="M832 248q4 -4 8 0M852 248q4 -4 8 0M834 266q12 8 24 0" data-roughness=".4" stroke-width="1.6"/>
          <path d="M776 364C784 318 812 298 846 298C880 298 908 318 916 364"/>
          <path d="M708 386L984 386"/>
          <path d="M396 448q4 -16 8 0q4 -18 8 0q4 -14 8 0M1216 428q4 -14 8 0q4 -16 8 0M236 508q4 -16 8 0q4 -14 8 0M1500 380q4 -14 8 0q4 -16 8 0" data-roughness=".4" stroke-width="1.6"/>
        </g>
      </svg>
    </div>
    <p class="wc-tale abs p16-q" data-beat="0" style="left:120px;top:690px;width:1680px">在分享知识和经验的最后，也<em class="key">分享一下你自己</em></p>
    <p class="abs p16-by" data-beat="1" data-mascot="1" data-mascot-side="stay" data-mascot-pose="happy" style="left:120px;top:806px;width:1680px">小黎的愿景 · 过稿前，AI 会问你要不要加一页「关于我」</p>
    <p class="abs p16-note" data-beat="2" style="left:120px;top:890px;width:1680px"><span class="tag t-blue">用方果风格时，问的是「关于我们」</span></p>
    <div class="mascot guide" style="left:1100px;top:430px"></div>`,
  notes: [
    { beat: 0, key: '分享一下你自己', say: '过稿之前，AI 会转告一句话：小黎的愿景，希望你在分享知识和经验的最后，也分享一下你自己。' },
    { beat: 1, key: '关于我', say: '然后问你要不要在结尾前加一页关于我，让听众认识讲这堂课的人。' },
    { beat: 2, key: '关于我们', say: '用方果风格时，问的是要不要加一页关于我们。' },
  ],
});
