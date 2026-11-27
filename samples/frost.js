/* =====================================================================
   毛玻璃 frost 自己的样板页（虚构主题：怎么泡好一杯茶）
   - 内容和通用样板（samples.js）大致对应：封面、要备的三样东西、泡茶三步、别踩的三个坑、三个数、收尾金句；
     版式全换成「彩色光斑上层层叠叠的磨砂卡片和控件」：
     t-frost-cover 层叠玻璃板（封面）、t-frost-list 卡片展开（三样东西，招牌页）、t-frost-steps 通知横幅（泡茶三步）、
     t-frost-pits 设置开关（三个坑）、t-frost-nums 控制中心（三个数，招牌页）、t-frost-end 层叠玻璃板（收尾）
   - 每拍「发生了什么」是磨砂玻璃上的事：一张卡片从一摞里滑出来、一条通知从上一条底下滑出来、字从磨砂后面聚焦变清楚、
     背后的光斑挪到当前这一块后面、开关拨过去、滑块推上去、旋钮转过去、沙漏翻过来。这些动作由毛玻璃的版式组件（.fr-*）自己完成，
     页面里只写结构和 data-beat，不写 onBeat、不写风格专用的 data-in
   - 可读性：玻璃和控件是包装，要点直接写在乳白磨砂卡片上、讲完一直留着——一摞卡片最后全部摊开并排，通知一条条往下排不顶掉，
     错的做法和对的做法同在一行，三个数的读数和一句说明写在控件下面。「当前」靠背后挪过来的光斑交代，讲过的块只由引擎退到 .8；
     渐变字只给重点词和大数字，正文一律实色横排；小球和光斑只垫在玻璃后面，不和字直接叠在一起
   - 和液态玻璃 glass 拉开：这里是薄的、带颗粒的磨砂片一层层叠着、滑出来，不做融合变形的胶囊和液体
   - 组件只在毛玻璃里有样子（换成别的风格会乱）：这几页只给 scene: 'frost' 用，不进通用样册
   - 抄过去时：id 换成 p〈讲稿页号〉，samples/frost.css 里对应的 [data-id="t-frost-…"] 一起换；字照讲稿改；
     坐标都是舞台坐标（1920×1080），版式组件的用法见 scenes/frost.js 开头的说明
   ===================================================================== */

/* 层叠玻璃板（封面）：左边一大块磨砂玻璃板，大标题、一道渐变短线、副标题写在里面；一颗粉紫小球一半藏在玻璃板右边后面——
   露在外面的一半边缘清楚，藏着的一半隔着磨砂只剩一团柔光，一眼就是毛玻璃；右下再垫一块空玻璃、一颗蓝色小球，叠出前后层次。
   翻进来时小球从模糊里鼓出来，玻璃板从下面浮上来、一道光掠过，字由虚到实。
   1 拍：讲者胶囊从玻璃板底下滑出来（隔着磨砂先看到一团影子，滑出来变清楚），小雾跳过去高兴一下。
   为什么适合：「彩色球 + 半透明磨砂板压在上面」是毛玻璃最经典的画面，层次全靠前后叠，不靠描边和装饰。
   抄过去改：大标题（128px，一行 7 个字以内；更长就把 .cv-title 的字号调小）、副标题、讲者；
   小球的位置跟着玻璃板的右边走（球心大约落在玻璃板右边上） */
Deck.add({
  id: 't-frost-cover',
  chapter: '开场',
  scene: 'frost',
  title: '怎么泡好一杯茶',
  noTitle: true,
  html: `
    <i class="fr-ball abs" data-beat="0" style="left:1050px;top:150px;width:460px"></i>
    <i class="fr-ball abs" data-beat="0" data-fr-tone="blue" style="left:1640px;top:650px;width:170px"></i>
    <div class="fr-pane fr-back abs" data-beat="0" style="left:1300px;top:440px;width:440px;height:270px"></div>
    <div class="fr-pane abs cv-pane" data-beat="0" style="left:120px;top:236px;width:1160px">
      <p class="cv-title">怎么<em class="key">泡好</em>一杯茶</p>
      <i class="cv-bar"></i>
      <p class="cv-sub">水温、茶量、时间，三件事讲清楚</p>
    </div>
    <div class="fr-cap abs" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="happy" style="left:196px;top:740px">讲者：〈你的名字〉 · 〈日期〉</div>
    <div class="mascot guide" data-face="left" style="left:1560px;top:312px"></div>`,
  notes: [
    { beat: 0, key: '泡好', say: '大家好，今天聊一件小事：怎么泡好一杯茶。' },
    { beat: 1, say: '我是〈你的名字〉，平时爱喝茶，也踩过不少坑。' },
  ],
});

/* 卡片展开（三样东西，招牌页）：开场时三张磨砂卡片叠成一摞放在中间，像手机上叠起来的一摞通知：
   最上面一张的图标隔着磨砂是模糊的一团，字的位置上只有三道磨砂占位条，下面两张往下错开、缩小一点。
   每拍摊开一张：最上面那张滑到自己那一栏（第 1 张往左、第 2 张留在中间、第 3 张往右），图标由模糊变清楚，
   名字和一句说明从磨砂后面聚焦出来，一道光掠过卡片；背后的那团光斑挪到这张后面、换个颜色，小雾跟到这张下面。
   讲完三张并排摊开，都读得清。
   为什么适合：毛玻璃的层次感就是一张张薄卡片叠在一起，「从一摞里滑出来、隔着磨砂由模糊变清楚」是只有磨砂才有的动作；
   当前这张靠背后的光斑透出颜色来交代，不用把别的弄淡。
   抄过去改：每张卡片的图标（data-fr-ico：cup、leaf、kettle、thermo、clock）、序号、名字（一行 8 个字以内）、说明（一行 11 个字以内）；
   卡片两张或四张时在 .fr-fan 的 style 里改 --cols，并把 --fr-stack 改成叠放的那一栏（从 0 数，四张写 1） */
Deck.add({
  id: 't-frost-list',
  chapter: '一、准备',
  topic: '要备的三样东西',
  scene: 'frost',
  title: '动手之前，备齐三样东西',
  html: `
    <p class="explain" data-beat="0"><b>盖碗</b>：带盖的小茶碗，泡茶、闻香、出汤都用它</p>
    <div class="fr-fan abs" data-beat="0" style="left:120px;top:318px;width:1680px">
      <div class="fr-leaf" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".37">
        <i class="fr-ico" data-fr-ico="cup"></i>
        <div class="fr-face" data-beat="1"><small data-small>01</small><h3>一只<em class="key">盖碗</em></h3><p>白瓷的最好，看得清茶色</p></div>
      </div>
      <div class="fr-leaf" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".37">
        <i class="fr-ico" data-fr-ico="leaf"></i>
        <div class="fr-face" data-beat="2"><small data-small>02</small><h3><em class="key">三克</em>绿茶</h3><p>大约铺满碗底薄薄一层</p></div>
      </div>
      <div class="fr-leaf" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".37">
        <i class="fr-ico" data-fr-ico="kettle"></i>
        <div class="fr-face" data-beat="3"><small data-small>03</small><h3>一壶热水</h3><p>烧开后晾到<em class="key">八十度</em></p></div>
      </div>
    </div>
    <div class="mascot guide" data-face="left" style="left:1452px;top:470px"></div>`,
  notes: [
    { beat: 0, key: '盖碗', say: '动手之前先备齐东西，一共三样，我一张张摊开。盖碗就是带盖的小茶碗，泡、闻、倒都用它。' },
    { beat: 1, key: '盖碗', say: '第一样是盖碗，白瓷的最好，茶汤什么颜色一眼就看清。' },
    { beat: 2, key: '三克', say: '第二样是茶叶，三克就够，大约铺满碗底薄薄一层。' },
    { beat: 3, key: '八十度', say: '第三样是热水。水烧开后别急，晾到八十度左右再用。' },
  ],
});

/* 通知横幅（泡茶三步）：三步像手机上一条条弹出来的提醒。每条通知是一块磨砂横幅：左边一个渐变图标，
   右边一行小字「第 1 步」，下面一行大字步骤名加一句做什么。一颗杏色小球垫在通知右半边后面，隔着磨砂透出暖色。
   每拍弹一条：第 1 条从上面落下来；第 2、3 条从上一条底下滑出来（越早的一条压在越上面，新的一条先隔着磨砂露出一团影子），
   滑到自己的位置由模糊变清楚，一道光掠过，字随后聚焦。旧的不顶掉，三条从上往下一路读下来。
   第 3 拍下面再浮出一条可复制的命令胶囊（点一下复制）。小雾每拍跟到这一条右边。
   为什么适合：一条条磨砂通知叠着滑出来是毛玻璃界面最熟悉的样子；「到点提醒你下一步」也正好是步骤的意思，
   每条直接写着第几步、做什么，不用观众翻译。
   抄过去改：每条的图标、「第几步」、步骤名（2–4 个字）、做什么（一行 10 个字以内）；
   步骤多一步就照样加一条 .fr-note（一条约 165px 高，四条时把 .fr-notes 往上挪、命令胶囊挪到右边）；命令改 .copy 的字和 data-copy */
Deck.add({
  id: 't-frost-steps',
  chapter: '二、动手',
  topic: '泡茶三步',
  scene: 'frost',
  title: '泡一杯绿茶，只要三步',
  html: `
    <i class="fr-ball abs" data-beat="0" data-fr-tone="peach" style="left:930px;top:310px;width:470px"></i>
    <div class="fr-notes abs" style="left:120px;top:282px;width:1040px">
      <div class="fr-note" data-beat="1" data-mascot="1" data-mascot-side="right">
        <i class="fr-ico" data-fr-ico="cup"></i>
        <div class="fr-nt"><span class="fr-src" data-small>第 1 步</span><p><b><em class="key">温杯</em></b>热水把盖碗烫一遍</p></div>
      </div>
      <div class="fr-note" data-beat="2" data-mascot="2" data-mascot-side="right">
        <i class="fr-ico" data-fr-ico="leaf"></i>
        <div class="fr-nt"><span class="fr-src" data-small>第 2 步</span><p><b><em class="key">投茶</em></b>三克茶叶铺满碗底</p></div>
      </div>
      <div class="fr-note" data-beat="3" data-mascot="3" data-mascot-side="right">
        <i class="fr-ico" data-fr-ico="kettle"></i>
        <div class="fr-nt"><span class="fr-src" data-small>第 3 步</span><p><b><em class="key">注水</em></b>八十度水沿碗边倒</p></div>
      </div>
    </div>
    <button class="copy abs" type="button" data-beat="3" style="left:120px;top:882px" data-copy="tea brew --green --temp 80">tea brew --green --temp 80</button>
    <div class="mascot guide" data-face="left" style="left:1520px;top:760px"></div>`,
  notes: [
    { beat: 0, key: '三步', say: '东西备齐了，泡一杯绿茶其实只要三步，我把它们当成三条提醒，一条一条弹出来。' },
    { beat: 1, key: '温杯', say: '第一步温杯：热水把盖碗里外烫一遍，倒掉。' },
    { beat: 2, key: '投茶', say: '第二步投茶：三克茶叶放进去，铺满碗底就行。' },
    { beat: 3, key: '注水', say: '第三步注水：八十度的水沿着碗边慢慢倒。懒得记的话，下面这行命令点一下就能复制。' },
  ],
});

/* 设置开关（别踩的三个坑）：一大块磨砂设置面板，一行一个坑，像手机「设置」里的一排开关：
   左边一个渐变图标，接着一枚粉色小胶囊写错的做法（✕ 水太烫），开关一开始都关着。
   每拍拨开一行：行尾的开关拨到右边、槽里铺开渐变，一支渐变箭头带出对的做法（→ 晾到八十度），从模糊里浮出来；
   当前这一行底下亮一道淡紫，小雾跟到这一行右边。三行讲完开关都开着，错的、对的都留在同一行上。
   为什么适合：「把三个开关都打开」就躲开了三个坑，开关、分隔线、一整块磨砂面板都是毛玻璃界面的语汇；
   错的做法不划掉、只放在粉色小胶囊里，对的做法用大一号的实色字，一眼看出哪个是该做的。
   抄过去改：每行的图标、错的做法（6 个字以内）、对的做法（8 个字以内）；行数改了不用改样式，面板高度跟着行走 */
Deck.add({
  id: 't-frost-pits',
  chapter: '二、动手',
  topic: '别踩的三个坑',
  scene: 'frost',
  title: '三个坑，打开三个开关就躲过',
  html: `
    <i class="fr-ball abs" data-beat="0" data-fr-tone="blue" style="left:1190px;top:600px;width:320px"></i>
    <div class="fr-set abs" data-beat="0" style="left:120px;top:286px;width:1240px">
      <div class="fr-row" data-mascot="1" data-mascot-side="right" data-mascot-dx="40">
        <i class="fr-ico" data-fr-ico="thermo"></i>
        <span class="fr-bad">水太烫</span>
        <p class="fr-fix" data-beat="1">晾到<em class="key">八十度</em></p>
      </div>
      <div class="fr-row" data-mascot="2" data-mascot-side="right" data-mascot-dx="40">
        <i class="fr-ico" data-fr-ico="clock"></i>
        <span class="fr-bad">泡太久</span>
        <p class="fr-fix" data-beat="2"><em class="key">一分钟</em>出汤</p>
      </div>
      <div class="fr-row" data-mascot="3" data-mascot-side="right" data-mascot-dx="40">
        <i class="fr-ico" data-fr-ico="leaf"></i>
        <span class="fr-bad">茶太多</span>
        <p class="fr-fix" data-beat="3">只放<em class="key">三克</em></p>
      </div>
    </div>
    <div class="mascot guide" data-face="left" style="left:1560px;top:300px"></div>`,
  notes: [
    { beat: 0, key: '三个坑', say: '泡茶最常踩的有三个坑。好比手机设置里的三个开关，一个个打开就躲过去了。' },
    { beat: 1, key: '八十度', say: '第一个坑是水太烫，滚水一冲茶就苦。打开：先晾到八十度。' },
    { beat: 2, key: '一分钟', say: '第二个坑是泡太久，茶会发涩。打开：一分钟左右就出汤。' },
    { beat: 3, key: '三克', say: '第三个坑是茶放太多，味道太浓。打开：只放三克。' },
  ],
});

/* 控制中心（三个数，招牌页）：一排三块磨砂方块，像手机的控制中心：水温是一根竖着的温度滑块，茶量是一个计量旋钮
   （周围五颗刻度点，一颗一克），时间是一只沙漏。开场时三个控件都没调：灰一点、淡一点，读数的位置空着。
   每拍调好一个：滑块里的渐变液柱推到八成（略过冲再回），或者旋钮转过去、刻度点一颗颗亮到第三颗，或者沙漏翻过来开始计时；
   一道光掠过这一块，大数字和一句说明随后由虚变实；背后的光斑挪到这一块后面，小雾跟到这一块下面。
   调过的控件一直停在读数上，三个数一直都在。
   为什么适合：「三个数」讲成控制中心里调好的三个控件，滑块、旋钮、沙漏一看就知道是「多少」，磨砂方块排在一起就是毛玻璃界面；
   读数用 104px 大字写在控件下面，后排也看得清，不靠控件本身传递数字。
   抄过去改：每块的 data-fr-ctl（slider 滑块、knob 旋钮、timer 沙漏）和 --fr-to（读数占满量程的比例：80℃ 是 .8，五颗点里的 3 克是 .6，
   旋钮的点数写 data-fr-steps）、名字、数字和单位、说明（一行 12 个字以内） */
Deck.add({
  id: 't-frost-nums',
  chapter: '三、记住',
  topic: '三个数',
  scene: 'frost',
  title: '记住三个数就够了',
  html: `
    <div class="fr-cc abs" data-beat="0" style="left:120px;top:250px;width:1680px">
      <div class="fr-tile" data-fr-ctl="slider" style="--fr-to:.8" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".37">
        <span class="fr-lab">水温</span>
        <div class="fr-read" data-beat="1"><b><em class="key">80</em><small>℃</small></b><span>烧开后晾到八十度</span></div>
      </div>
      <div class="fr-tile" data-fr-ctl="knob" style="--fr-to:.6" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".37">
        <span class="fr-lab">茶量</span>
        <div class="fr-read" data-beat="2"><b><em class="key">3</em><small>克</small></b><span>铺满碗底薄薄一层</span></div>
      </div>
      <div class="fr-tile" data-fr-ctl="timer" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".37">
        <span class="fr-lab">时间</span>
        <div class="fr-read" data-beat="3"><b><em class="key">1</em><small>分钟</small></b><span>一分钟就出汤</span></div>
      </div>
    </div>
    <div class="mascot guide" data-face="left" style="left:1660px;top:96px"></div>`,
  notes: [
    { beat: 0, key: '三个数', say: '前面讲了这么多，其实只要记住三个数，就像控制中心里调好三个控件。' },
    { beat: 1, key: '80℃', say: '第一个，水温八十度。开水烧开后晾一晾再冲，茶就不苦。' },
    { beat: 2, key: '3 克', say: '第二个，茶量三克，铺满碗底薄薄一层。' },
    { beat: 3, key: '1 分钟', say: '第三个，时间一分钟，沙漏一翻，到点就出汤。' },
  ],
});

/* 层叠玻璃板（收尾）：和封面同一套，但居中：一大块磨砂玻璃板压在两颗小球上（左上一颗粉紫、右下一颗紫），
   板上一句大字金句，重点词「不苦」是渐变的玻璃胶囊。翻进来时小球鼓出来、玻璃板浮上来、一道光掠过。
   1 拍：「谢谢大家，欢迎提问」的胶囊从玻璃板底下滑出来，小雾跳到胶囊旁边说谢谢。署名由引擎自动加在右下角。
   为什么适合：首尾都是「小球 + 磨砂板」，收得干净；金句一直在，不换掉。
   抄过去改：金句（112px，一行 9 个字以内）、致谢；y 990 以下留给署名，别放东西 */
Deck.add({
  id: 't-frost-end',
  chapter: '结尾',
  scene: 'frost',
  title: '谢谢',
  noTitle: true,
  html: `
    <i class="fr-ball abs" data-beat="0" style="left:180px;top:150px;width:360px"></i>
    <i class="fr-ball abs" data-beat="0" data-fr-tone="violet" style="left:1400px;top:486px;width:250px"></i>
    <div class="fr-pane abs ed-pane" data-beat="0" style="left:300px;top:260px;width:1320px">
      <p class="ed-quote">水温对了，茶就<em class="key">不苦</em></p>
    </div>
    <div class="abs center" style="left:0;right:0;top:672px">
      <div class="fr-cap" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="happy" data-mascot-say="谢谢！">谢谢大家，欢迎提问</div>
    </div>
    <div class="mascot guide" data-face="left" style="left:1660px;top:700px"></div>`,
  notes: [
    { beat: 0, key: '不苦', say: '最后只记一句：水温对了，茶就不苦。' },
    { beat: 1, say: '谢谢大家，有问题现在可以问。' },
  ],
});
