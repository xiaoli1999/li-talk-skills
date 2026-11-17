/* =====================================================================
   蓝图 blueprint 自己的样板页（虚构主题：怎么泡好一杯茶）
   - 内容和通用样板（samples.js）大致对应：封面、要备的三样东西、泡茶三步、收尾金句；另加一页别踩的三个坑。
     版式全按工程图纸来，一页一种图纸上才有的东西：
     t-blueprint-cover 图纸标题栏（封面）、t-blueprint-parts 装配清单（三样东西，招牌页）、
     t-blueprint-flow 工艺流程图（泡茶三步，招牌页）、t-blueprint-revise 修订记录（三个坑）、t-blueprint-end 圆规作图（收尾）
   - 每拍「发生了什么」是画图纸的事：线一笔描出来、引出线拉到编号圈、圆规画一圈、尺寸线从中间往两头伸、明细表一格格填上、
     修订云线圈住问题。这些动作由蓝图的版式组件（.bp-*，写法见 scenes/blueprint.js 开头）自己完成，
     页面里只写结构和 data-beat，不写 onBeat、不写 data-in
   - 可读性（翻到最后一拍整页要一眼读清）：
     · 真话直接写在表格、框、铭牌里（「白瓷的最好，看得清茶色」「水太烫 → 晾到八十度」），编号圈、尺寸线、云线只是包装
     · 一条阅读路径：图上的编号圈 1、2、3 和明细表的序号一一对上；流程从左往右顺着箭头走；修订条从上往下按 1、2、3 排
     · 讲过的只由引擎退一点；只有当前这一拍的编号转橙（编号圈 / 工序号 / 修订三角；装配图上的编号圈和表里同一行的序号一起转），
       重点词（橙色双下划线）一页不超过 2 处
     · 线稿不压字：图在一边、字在另一边，尺寸数值自带深蓝底；格名、表头这类注释小字只留必要的几个字
   - 组件只在蓝图里有样子（换成别的风格会乱）：这几页只给 scene: 'blueprint' 用，不进通用样册
   - 抄一页过去：id 换成 p〈讲稿页号〉，samples/blueprint.css 里同一页的 [data-id="t-blueprint-…"] 一起换；字照讲稿改；
     坐标都是舞台坐标（1920×1080）；线稿图 svg.bp-fig 的 viewBox 和显示宽高写成一样（1:1），线宽才不缩放
   ===================================================================== */

/* 图纸标题栏（封面）：一张图纸的样子。左边是一只盖碗的半剖视图（左半外形、右半剖开打剖面线，中间一道点划中心线），
   右边是一张大号的标题栏：图名（大标题）、说明（副标题）、比例、设计人、日期五格。
   第 0 拍：图一笔笔描出来（像绘图仪），标题栏描框、伸出格线、填上图名和说明；
   1 拍：设计人、日期两格写上（像在图纸上签名），圈圈走到标题栏下面高兴一下。
   为什么是蓝图：每张工程图右下角都有标题栏，封面就是「这张图叫什么、谁画的」，和课件封面的作用一样；剖视图是图纸最典型的画法。
   可读性：图在左、字在右，不叠；格名是浅青小字，内容是白字；讲者写进「设计人」一格，日期一格。
   抄过去改：图名（112px 一行最多 7 个字，多了把 .cv-name b 的字号调小）、说明（一行 18 个字以内）、设计人、日期；
   比例一格可以换成「图号」之类别的格名；不要图就删掉 svg，标题栏往左挪到页面中间 */
Deck.add({
  id: 't-blueprint-cover',
  chapter: '开场',
  scene: 'blueprint',
  title: '怎么泡好一杯茶',
  noTitle: true,
  html: `
    <svg class="bp-fig abs" data-beat="0" viewBox="0 0 560 520" style="left:170px;top:262px;width:560px;height:520px" aria-hidden="true">
      <path class="cl" d="M280 48V508"/>
      <path d="M254 112L257 86Q280 74 303 86L306 112"/>
      <path d="M126 200C134 148 200 114 280 112C360 114 426 148 434 200"/>
      <path d="M112 200H448"/>
      <path d="M118 200C122 320 182 398 230 408V440H330V408C378 398 438 320 442 200"/>
      <path d="M280 440C200 440 96 434 40 424L36 432C86 450 160 458 222 460L226 474H334L338 460C400 458 474 450 524 432L520 424C464 434 360 440 280 440"/>
      <path class="t" d="M280 126C352 128 410 156 418 200"/>
      <path class="t" d="M428 200C424 316 372 386 326 396H280"/>
      <path class="c" d="M284 262H419"/>
      <path class="h" d="M280 79Q292 79 303 86L306 112H280Z"/>
      <path class="h" d="M280 112C360 114 426 148 434 200H418C410 156 352 128 280 126Z"/>
      <path class="h" d="M442 200C438 320 378 398 330 408V440H280V396H326C372 386 424 316 428 200Z"/>
      <path class="h" d="M280 440C360 440 464 434 520 424L524 432C474 450 400 458 338 460L334 474H280Z"/>
    </svg>
    <div class="bp-tblock abs cv-tb" data-beat="0" style="left:860px;top:300px;width:940px">
      <div class="bp-c cv-name"><i>图名</i><b>怎么泡好一杯茶</b></div>
      <div class="bp-c cv-sub"><i>说明</i><b>水温、茶量、时间，三件事讲清楚</b></div>
      <div class="bp-c"><i>比例</i><b>1 : 1</b></div>
      <div class="bp-c" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".5" data-mascot-pose="happy"><i>设计人</i><b data-beat="1">〈你的名字〉</b></div>
      <div class="bp-c"><i>日期</i><b data-beat="1">〈日期〉</b></div>
    </div>
    <div class="mascot guide" data-face="right" style="left:706px;top:632px"></div>`,
  notes: [
    { beat: 0, key: '泡好', say: '大家好，今天这张图纸只画一件小事：怎么泡好一杯茶。水温、茶量、时间，三件事讲清楚。' },
    { beat: 1, say: '设计人是我，〈你的名字〉，平时爱喝茶，也踩过不少坑。' },
  ],
});

/* 装配清单（招牌页）：左边是三样东西的部件分解图——盖碗沿一道点划中心线拆开（盖子悬在上面、茶叶落在中间、碗和茶托在下面），
   热水壶立在旁边，一道虚线从壶嘴指进碗里；右边是一张明细表（序号、名称、数量、说明），空表第 0 拍就在。
   每拍：图上的一样东西拉出一根引出线、圆规画一个编号圈（1、2、3），右边明细表填上同一个序号的一行（扫线划过、各格从左往右写上）。
   当前这一行的序号圈和图上的编号圈一起转橙；讲过的行只由引擎退一点，三行最后都在。
   为什么是蓝图：装配图 = 分解图 + 编号圈 + 明细表，是工程图纸介绍「由哪几样组成」的标准画法；编号圈把图和表一一连起来。
   可读性：图在左、表在右，引出线不交叉；名称、数量、说明都写在表里（真话），编号圈只是索引；重点词两处（三克、八十度）。
   抄过去改：明细表每行的名称、数量、说明（说明 36px 一行最多 11 个字）；行数改了同时改 --rows；
   编号圈的位置（left、top，用 px）和 data-to（引出线落在零件上的点，舞台坐标）；换图就换 svg.bp-fig 里的图形
   （这张图的坐标 = 舞台坐标 - (130, 310)），注意引出线别穿过别的零件 */
Deck.add({
  id: 't-blueprint-parts',
  chapter: '一、准备',
  topic: '要备的三样东西',
  scene: 'blueprint',
  title: '泡茶之前，备好三样东西',
  html: `
    <p class="explain" data-beat="0"><b>盖碗</b>：带盖的小茶碗，泡茶、闻香、出汤都用它</p>
    <svg class="bp-fig abs" data-beat="0" viewBox="0 0 800 740" style="left:130px;top:310px;width:800px;height:740px" aria-hidden="true">
      <path class="cl" d="M290 18V572"/>
      <path class="t" d="M40 551H752"/>
      <path class="c" d="M70 551l-14 14M110 551l-14 14M150 551l-14 14M190 551l-14 14M230 551l-14 14M270 551l-14 14M310 551l-14 14M350 551l-14 14M390 551l-14 14M430 551l-14 14M470 551l-14 14M510 551l-14 14M550 551l-14 14M590 551l-14 14M630 551l-14 14M670 551l-14 14M710 551l-14 14M750 551l-14 14"/>
      <g transform="translate(66 -20) scale(.8)" style="stroke-width:3.75">
        <path d="M254 112L257 86Q280 74 303 86L306 112"/>
        <path class="s" d="M126 200C134 148 200 114 280 112C360 114 426 148 434 200Z"/>
        <path class="t" d="M280 126C352 128 410 156 418 200"/>
        <path class="h" d="M280 79Q292 79 303 86L306 112H280Z"/>
        <path class="h" d="M280 112C360 114 426 148 434 200H418C410 156 352 128 280 126Z"/>
      </g>
      <g transform="translate(290 226)">
        <g transform="translate(-44 -12) rotate(18)"><path class="s" d="M-30 0C-16 -12 16 -12 30 0C16 12 -16 12 -30 0Z"/><path class="t" d="M-24 0H24"/></g>
        <g transform="translate(30 -20) rotate(-24)"><path class="s" d="M-30 0C-16 -12 16 -12 30 0C16 12 -16 12 -30 0Z"/><path class="t" d="M-24 0H24"/></g>
        <g transform="translate(-6 22) rotate(-6)"><path class="s" d="M-30 0C-16 -12 16 -12 30 0C16 12 -16 12 -30 0Z"/><path class="t" d="M-24 0H24"/></g>
        <g transform="translate(52 22) rotate(28)"><path class="s" d="M-30 0C-16 -12 16 -12 30 0C16 12 -16 12 -30 0Z"/><path class="t" d="M-24 0H24"/></g>
      </g>
      <g transform="translate(66 171) scale(.8)" style="stroke-width:3.75">
        <path class="s" d="M118 200C122 320 182 398 230 408V440H330V408C378 398 438 320 442 200Z"/>
        <path d="M112 200H448"/>
        <path class="s" d="M280 440C200 440 96 434 40 424L36 432C86 450 160 458 222 460L226 474H334L338 460C400 458 474 450 524 432L520 424C464 434 360 440 280 440"/>
        <path class="t" d="M428 200C424 316 372 386 326 396H280"/>
        <path class="h" d="M442 200C438 320 378 398 330 408V440H280V396H326C372 386 424 316 428 200Z"/>
        <path class="h" d="M280 440C360 440 464 434 520 424L524 432C474 450 400 458 338 460L334 474H280Z"/>
      </g>
      <path class="s" d="M540 470C506 462 486 440 474 412L488 405C500 430 516 446 546 450Z"/>
      <path class="s" d="M532 551C514 494 522 430 562 400H678C718 430 726 494 708 551Z"/>
      <path d="M572 400C576 380 596 372 620 372C644 372 664 380 668 400"/>
      <circle cx="620" cy="362" r="9"/>
      <path d="M566 402C564 352 676 352 674 402"/>
      <path class="t" d="M540 500H700"/>
      <path class="hid" d="M478 398C466 356 428 334 390 337"/>
      <path class="c" d="M402 328L388 337L402 347"/>
    </svg>
    <b class="bp-ball abs" data-beat="1" data-to="516,399" style="left:890px;top:512px">1</b>
    <b class="bp-ball abs" data-beat="2" data-to="500,562" style="left:890px;top:632px">2</b>
    <b class="bp-ball abs" data-beat="3" data-to="846,810" style="left:890px;top:752px">3</b>
    <div class="bp-table abs pt-table" data-beat="0" style="left:980px;top:420px;width:820px;--cols:90px 140px 140px 1fr;--rows:3">
      <div class="bp-th"><i>序号</i><i>名称</i><i>数量</i><i>说明</i></div>
      <div class="bp-tr" data-beat="1"><i class="bp-no">1</i><b>盖碗</b><span>一只</span><span>白瓷的最好，看得清茶色</span></div>
      <div class="bp-tr" data-beat="2"><i class="bp-no">2</i><b>绿茶</b><span><em class="key">三克</em></span><span>大约铺满碗底薄薄一层</span></div>
      <div class="bp-tr" data-beat="3"><i class="bp-no">3</i><b>热水</b><span>一壶</span><span>烧开后晾到<em class="key">八十度</em></span></div>
    </div>
    <div class="mascot guide" data-face="right" style="left:92px;top:722px"></div>`,
  notes: [
    { beat: 0, key: '盖碗', say: '动手之前先备齐东西，这是一张装配图。盖碗就是带盖的小茶碗，泡、闻、倒都用它。' },
    { beat: 1, key: '盖碗', say: '一号件是盖碗，一只，白瓷的最好，茶汤什么颜色一眼就看清。' },
    { beat: 2, key: '三克', say: '二号件是茶叶，三克就够，大约铺满碗底薄薄一层。' },
    { beat: 3, key: '八十度', say: '三号件是热水。水烧开后别急，晾到八十度左右再用。' },
  ],
});

/* 工艺流程图（招牌页）：泡茶三步画成一张标准流程图——左边一个起点圆点，箭头连着三个工序框（温杯 → 投茶 → 注水），
   最后到一个圆头的起止框「出汤」；框下面是尺寸标注：投茶 3 g、注水 80℃，注水到出汤这一段箭头标 60 s（时间当成长度来标）。
   每拍：上一个框伸出一支箭头 → 这一个工序框一笔描出来、左上角的工序号弹出、名字和说明写上 → 尺寸界线往下伸、尺寸线从中间往两头伸、数值写出来。
   第 4 拍画到出汤，左下角出一块可复制命令的铭牌，复制时审图章盖进右下角图签栏的「审核」格。圈圈每拍站到当前这一框的上面。
   为什么是蓝图：工序框 + 箭头是工艺流程图，框下的尺寸标注是图纸标参数的老办法，比横排三张卡片更像「按图施工」。
   可读性：一条路从左往右；每框写全「做什么」（热水把盖碗烫一遍），参数单独标在框下；当前这一框的工序号转橙；重点词一处（80℃）。
   抄过去改：工序名（56px，4 个字以内）、说明（34px，一行 8 个字以内）、尺寸数值（4 个字符以内）；
   框、箭头、尺寸标注都写死 left / width：工序框宽 330，箭头接在两框之间，尺寸标注的 left、width 和它标的框或箭头一样；
   多一步就照着加一组箭头 + 框（+ 尺寸），整排宽 1680 以内；图签栏的讲者写在 data-speaker */
Deck.add({
  id: 't-blueprint-flow',
  chapter: '二、动手',
  topic: '泡茶三步',
  scene: 'blueprint',
  title: '泡一杯绿茶，只要三步',
  html: `
    <svg class="bp-fig abs" data-beat="0" viewBox="0 0 40 40" style="left:130px;top:450px;width:40px;height:40px" aria-hidden="true">
      <circle class="t" cx="20" cy="20" r="17"/><circle class="dot" cx="20" cy="20" r="10"/>
    </svg>
    <i class="bp-arrow abs" data-beat="1" style="left:170px;top:458px;width:50px"></i>
    <div class="bp-box abs flow-box" data-beat="1" data-mascot="1" data-mascot-side="top" style="left:220px;top:370px"><i class="bp-no">01</i><b>温杯</b><span>热水把盖碗烫一遍</span></div>
    <i class="bp-arrow abs" data-beat="2" style="left:550px;top:458px;width:100px"></i>
    <div class="bp-box abs flow-box" data-beat="2" data-mascot="2" data-mascot-side="top" style="left:650px;top:370px"><i class="bp-no">02</i><b>投茶</b><span>三克茶叶铺满碗底</span></div>
    <i class="bp-dim abs flow-dim" data-beat="2" style="left:650px;width:330px"><b>3 g</b></i>
    <i class="bp-arrow abs" data-beat="3" style="left:980px;top:458px;width:100px"></i>
    <div class="bp-box abs flow-box" data-beat="3" data-mascot="3" data-mascot-side="top" style="left:1080px;top:370px"><i class="bp-no">03</i><b>注水</b><span>八十度水沿碗边倒</span></div>
    <i class="bp-dim abs flow-dim" data-beat="3" style="left:1080px;width:330px"><b><em class="key">80℃</em></b></i>
    <i class="bp-arrow abs" data-beat="4" style="left:1410px;top:458px;width:180px"></i>
    <i class="bp-dim abs flow-dim" data-beat="4" style="left:1410px;width:180px"><b>60 s</b></i>
    <div class="bp-box end abs flow-end" data-beat="4" data-mascot="4" data-mascot-side="top" data-mascot-dy="-8" style="left:1590px;top:405px"><b>出汤</b></div>
    <button class="abs copy" type="button" data-beat="4" data-delay=".5" style="left:220px;top:812px" data-copy="tea brew --green --temp 80">tea brew --green --temp 80</button>
    <div class="bp-titleblock" data-speaker="〈你的名字〉"></div>
    <div class="mascot guide" style="left:88px;top:316px"></div>`,
  notes: [
    { beat: 0, key: '三步', say: '东西备齐了，泡一杯绿茶其实只要三步，我们按这张流程图走。' },
    { beat: 1, key: '温杯', say: '第一步温杯：热水把盖碗里外烫一遍，倒掉。' },
    { beat: 2, key: '投茶', say: '第二步投茶：三克茶叶放进去，铺满碗底就行。' },
    { beat: 3, key: '80℃', say: '第三步注水：八十度的水沿着碗边慢慢倒。' },
    { beat: 4, key: '60 s', say: '注完水等一分钟就出汤。懒得记的话，左下角这行命令点一下就能复制。' },
  ],
});

/* 修订记录（别踩的三个坑）：图纸改版时的修订条。三条从上往下排，每条一行：修订三角（1、2、3）→ 一个小图标（温度计、秒表、茶叶堆）
   → 一圈修订云线圈住问题（水太烫）→ 箭头 → 双线框的铭牌写着改法（晾到八十度）。
   每拍出一条：三角弹出 → 图标一笔描出 → 云线像圆规一样从 12 点钟方向绕一圈、问题写出 → 箭头伸出 → 铭牌描框、改法写出。
   当前这一条的修订三角转橙，圈圈站到这一条的右头。
   为什么是蓝图：图纸上改过的地方用云线圈出来、旁边标一个修订三角，是工程图纸记录「哪里错了、改成什么」的规矩。
   可读性：问题和改法都直接写全（水太烫 → 晾到八十度），不让观众自己翻译图标；一行一条，从上往下按 1、2、3 读；
   三条最后都在；这一页不另加重点词，改法本身就是铭牌里最醒目的字。
   抄过去改：每条的问题（云线里，56px 3 到 4 个字）、改法（铭牌里，56px 6 个字以内）、图标（换 svg.bp-fig 里的图形，120×120）；
   云线、铭牌写死了宽（.rv-cloud、.rv-ok），三条才对齐成三列；条数 2 到 4 条，每条约 160 高，从上往下隔 210 */
Deck.add({
  id: 't-blueprint-revise',
  chapter: '二、动手',
  topic: '别踩的三个坑',
  scene: 'blueprint',
  title: '别踩的三个坑',
  html: `
    <div class="bp-fix abs" data-beat="1" data-mascot="1" data-mascot-side="right" style="left:250px;top:318px">
      <b class="bp-rev">1</b>
      <svg class="bp-fig" viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">
        <path class="s" d="M48 82V22A12 12 0 0 1 72 22V82A20 20 0 1 1 48 82Z"/>
        <path class="c" style="stroke-width:7" d="M60 96V24"/>
        <path class="t" d="M80 26H92M80 40H88M80 54H92M80 68H88"/>
        <path class="c" d="M22 52Q14 42 22 32T22 12M34 58Q26 48 34 38T34 18"/>
      </svg>
      <span class="bp-cloud rv-cloud">水太烫</span>
      <i class="bp-arrow rv-arrow"></i>
      <span class="bp-ok rv-ok">晾到八十度</span>
    </div>
    <div class="bp-fix abs" data-beat="2" data-mascot="2" data-mascot-side="right" style="left:250px;top:528px">
      <b class="bp-rev">2</b>
      <svg class="bp-fig" viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">
        <path d="M50 12H70M60 12V24M92 34L100 26"/>
        <circle class="s" cx="60" cy="68" r="42"/>
        <path class="t" d="M60 32V40M60 96V104M24 68H32M88 68H96M35 43L40 48M85 43L80 48M35 93L40 88M85 93L80 88"/>
        <path d="M60 68L80 46"/>
        <circle class="dot" cx="60" cy="68" r="5"/>
      </svg>
      <span class="bp-cloud rv-cloud">泡太久</span>
      <i class="bp-arrow rv-arrow"></i>
      <span class="bp-ok rv-ok">一分钟出汤</span>
    </div>
    <div class="bp-fix abs" data-beat="3" data-mascot="3" data-mascot-side="right" style="left:250px;top:738px">
      <b class="bp-rev">3</b>
      <svg class="bp-fig" viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">
        <path class="s" d="M10 86C10 76 34 72 60 72C86 72 110 76 110 86C110 100 88 108 60 108C32 108 10 100 10 86Z"/>
        <g transform="translate(40 66) rotate(-18)"><path class="s" d="M-20 0C-10 -9 10 -9 20 0C10 9 -10 9 -20 0Z"/><path class="t" d="M-15 0H15"/></g>
        <g transform="translate(78 64) rotate(20)"><path class="s" d="M-20 0C-10 -9 10 -9 20 0C10 9 -10 9 -20 0Z"/><path class="t" d="M-15 0H15"/></g>
        <g transform="translate(58 50) rotate(-4)"><path class="s" d="M-20 0C-10 -9 10 -9 20 0C10 9 -10 9 -20 0Z"/><path class="t" d="M-15 0H15"/></g>
        <g transform="translate(44 32) rotate(26)"><path class="s" d="M-20 0C-10 -9 10 -9 20 0C10 9 -10 9 -20 0Z"/><path class="t" d="M-15 0H15"/></g>
        <g transform="translate(76 30) rotate(-28)"><path class="s" d="M-20 0C-10 -9 10 -9 20 0C10 9 -10 9 -20 0Z"/><path class="t" d="M-15 0H15"/></g>
        <g transform="translate(60 14) rotate(8)"><path class="s" d="M-20 0C-10 -9 10 -9 20 0C10 9 -10 9 -20 0Z"/><path class="t" d="M-15 0H15"/></g>
      </svg>
      <span class="bp-cloud rv-cloud">茶太多</span>
      <i class="bp-arrow rv-arrow"></i>
      <span class="bp-ok rv-ok">只放三克</span>
    </div>
    <div class="mascot guide" data-face="left" style="left:1660px;top:750px"></div>`,
  notes: [
    { beat: 0, say: '泡茶最常见的三个坑，我按改图纸的办法标出来：哪里错了，改成什么。' },
    { beat: 1, key: '八十度', say: '第一处：水太烫，滚水一冲茶就苦。改成先晾到八十度。' },
    { beat: 2, key: '一分钟', say: '第二处：泡太久，茶会发涩。改成一分钟左右就出汤。' },
    { beat: 3, key: '三克', say: '第三处：茶放太多，味道太浓。改成只放三克。' },
  ],
});

/* 圆规作图（结尾）：圈圈是一只圆规，最后一页它画一个大圆：圆规的一条腿绕着转一圈，圆从 12 点钟方向画出来，
   四周伸出四截点划中心线，金句两行写在圆里。1 拍：右边写出「谢谢大家，欢迎提问」，下面一道尺寸线似的基线，圈圈高兴地说谢谢。
   署名由引擎自动加在右下角。
   为什么是蓝图：用圆规作图是制图的基本功，也正好是形象圈圈的本事；圆 + 中心线把一句话「框定」成这张图纸的结论。
   可读性：金句白字写在圆里，中心线只从圆外伸进来一点，不穿过字；重点词一处（不苦）。
   抄过去改：金句两行以内（100px 一行最多 5 个字）、致谢的字；圆的大小改 .bp-ring 的宽高（正方形）；y 990 以下留给署名 */
Deck.add({
  id: 't-blueprint-end',
  chapter: '结尾',
  scene: 'blueprint',
  title: '谢谢',
  noTitle: true,
  html: `
    <div class="bp-ring abs ed-ring" data-beat="0" style="left:300px;top:150px;width:780px;height:780px">
      <p class="ed-quote">水温对了，<br>茶就<em class="key">不苦</em></p>
    </div>
    <p class="abs ed-thanks" data-beat="1" data-mascot="1" data-mascot-side="top" data-mascot-x=".82" data-mascot-dy="-14" data-mascot-pose="happy" data-mascot-say="谢谢！">谢谢大家，欢迎提问</p>
    <div class="mascot guide" data-face="left" style="left:1120px;top:300px"></div>`,
  notes: [
    { beat: 0, key: '不苦', say: '最后只记一句：水温对了，茶就不苦。' },
    { beat: 1, say: '谢谢大家，有问题现在可以问。' },
  ],
});
