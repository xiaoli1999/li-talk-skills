/* =====================================================================
   扁平插画 flat 自己的样板页：同一个虚构主题「怎么泡好一杯茶」，按明亮的扁平信息图重新排
   - 和通用样板（samples.js）内容大致对应，版式全换成信息图里的画面：
     t-flat-cover 插画封面、t-flat-desk 场景信息图（要备的三样东西，招牌页）、t-flat-brew 一碗茶的变化（泡茶三步）、
     t-flat-flip 坑和办法的翻面横条（别踩的三个坑）、t-flat-nums 数字大卡（三个数，招牌页）、t-flat-end 茶碗说的话（收尾金句）
   - 每拍「发生了什么」是信息图里的事：东西从台面上弹起来（略过冲）、标签牌挂上去晃两下、色块铺开、图标翻个面、大数字从 0 滚上去、
     碗里一层层加东西（热气、茶叶、茶汤）。这些动作由扁平插画的版式组件（.fl-*）自己完成，页面里只写结构和 data-beat，不写 onBeat、不写 data-in
   - 可读性：插画是包装，真话写在旁边——每样东西的名字和说明写在标签牌上，三步写在清单里，坑和办法并排写在横条里，
     三个数的说明写在大卡上；讲过的都留着。翻到每页最后一拍，整页信息完整、从左到右（或从上到下）一条路读下来
   - 组件只在扁平插画里有样子（换成别的风格会乱）：这几页只给 scene: 'flat' 用，不进通用样册
   - 抄过去时：id 换成 p〈讲稿页号〉，samples/flat.css 里对应的 [data-id="t-flat-…"] 一起换；字照讲稿改；
     坐标都是舞台坐标（1920×1080），版式组件的用法见 scenes/flat.js 开头的说明
   ===================================================================== */

/* 插画封面：左边两行特粗大字「怎么泡好 / 一杯茶」逐字弹起，下面一行副题；右边一块明黄大圆铺开，
   盖碗和水壶从圆里弹起来，三枚圆片徽标（温度计、茶叶、计时器，对应水温、茶量、时间）转着弹出来，几颗小几何点缀。
   1 拍：讲者胶囊贴上来，小页跑到胶囊右边高兴一下。
   为什么适合：扁平插画的封面就是「一句大字 + 一张有主角的插画」，左字右图、几何色块垫底，是这类信息图最常见的开场。
   可读性：字都在左边一条线上（大字 → 副题 → 讲者），插画在右边只当图看，徽标里不放字。
   抄过去改：大字（一行 4 个字以内，144px；字多了改两行或把 .fl-hero 的字号调小）、副题、讲者；
   插画换零件就改 data-fl-art，徽标换图标就改 data-fl-icon（可选的见 scenes/flat.js 开头） */
Deck.add({
  id: 't-flat-cover',
  chapter: '开场',
  scene: 'flat',
  title: '怎么泡好一杯茶',
  noTitle: true,
  html: `
    <i class="fl-blob t-yellow abs" data-beat="0" style="left:1060px;top:196px;width:700px"></i>
    <i class="fl-art abs" data-fl-art="kettle" data-beat="0" style="left:1424px;top:552px;width:310px"></i>
    <i class="fl-art abs" data-fl-art="gaiwan" data-beat="0" style="left:1110px;top:543px;width:440px"></i>
    <i class="fl-badge t-pink abs" data-fl-icon="thermo" data-beat="0" style="left:1086px;top:286px;--s:124px"></i>
    <i class="fl-badge abs" data-fl-icon="leaf" data-beat="0" style="left:1590px;top:250px;--s:112px"></i>
    <i class="fl-badge t-yellow abs" data-fl-icon="timer" data-beat="0" style="left:1668px;top:410px;--s:104px"></i>
    <i class="fl-art abs" data-fl-art="spark" data-beat="0" style="left:1404px;top:250px;width:46px"></i>
    <i class="fl-art abs" data-fl-art="plus" data-beat="0" style="left:1180px;top:462px;width:34px"></i>
    <p class="fl-hero abs" data-beat="0" style="left:150px;top:280px">怎么<em class="key">泡好</em><br>一杯茶</p>
    <p class="abs t-flat-cover-sub" data-beat="0" style="left:154px;top:640px">水温、茶量、时间，三件事讲清楚</p>
    <p class="fl-pill abs" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="happy" style="left:150px;top:760px"><i class="t-flat-cover-dot"></i>讲者：〈你的名字〉 · 〈日期〉</p>
    <div class="mascot guide" style="left:820px;top:820px"></div>`,
  notes: [
    { beat: 0, key: '泡好', say: '大家好，今天聊一件小事：怎么泡好一杯茶。' },
    { beat: 1, say: '我是〈你的名字〉，平时爱喝茶，也踩过不少坑。' },
  ],
});

/* 场景信息图（要备的三样东西，招牌页）：一面浅珊瑚色的墙，墙下一块明黄台面；开场台面是空的，小页站在台面右头。
   每拍一件东西从台面上弹起来（压扁 → 拉长冲过头 → 落地压一下），台面正面那颗钉子随后弹出，一块标签牌挂着绳子从左边荡进来、晃两下停住：
   牌子上一枚编号圆片（1、2、3，就是顺序）、东西的名字、一句说明。小页每拍跑到刚弹出来的东西旁边。
   为什么适合：明亮的信息图最常见的讲法就是「一张插画 + 编号标注」，东西摆在台面上、标签牌挂在下面，像店里的价签，
   一眼就把图和字对上；三样东西大小、颜色都不一样，台面一条线从左到右排开。
   可读性：名字和说明都写在标签牌上，讲完一直挂着；三块牌子从左到右一排，编号 1、2、3；重点词三处（盖碗、三克、八十度）。
   抄过去改：标签牌的名字（6 个字以内）和说明（宽 500 时一行 12 个字以内）；换东西就改 data-fl-art；
   东西底边要落在台面上（台面上沿 y 590，零件的高 = 宽 × 画布高 ÷ 画布宽：盖碗 220/300、茶叶罐 270/220、水壶 290/330）；
   标签牌的钉子在牌子正上方 --fl-str 那么远，要正好落在台面正面（y 610–648） */
Deck.add({
  id: 't-flat-desk',
  chapter: '一、准备',
  topic: '要备的三样东西',
  scene: 'flat',
  title: '泡茶之前，备好三样东西',
  html: `
    <p class="explain" data-beat="0"><b>盖碗</b>：带盖的小茶碗，泡茶、闻香、出汤都用它</p>
    <div class="fl-wall t-pink abs" data-beat="0" style="left:120px;top:270px;width:1680px;height:360px"></div>
    <i class="fl-shelf abs" data-beat="0" style="left:150px;top:590px;width:1620px"></i>
    <i class="fl-art abs" data-fl-art="gaiwan" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-dy="46" style="left:220px;top:351px;width:340px"></i>
    <i class="fl-art abs" data-fl-art="tin" data-beat="2" data-mascot="2" data-mascot-side="right" data-mascot-dy="54" style="left:860px;top:344px;width:200px"></i>
    <i class="fl-art abs" data-fl-art="kettle" data-beat="3" data-mascot="3" data-mascot-side="left" data-mascot-dy="68" style="left:1356px;top:308px;width:330px"></i>
    <div class="fl-tag t-pink abs" data-beat="1" style="left:140px;top:710px;width:500px;--fl-str:82px">
      <b class="fl-no">1</b><h3>一只<em class="key">盖碗</em></h3><p>白瓷的最好，看得清茶色</p>
    </div>
    <div class="fl-tag t-yellow abs" data-beat="2" style="left:710px;top:710px;width:500px;--fl-str:82px">
      <b class="fl-no">2</b><h3><em class="key">三克</em>绿茶</h3><p>大约铺满碗底薄薄一层</p>
    </div>
    <div class="fl-tag t-blue abs" data-beat="3" style="left:1280px;top:710px;width:500px;--fl-str:82px">
      <b class="fl-no">3</b><h3>一壶热水</h3><p>烧开后晾到<em class="key">八十度</em></p>
    </div>
    <div class="mascot guide" data-face="left" style="left:1610px;top:462px"></div>`,
  notes: [
    { beat: 0, key: '盖碗', say: '动手之前先备齐东西。盖碗就是带盖的小茶碗，泡、闻、倒都用它。' },
    { beat: 1, key: '盖碗', say: '第一样是盖碗，白瓷的最好，茶汤什么颜色一眼就看清。' },
    { beat: 2, key: '三克', say: '第二样是茶叶，三克就够，大约铺满碗底薄薄一层。' },
    { beat: 3, key: '八十度', say: '第三样是热水。水烧开后别急，晾到八十度左右再用。' },
  ],
});

/* 一碗茶的变化（泡茶三步）：左边一块明黄大圆上站着一只揭了盖的盖碗（盖子搁在旁边），右边一列竖排清单。
   每拍清单滑进来一行（序号圆片转着弹出、和上一行之间的连线垂下来），左边的碗同时多一层：
   第 1 拍碗口冒出三缕热气（温杯），第 2 拍六片茶叶掉进碗里弹两下（投茶），第 3 拍水壶从右上方摆进来、水流描到碗里、茶汤从中心铺开（注水），
   清单下面贴上一行可复制的命令。小页每拍跑到刚出来的那一行右边。
   为什么适合：信息图讲步骤，最直观的是「同一个东西一步步变样」：碗里多了什么一看就懂，清单把每一步的真话写在旁边；
   一张插画越画越满，比三张一样大的卡片更有扁平插画的味道。
   可读性：三步的标题和说明都在清单里，讲完一直留着；从上往下编号 1、2、3，连线串起来；插画里不放字。
   抄过去改：清单每行的标题（4 个字以内）和说明（一行 12 个字以内）、命令；碗里每拍加的那层换成别的 brew-* 零件
   （五个零件 left、top、width 写成一样才叠得齐；画布 760×640，宽 760 时高 640） */
Deck.add({
  id: 't-flat-brew',
  chapter: '二、动手',
  topic: '泡茶三步',
  scene: 'flat',
  title: '泡一杯绿茶，只要三步',
  html: `
    <i class="fl-blob t-yellow abs" data-beat="0" style="left:150px;top:262px;width:640px"></i>
    <i class="fl-art abs" data-fl-art="brew-bowl" data-beat="0" style="left:140px;top:270px;width:760px"></i>
    <i class="fl-art abs" data-fl-art="brew-tea" data-beat="3" data-delay=".46" style="left:140px;top:270px;width:760px"></i>
    <i class="fl-art abs" data-fl-art="brew-leaves" data-beat="2" style="left:140px;top:270px;width:760px"></i>
    <i class="fl-art abs" data-fl-art="brew-steam" data-beat="1" style="left:140px;top:270px;width:760px"></i>
    <i class="fl-art abs" data-fl-art="brew-kettle" data-beat="3" style="left:140px;top:270px;width:760px"></i>
    <ol class="fl-check abs" style="left:1010px;top:300px;width:570px">
      <li data-beat="1" data-mascot="1" data-mascot-side="right"><b><em class="key">温杯</em></b><span>热水把盖碗烫一遍</span></li>
      <li data-beat="2" data-mascot="2" data-mascot-side="right"><b><em class="key">投茶</em></b><span>三克茶叶铺满碗底</span></li>
      <li data-beat="3" data-mascot="3" data-mascot-side="right"><b><em class="key">注水</em></b><span>八十度水沿碗边倒</span></li>
    </ol>
    <button class="copy abs" type="button" data-beat="3" data-delay=".3" style="left:1010px;top:868px" data-copy="tea brew --green --temp 80">tea brew --green --temp 80</button>
    <div class="mascot guide" data-face="left" style="left:1640px;top:300px"></div>`,
  notes: [
    { beat: 0, key: '三步', say: '东西备齐了，泡一杯绿茶其实只要三步。' },
    { beat: 1, key: '温杯', say: '第一步温杯：热水把盖碗里外烫一遍，倒掉。' },
    { beat: 2, key: '投茶', say: '第二步投茶：三克茶叶放进去，铺满碗底就行。' },
    { beat: 3, key: '注水', say: '第三步注水：八十度的水沿着碗边慢慢倒。懒得记的话，下面这行命令点一下就能复制。' },
  ],
});

/* 坑和办法的翻面横条（别踩的三个坑）：三条白色胶囊横条从上往下排，开场就在：每条左边一枚珊瑚色的翻面图标（角上一个叉），
   旁边是这个坑（深珊瑚字，前面一个小叉）。每拍讲一个坑的破法：图标翻个面变成明黄（角上弹出一个勾），
   一排明黄箭头从坑伸到右边，办法的胶囊贴上去。小页每拍跑到这一条的右头。
   为什么适合：扁平信息图讲「别这样 → 要这样」，就是一枚图标从红叉翻成黄勾、一条箭头指过去；横条像手机里的设置项，干净、一目了然。
   可读性：坑那一行字第 0 拍就在、一直留着，办法讲完也留着，翻到最后一拍三条都是「坑 → 办法」整句；翻面只翻图标，图标里不放字；
   重点词三处（八十度、一分钟、三克），都在办法里。
   抄过去改：每条的坑（4 个字以内）、办法（6 个字以内）、图标（data-fl-icon，两面写成一样）；条数 2 到 4 条，每条高 168，从上往下隔 216 */
Deck.add({
  id: 't-flat-flip',
  chapter: '二、动手',
  topic: '别踩的三个坑',
  scene: 'flat',
  title: '别踩这三个坑',
  html: `
    <div class="fl-row abs" data-mascot="1" data-mascot-side="right" style="left:160px;top:290px;width:1480px">
      <div class="fl-flip"><i class="fl-face" data-fl-icon="thermo"></i><i class="fl-face" data-fl-icon="thermo" data-beat="1"></i></div>
      <p class="fl-bad">水太烫</p>
      <i class="fl-track" data-beat="1"></i>
      <p class="fl-pill t-yellow" data-beat="1">晾到<em class="key">八十度</em></p>
    </div>
    <div class="fl-row abs" data-mascot="2" data-mascot-side="right" style="left:160px;top:506px;width:1480px">
      <div class="fl-flip"><i class="fl-face" data-fl-icon="timer"></i><i class="fl-face" data-fl-icon="timer" data-beat="2"></i></div>
      <p class="fl-bad">泡太久</p>
      <i class="fl-track" data-beat="2"></i>
      <p class="fl-pill t-yellow" data-beat="2"><em class="key">一分钟</em>出汤</p>
    </div>
    <div class="fl-row abs" data-mascot="3" data-mascot-side="right" style="left:160px;top:722px;width:1480px">
      <div class="fl-flip"><i class="fl-face" data-fl-icon="leaf"></i><i class="fl-face" data-fl-icon="leaf" data-beat="3"></i></div>
      <p class="fl-bad">茶太多</p>
      <i class="fl-track" data-beat="3"></i>
      <p class="fl-pill t-yellow" data-beat="3">只放<em class="key">三克</em></p>
    </div>
    <div class="mascot guide" data-face="left" style="left:1660px;top:860px"></div>`,
  notes: [
    { beat: 0, key: '三个坑', say: '泡茶最怕三个坑：水太烫、泡太久、茶太多。我们一个一个翻过来。' },
    { beat: 1, key: '八十度', say: '第一个坑是水太烫，滚水一冲茶就苦。办法是先晾到八十度。' },
    { beat: 2, key: '一分钟', say: '第二个坑是泡太久，茶会发涩。一分钟左右就出汤。' },
    { beat: 3, key: '三克', say: '第三个坑是茶放太多，味道太浓。只放三克就够。' },
  ],
});

/* 数字大卡（三个数，招牌页）：三张大色块卡从左到右一排——珊瑚 80℃、明黄 3 克、墨蓝 1 分钟。
   每拍一张卡从下面压扁着弹起来、冲过头再落定，右下的实心厚度跟着长出来；角上的图标转着弹出，大数字从 0 滚上去，
   标签和一行说明随后弹起。下一拍上一张卡「落回去」（厚度变小、往下沉一点），新卡抬得最高。小页每拍跑到这张卡下面。
   为什么适合：扁平信息图最爱的就是「大数字 + 色块」：三个数各占一块大色卡，立体的厚度和投影一层层落向右下，是这种风格的招牌。
   可读性：数字、单位、标签、说明都是实色大字压在实色卡上（珊瑚卡用深一档的珊瑚，白字 3.8:1）；讲过的卡不变淡，只是落回去一点；
   卡里不放重点词（明黄色块压在深色卡上看不清），这一拍讲的是哪张由「抬起来」交代。
   抄过去改：大数字（.fl-n 里只写数字，2 以上的整数会从 0 滚上去；三位数时把 .fl-big 的字号调小）、单位、标签、说明（宽 520 时一行 11 个字以内）、
   角上的图标（data-fl-icon）、卡的颜色（t-pink、t-yellow、t-blue） */
Deck.add({
  id: 't-flat-nums',
  chapter: '三、小结',
  topic: '三个数',
  scene: 'flat',
  title: '记住这三个数',
  html: `
    <div class="fl-num t-pink abs" data-beat="1" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".5" style="left:120px;top:300px;width:520px">
      <i data-fl-icon="thermo"></i>
      <p class="fl-big"><b class="fl-n">80</b><small>℃</small></p>
      <h3>水温</h3>
      <p>烧开后晾到八十度</p>
    </div>
    <div class="fl-num t-yellow abs" data-beat="2" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".5" style="left:700px;top:300px;width:520px">
      <i data-fl-icon="leaf"></i>
      <p class="fl-big"><b class="fl-n">3</b><small>克</small></p>
      <h3>茶量</h3>
      <p>大约铺满碗底薄薄一层</p>
    </div>
    <div class="fl-num t-blue abs" data-beat="3" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".5" style="left:1280px;top:300px;width:520px">
      <i data-fl-icon="timer"></i>
      <p class="fl-big"><b class="fl-n">1</b><small>分钟</small></p>
      <h3>时间</h3>
      <p>一分钟出汤</p>
    </div>
    <div class="mascot guide" style="left:160px;top:820px"></div>`,
  notes: [
    { beat: 0, key: '三个数', say: '最后把要记的收成三个数。' },
    { beat: 1, key: '八十度', say: '第一个数，八十度：水温。水烧开以后晾到八十度再用。' },
    { beat: 2, key: '三克', say: '第二个数，三克：茶量。大约铺满碗底薄薄一层。' },
    { beat: 3, key: '一分钟', say: '第三个数，一分钟：时间。一分钟左右就出汤。' },
  ],
});

/* 茶碗说的话（结尾）：右下一块明黄圆上站着一只冒热气的盖碗，左上一个白色大气泡从胶囊铺开，尾巴指着盖碗——
   金句像是这碗茶自己说的，一个字一个字弹起来。1 拍：「谢谢大家，欢迎提问」的明黄胶囊贴上来，小页跑到胶囊右边高兴地说谢谢。
   为什么适合：扁平插画爱用「会说话的东西」收尾，大气泡 + 主角插画，又亮又轻松，和封面的盖碗首尾呼应。
   可读性：金句在气泡里、一直留着（气泡不轮换），108px 一行；致谢横排在气泡下面，从上往下读。
   抄过去改：金句（108px 一行，宽 1260 的气泡最多放 10 个字）、致谢的字；气泡的尾巴用 --fl-tx 挪到指着插画的位置；
   y 990 以下留给引擎自动加的署名，别放东西 */
Deck.add({
  id: 't-flat-end',
  chapter: '结尾',
  scene: 'flat',
  title: '谢谢',
  noTitle: true,
  html: `
    <i class="fl-blob t-yellow abs" data-beat="0" style="left:1240px;top:440px;width:540px"></i>
    <i class="fl-art abs" data-fl-art="gaiwan" data-beat="0" style="left:1300px;top:624px;width:420px"></i>
    <i class="fl-art abs" data-fl-art="steam" data-beat="0" data-delay=".5" style="left:1445px;top:500px;width:130px"></i>
    <i class="fl-art abs" data-fl-art="spark" data-beat="0" style="left:1700px;top:330px;width:44px"></i>
    <div class="fl-bubble abs" data-beat="0" style="left:150px;top:220px;--fl-tx:70px"><p>水温对了，茶就<em class="key">不苦</em></p></div>
    <p class="fl-pill t-yellow abs t-flat-end-thanks" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="happy" data-mascot-say="谢谢！" style="left:170px;top:676px">谢谢大家，欢迎提问</p>
    <div class="mascot guide" data-face="left" style="left:1150px;top:800px"></div>`,
  notes: [
    { beat: 0, key: '不苦', say: '最后只记一句：水温对了，茶就不苦。' },
    { beat: 1, say: '谢谢大家，有问题现在可以问。' },
  ],
});
