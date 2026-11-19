/* =====================================================================
   新手教程 · 第一章：认识它、怎么做（p01–p06）
   - 刚装好 skill 时，AI 用浏览器打开这份课件，带用户了解这个工具怎么用
   - 风格只用扁平插画 flat，版式照 template/samples/flat.js：插画封面、标签牌、数字大卡、竖排清单这些 .fl-* 组件；
     这份课件自己的零件（网页窗口、站点横条、屏幕尺寸）类名都用 tour- 开头，样子在 ch1.css
   - 可读性：插画只是包装，真话写在胶囊、标签牌、清单、大卡里；讲过的都留着，翻到每页最后一拍整页信息完整
   ===================================================================== */

/* 封面：左边「新手教程 / 3 分钟上手」逐字弹起，右边一块明黄大圆上立着一扇网页窗口（里面是一页小课件），
   三枚圆片徽标（箭头、勾、计时器）转着弹出。1 拍：胶囊贴上来，小页跑到胶囊右边 */
Deck.add({
  id: 'p01',
  chapter: '开场',
  scene: 'flat',
  title: 'li-talk-skills 新手教程',
  noTitle: true,
  html: `
    <i class="fl-blob t-yellow abs" data-beat="0" style="left:1060px;top:196px;width:700px"></i>
    <div class="tour-win abs" data-beat="0" aria-hidden="true" style="left:1150px;top:380px;width:520px">
      <div class="tour-mini"><i class="tour-bar a"></i><i class="tour-bar b"></i><i class="tour-bar c"></i><span class="tour-dots"><i></i><i></i><i></i></span></div>
    </div>
    <i class="fl-badge t-pink abs" data-fl-icon="arrow" data-beat="0" style="left:1086px;top:266px;--s:124px"></i>
    <i class="fl-badge abs" data-fl-icon="check" data-beat="0" style="left:1600px;top:250px;--s:112px"></i>
    <i class="fl-badge t-yellow abs" data-fl-icon="timer" data-beat="0" style="left:1640px;top:700px;--s:104px"></i>
    <i class="fl-art abs" data-fl-art="spark" data-beat="0" style="left:1420px;top:250px;width:46px"></i>
    <i class="fl-art abs" data-fl-art="plus" data-beat="0" style="left:1120px;top:780px;width:34px"></i>
    <p class="abs tour-cover-name" data-beat="0" style="left:154px;top:230px">li-talk-skills</p>
    <p class="fl-hero abs" data-beat="0" style="left:150px;top:320px">新手教程<br><em class="key">3 分钟</em>上手</p>
    <p class="abs tour-cover-sub" data-beat="0" style="left:154px;top:690px">把想法交给 AI，换回一份网页课件</p>
    <p class="fl-pill abs" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="happy" style="left:150px;top:800px"><i class="tour-cover-dot"></i>跟着小页，一页一页往下翻</p>
    <div class="mascot guide" data-face="left" style="left:900px;top:820px"></div>`,
  notes: [
    { beat: 0, key: '3 分钟', say: '你好！这是 li-talk-skills 的新手教程，三分钟带你上手。它做的事很简单：把你的想法交给 AI，换回一份网页课件。' },
    { beat: 1, show: '跟着小页往下翻', say: '我是小页，接下来陪你一页一页往下翻。按方向键右、空格，或者点一下鼠标，就能往下走。' },
  ],
});

/* 它能做什么：左边一堆材料胶囊（主题、想法、笔记、截图、讲稿）垫在一块珊瑚圆上，中间一条箭头轨道，
   右边一扇网页窗口：一页小课件加上「一拍一拍翻的网页课件」。最后一拍补一句不适合什么 */
Deck.add({
  id: 'p02',
  chapter: '一、认识它',
  topic: '它能做什么',
  scene: 'flat',
  title: '你给材料，AI 还你一份课件',
  html: `
    <i class="fl-blob t-pink abs" data-beat="1" style="left:110px;top:300px;width:480px"></i>
    <p class="fl-pill abs" data-beat="1" style="left:150px;top:350px">主题</p>
    <p class="fl-pill t-yellow abs" data-beat="1" style="left:350px;top:430px">想法</p>
    <p class="fl-pill t-blue abs" data-beat="1" style="left:170px;top:520px">笔记</p>
    <p class="fl-pill abs" data-beat="1" style="left:370px;top:600px">截图</p>
    <p class="fl-pill t-yellow abs" data-beat="1" data-mascot="1" data-mascot-side="right" style="left:200px;top:690px">讲稿</p>
    <p class="fl-pill t-blue abs" data-beat="2" style="left:650px;top:440px">AI 来做</p>
    <i class="fl-track abs" data-beat="2" style="left:650px;top:556px;width:200px"></i>
    <div class="tour-win abs" data-beat="2" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".8" style="left:960px;top:300px;width:840px">
      <div class="tour-mini"><i class="tour-bar a"></i><i class="tour-bar b"></i><i class="tour-bar c"></i><span class="tour-dots"><i></i><i></i><i></i></span></div>
      <h3>一拍一拍翻的<em class="key">网页课件</em></h3>
      <p>双击 index.html，离线就能打开</p>
    </div>
    <p class="fl-bad abs" data-beat="3" data-mascot="3" data-mascot-side="right" style="left:960px;top:850px">不适合：导出 pptx 或 pdf</p>
    <div class="mascot guide" style="left:620px;top:780px"></div>`,
  notes: [
    { beat: 0, key: '课件', say: '先说它能做什么。一句话：你给材料，AI 还你一份课件。' },
    { beat: 1, show: '五种材料', say: '材料可以是一个主题、一些零散的想法、笔记、截图，或者一份写好的讲稿。手上有什么就给什么。' },
    { beat: 2, key: '网页课件', say: 'AI 会把它做成一份网页课件，像幻灯片一样一拍一拍地翻。它就是一个文件夹，双击 index.html 就能打开，不用联网。' },
    { beat: 3, show: '不适合什么', say: '要提前说一句：它只做网页课件。要导出 pptx 或 pdf 的话，就不适合用它。' },
  ],
});

/* 怎么开始：上面一个大气泡写着要对 AI 说的那句话；下面一块明黄台面当横梁，三块标签牌挂下来，就是三个起点 */
Deck.add({
  id: 'p03',
  chapter: '二、怎么做',
  topic: '怎么开始',
  scene: 'flat',
  title: '开口说一句，就开始了',
  html: `
    <div class="fl-bubble abs" data-beat="0" data-mascot="0" data-mascot-side="right" style="left:150px;top:240px;--fl-tx:120px"><p>用 li-talk-skills 做一份关于……的课件</p></div>
    <i class="fl-shelf abs" data-beat="0" style="left:120px;top:540px;width:1680px"></i>
    <div class="fl-tag t-pink abs" data-beat="1" data-mascot="1" data-mascot-side="right" style="left:120px;top:690px;width:460px;--fl-str:110px">
      <b class="fl-no">1</b><h3>只有<em class="key">主题</em></h3><p>AI 问你几句，<br>帮你起一份提纲</p>
    </div>
    <div class="fl-tag t-yellow abs" data-beat="2" data-mascot="2" data-mascot-side="right" style="left:730px;top:690px;width:460px;--fl-str:110px">
      <b class="fl-no">2</b><h3>有想法和材料</h3><p>想法、笔记、截图，<br>放进 <em class="key">素材/</em></p>
    </div>
    <div class="fl-tag t-blue abs" data-beat="3" data-mascot="3" data-mascot-side="left" style="left:1340px;top:690px;width:460px;--fl-str:110px">
      <b class="fl-no">3</b><h3>已经有<em class="key">讲稿</em></h3><p>AI 整理成标准格式，<br>补上缺的段落</p>
    </div>
    <div class="mascot guide" data-face="left" style="left:1600px;top:300px"></div>`,
  notes: [
    { beat: 0, key: '一句话', say: '开始只要一句话。在任意目录对 AI 说：用 li-talk-skills 做一份关于什么什么的课件。AI 会先问你手上有什么，从三种起点出发。' },
    { beat: 1, key: '主题', say: '第一种，你只有一个主题。AI 会一问一答：讲给谁、讲多久、在什么场合讲、最想让听众带走什么，然后起一份提纲给你改。' },
    { beat: 2, key: '素材/', say: '第二种，你有想法、笔记或者截图。把它们放进课件目录的「素材」文件夹，AI 会列出清单、整理成提纲，只问你缺的部分。' },
    { beat: 3, key: '讲稿', say: '第三种，你已经写好了讲稿。AI 把它整理成标准格式，补上缺的段落，再给你确认。' },
  ],
});

/* 五处停下：一条横轨上五个站点，每站一枚受光的序号圆片、站名和一句说明；
   两站一拍往右走，最后一拍下面贴一枚胶囊：中途换对话、换模型也能接着做 */
Deck.add({
  id: 'p04',
  chapter: '二、怎么做',
  topic: '五处停下',
  scene: 'flat',
  title: '五处停下来，等你点头',
  html: `
    <p class="explain" data-beat="0"><b>点头</b>：你说「可以」，AI 才接着往下做</p>
    <i class="tour-rail abs" data-beat="0" style="left:288px;top:416px;width:1344px"></i>
    <ol class="tour-stops abs" style="left:120px;top:374px;width:1680px">
      <li data-beat="1"><b><em class="key">提纲</em></b><span>分几部分<br>每部分几页</span></li>
      <li data-beat="1" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".3"><b>讲稿</b><span>屏幕上的字<br>分拍和讲词</span></li>
      <li data-beat="2"><b><em class="key">风格</em></b><span>打开样册<br>你来挑</span></li>
      <li data-beat="2" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".3"><b>先做 3 页</b><span>封面加两页<br>满意再写全稿</span></li>
      <li data-beat="3" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".3"><b><em class="key">过稿</em></b><span>整份看一遍<br>按意见改</span></li>
    </ol>
    <p class="fl-pill abs tour-save" data-beat="4" data-mascot="4" data-mascot-side="right" style="left:120px;top:810px"><i class="tour-save-dot"></i>换对话、换模型也能接着做：进度记在课件目录的文件里</p>
    <div class="mascot guide" style="left:1680px;top:240px"></div>`,
  notes: [
    { beat: 0, key: '点头', say: '开始以后，AI 一步步往下做，但有五个地方会停下来等你点头。你说了「可以」，它才继续。' },
    { beat: 1, key: '提纲', say: '前两处管内容：先是提纲，分几部分、每部分几页；再是讲稿，每页屏幕上写什么、分几拍、照着讲的讲词。' },
    { beat: 2, key: '风格', say: '接着管样子：AI 推荐风格，打开样册让你挑，你说了算。然后先做 3 页，封面加两页最典型的，你满意了再写全稿。' },
    { beat: 3, key: '过稿', say: '最后一处是过稿：整份课件给你看，按你的意见改。' },
    { beat: 4, key: '接着做', say: '中途换个对话、换个模型也不怕。进度记在课件目录的文件里，AI 每一步都会先查一遍，从停下的地方接着做。' },
  ],
});

/* 15 种风格：三张数字大卡从左到右（手绘 8、现代 6、像素 1），每拍一张弹起来、数字滚上去；
   最后一拍下面两枚胶囊：只在同一家里换，看完教程去逛样册 */
Deck.add({
  id: 'p05',
  chapter: '二、怎么做',
  topic: '15 种风格',
  scene: 'flat',
  title: '15 种风格，分成三家',
  html: `
    <p class="explain" data-beat="0"><b>风格</b>：每种都有自己的形象和版式，不只是换颜色</p>
    <div class="fl-num t-pink abs" data-beat="1" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".39" style="left:120px;top:280px;width:520px">
      <p class="fl-big"><b class="fl-n">8</b><small>种</small></p>
      <h3>手绘家</h3>
      <p>楷书，方格纸、水墨等</p>
    </div>
    <div class="fl-num t-yellow abs" data-beat="2" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".39" style="left:700px;top:280px;width:520px">
      <p class="fl-big"><b class="fl-n">6</b><small>种</small></p>
      <h3>现代家</h3>
      <p>黑体，扁平、暗黑等</p>
    </div>
    <div class="fl-num t-blue abs" data-beat="3" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".39" style="left:1280px;top:280px;width:520px">
      <p class="fl-big"><b class="fl-n">1</b><small>种</small></p>
      <h3>像素家</h3>
      <p>像素字体，像素游戏</p>
    </div>
    <p class="fl-pill abs tour-rule" data-beat="4" style="left:120px;top:880px">按章换风格，只在<em class="key">同一家</em>里换</p>
    <p class="fl-pill t-yellow abs tour-rule" data-beat="4" data-mascot="4" data-mascot-side="right" data-mascot-pose="happy" style="left:820px;top:880px">看完教程，AI 带你逛样册</p>
    <div class="mascot guide" style="left:1680px;top:860px"></div>`,
  notes: [
    { beat: 0, key: '风格', say: '再说风格。一共 15 种，每种都有自己的小形象和版式，不只是换个颜色。它们分成三家。' },
    { beat: 1, key: '手绘家', say: '手绘家 8 种，用楷书，有方格纸、黑板、水彩、水墨、蓝图、漫画这些。' },
    { beat: 2, key: '现代家', say: '现代家 6 种，用黑体，比如现在你看到的扁平插画，还有科技暗黑、毛玻璃这些。' },
    { beat: 3, key: '像素家', say: '像素家只有 1 种，像素游戏，适合闯关式的上手教程。' },
    { beat: 4, key: '同一家', say: '一份课件可以按章换风格，但只在同一家里换。看完这份教程，AI 会打开样册，带你把全部风格过一遍。' },
  ],
});

/* 质量怎么把关：左边一列竖排清单（先查写法、再量版面、错误清零），右边一块墨蓝浅色墙上排着五个屏幕尺寸，
   第 2 拍一个个弹出来，第 3 拍角上弹出一枚明黄的勾 */
Deck.add({
  id: 'p06',
  chapter: '二、怎么做',
  topic: '质量怎么把关',
  scene: 'flat',
  title: '写完先自检，清零才给你看',
  html: `
    <div class="fl-wall t-blue abs" data-beat="0" style="left:1020px;top:280px;width:780px;height:540px"></div>
    <ol class="fl-check abs" style="left:130px;top:300px;width:760px">
      <li data-beat="1" data-mascot="1" data-mascot-side="right"><b><em class="key">先查写法</em></b><span>不开浏览器，几秒查完</span></li>
      <li data-beat="2" data-mascot="2" data-mascot-side="right"><b><em class="key">再量版面</em></b><span>后台浏览器，5 个尺寸逐页逐拍量</span></li>
      <li data-beat="3" data-mascot="3" data-mascot-side="right"><b><em class="key">错误清零</em></b><span>清零了，才拿给你看</span></li>
    </ol>
    <div class="tour-devs abs" data-beat="2" data-stagger=".1" style="left:1070px;top:330px;width:680px">
      <div class="tour-dev" style="--w:288px;--h:162px"><i></i><span data-small>1920×1080</span></div>
      <div class="tour-dev" style="--w:216px;--h:135px"><i></i><span data-small>1440×900</span></div>
      <div class="tour-dev" style="--w:192px;--h:108px"><i></i><span data-small>1280×720</span></div>
      <div class="tour-dev" style="--w:154px;--h:115px"><i></i><span data-small>1024×768</span></div>
      <div class="tour-dev" style="--w:59px;--h:127px"><i></i><span data-small>390×844</span></div>
    </div>
    <i class="fl-badge t-yellow abs" data-fl-icon="check" data-beat="3" style="left:1680px;top:230px;--s:110px"></i>
    <div class="mascot guide" style="left:1680px;top:860px"></div>`,
  notes: [
    { beat: 0, key: '自检', say: '页面是 AI 手写的，难的是写完不知道效果对不对。所以每写完一批，它都要自己检查两遍。' },
    { beat: 1, key: '先查写法', say: '第一遍不开浏览器，几秒钟查完写法错误、讲词拍数和页面对不上这类问题。' },
    { beat: 2, key: '再量版面', say: '第二遍用后台浏览器，在 1920、1440、1280、1024 四种屏幕和手机竖屏这 5 个尺寸下，逐页逐拍量一遍：有没有溢出、重叠、字太小、形象挡字。' },
    { beat: 3, key: '错误清零', say: '错误全部清零，AI 才把课件拿给你看。' },
  ],
});
