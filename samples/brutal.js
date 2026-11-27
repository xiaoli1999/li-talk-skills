/* =====================================================================
   新粗野主义 brutal 自己的样板页（虚构主题：怎么泡好一杯茶）
   - 内容和通用样板（samples.js）大致对应：封面、要备的三样东西、泡茶三步、收尾金句；
     另加两页只有粗野主义做得出来的招牌页：海报大字（第 4 页，特写八十度）、禁止清单（第 5 页，别踩的三个坑）
   - 版式全按新粗野主义来：粗黑边、无模糊的硬投影、黄粉蓝三色撞色、超大字；版面像一张张实心的块拼起来，不是一排三张一样大的卡片。
     封面是一张挂着绳子的价签，三样东西拼成大小不一的色块格，三步是三级墨色台阶，特写是错版的海报，三个坑是三块警示牌，结尾是一颗大按钮
   - 每拍「发生了什么」是粗野主义的事：块直直砸下来、落地时颜色错开半截再硬切到位（色块压印）、编号和叉号像图章一样盖下、
     色带和台阶一格一格硬切出来、海报大字带着位移砰地撞进来、大光标飞过来把按钮按进阴影。
     这些动作由新粗野主义风格的版式组件（.bz-*，写法见 scenes/brutal.js 开头）自己完成，页面里只写结构和 data-beat，不写 onBeat、不写风格专用的 data-in
   - 可读性（翻到最后一拍整页要一眼读清）：
     · 字只压在实色上：墨字压黄、粉、蓝、奶白，奶黄字压墨色；点阵和斜纹只铺在没有字的地方
     · 每页一条阅读路径：色块格按编号 01、02、03，台阶从左下往右上一级一级，警示牌从左往右；有字的块歪不超过 2°（--r 在 ±2deg 以内）
     · 超大字只给 8 个字以内的海报词和数字（「先晾到」「80℃」）；说明一律 34px 以上的实色字
     · 讲过的不藏：色块、步骤、警示牌讲完都留着；一页的重点词贴纸不超过 3 个
   - 组件只在新粗野主义里有样子（换成别的风格会乱）：这几页只给 scene: 'brutal' 用，不进通用样册
   - 抄一页过去：id 换成 p〈讲稿页号〉，samples/brutal.css 里同一页的 [data-id="t-brutal-…"] 一起换；字照讲稿改；
     坐标都是舞台坐标（1920×1080），块的大小写死时先按字数算一下放不放得下，改完跑 check --browser
   ===================================================================== */

/* 封面：一张挂着绳子的大价签（黄底、尖角、打孔、条形码），整块一道硬投影，微微歪着；价签上是大标题、一道粗墨线、副标题。
   1 拍：一张粉色的标签贴「啪」地拍在价签右下角，写讲者和日期，砰砰跳到标签贴上高兴一下。
   为什么是粗野主义：价签、标签贴是最粗粝的「商品标签」——粗描边、硬投影、实色、条形码，一眼就是新粗野主义的撞色贴纸感。
   可读性：价签只歪 1.5°；大标题、副标题都是墨字压实色黄；条形码只是装饰，不写数字。
   抄过去改：大标题（132px 一行最多 8 个字，超了把 .cv-title 的字号调小）、副标题（52px 一行 20 个字以内）、标签贴的字；
   价签的宽高写死（尖角按高度画），字多了把价签加宽，右边别超出 x 1560（右上角留给形象） */
Deck.add({
  id: 't-brutal-cover',
  chapter: '开场',
  scene: 'brutal',
  title: '怎么泡好一杯茶',
  noTitle: true,
  html: `
    <div class="bz-tag t-yellow abs" data-beat="0" style="left:250px;top:200px;width:1290px;height:610px;--r:-1.5deg">
      <i class="bz-string"></i>
      <p class="abs cv-title">怎么<em class="key">泡好</em>一杯茶</p>
      <i class="bz-rule" style="left:172px;top:262px;width:1060px"></i>
      <p class="abs cv-sub">水温、茶量、时间，三件事讲清楚</p>
      <i class="bz-bars" style="left:172px;top:430px;width:420px;height:116px"></i>
    </div>
    <p class="bz-sticker t-pink abs" data-beat="1" data-mascot="1" data-mascot-side="top" data-mascot-x=".86" data-mascot-pose="happy" style="left:860px;top:730px;--r:1.5deg">讲者：〈你的名字〉 · 〈日期〉</p>
    <div class="mascot guide" data-face="left" style="left:1610px;top:300px"></div>`,
  notes: [
    { beat: 0, key: '泡好', say: '大家好，今天聊一件小事：怎么泡好一杯茶。' },
    { beat: 1, say: '我是〈你的名字〉，平时爱喝茶，也踩过不少坑。' },
  ],
});

/* 要备的三样东西：便当盒式的色块格。左边一块竖长的黄格放盖碗，右上一块粉格放茶叶，右下一块横长的蓝格放热水；
   右上角一小块墨色点阵格是砰砰待的地方。每格左上角一枚编号图章（01、02、03），里面一张简笔插画、名字和一句说明。
   一拍砸下一格：白框直直砸下来 → 落地时颜色错开半截印上去、下一格硬切到位 → 编号盖下 → 插画蹦出、字弹起，已经落定的格子被震一下。
   为什么是粗野主义：大小不一的实色格子拼成一整块、粗黑边加硬投影、撞色，是新粗野主义网页最典型的「便当盒」版式。
   可读性：编号就是阅读顺序（01 左边大格 → 02 右上 → 03 右下）；字都是墨字压实色；点阵只铺在没有字的形象格里；重点词 3 个。
   抄过去改：每格的编号、插画（data-bz-art：gaiwan、scale、kettle）、名字、一句说明；格子的位置和大小（格子之间留 40px，
   宽格的说明一行最多 (格宽 − 插画宽 − 110) ÷ 36 个字）；换了格子大小记得挪插画（插画不压字） */
Deck.add({
  id: 't-brutal-list',
  chapter: '一、准备',
  topic: '要备的三样东西',
  scene: 'brutal',
  title: '泡茶之前，备好三样东西',
  html: `
    <p class="explain" data-beat="0"><b>盖碗</b>：带盖的小茶碗，泡茶、闻香、出汤都用它</p>
    <div class="bz-tile t-yellow abs" data-beat="1" data-mascot="1" data-mascot-side="stay" style="left:120px;top:290px;width:620px;height:660px">
      <b class="bz-no">01</b>
      <i class="bz-art" data-bz-art="gaiwan" style="left:104px;top:92px;width:400px"></i>
      <h3>一只<em class="key">盖碗</em></h3><p>白瓷的最好，看得清茶色</p>
    </div>
    <div class="bz-tile t-pink abs" data-beat="2" data-mascot="2" data-mascot-side="stay" style="left:780px;top:290px;width:700px;height:300px">
      <b class="bz-no">02</b>
      <i class="bz-art" data-bz-art="scale" style="right:32px;top:52px;width:230px"></i>
      <h3><em class="key">三克</em>绿茶</h3><p>大约铺满碗底薄薄一层</p>
    </div>
    <div class="bz-tile bz-dots abs" style="left:1520px;top:290px;width:280px;height:300px"></div>
    <div class="bz-tile t-blue abs" data-beat="3" data-mascot="3" data-mascot-side="stay" style="left:780px;top:630px;width:1020px;height:320px">
      <b class="bz-no">03</b>
      <i class="bz-art" data-bz-art="kettle" style="right:64px;top:30px;width:260px"></i>
      <h3>一壶热水</h3><p>烧开后晾到<em class="key">八十度</em></p>
    </div>
    <div class="mascot guide" data-face="left" style="left:1578px;top:363px"></div>`,
  notes: [
    { beat: 0, key: '盖碗', say: '动手之前先备齐东西。盖碗就是带盖的小茶碗，泡、闻、倒都用它。' },
    { beat: 1, key: '盖碗', say: '第一样是盖碗，白瓷的最好，茶汤什么颜色一眼就看清。' },
    { beat: 2, key: '三克', say: '第二样是茶叶，三克就够，大约铺满碗底薄薄一层。' },
    { beat: 3, key: '八十度', say: '第三样是热水。水烧开后别急，晾到八十度左右再用。' },
  ],
});

/* 泡茶三步：三级墨色实心台阶从左下往右上升起（顶上的踏面黄、粉、蓝），每级台阶的立面上印着一个大号数字 1、2、3，就是步骤的序号。
   第 0 拍台阶一格格从地面升起，砰砰站在第一级上；每拍：这一级的数字错开半截印上去、硬切到位，这一步的色块从上面砸到台阶顶上、
   颜色压印、字弹起，砰砰跳上这一步的色块。第 3 拍最高一级的立面下方再出一行可复制的命令（黄色硬投影）。
   为什么是粗野主义：一步一个台阶，用实心的墨块直接把「往上走」造出来；超大数字、实心黑块配撞色块，是粗野主义的重量感。
   可读性：数字就是顺序，台阶从左下往右上只有一条路；步骤的字都是墨字压实色；台阶上的数字是序号、属于台阶这张图，不算强调，
   讲过也不退（data-recede="off"，退了黄字压墨块会发闷）；讲过的步骤块照常退到 .8；重点词 3 个。
   抄过去改：每步的名字（64px，一块 400 宽放 5 个字）和一句说明（36px 一行 9 个字以内）；
   台阶的位置：左右挨着、底边都在 y 980，顶一级比一级高 180；步骤块用 bottom 定位（= 1080 − 台阶顶的 y），底边正好落在台阶顶上 */
Deck.add({
  id: 't-brutal-steps',
  chapter: '二、动手',
  topic: '泡茶三步',
  scene: 'brutal',
  title: '泡一杯绿茶，只要三步',
  html: `
    <div class="bz-riser t-yellow abs" data-beat="0" style="left:120px;top:800px;width:480px;height:180px">
      <b class="bz-num" data-beat="1" data-recede="off" style="--bz-nf:150px;left:36px;top:34px">1</b>
    </div>
    <div class="bz-riser t-pink abs" data-beat="0" style="left:600px;top:620px;width:480px;height:360px">
      <b class="bz-num" data-beat="2" data-recede="off" style="--bz-nf:290px;left:36px;top:46px">2</b>
    </div>
    <div class="bz-riser t-blue abs" data-beat="0" style="left:1080px;top:440px;width:720px;height:540px">
      <b class="bz-num" data-beat="3" data-recede="off" style="--bz-nf:360px;left:40px;top:50px">3</b>
    </div>
    <div class="bz-step t-yellow abs" data-beat="1" data-mascot="1" data-mascot-side="top" data-mascot-x=".5" style="left:150px;bottom:280px;width:420px">
      <h3><em class="key">温杯</em></h3><p>热水把盖碗烫一遍</p>
    </div>
    <div class="bz-step t-pink abs" data-beat="2" data-mascot="2" data-mascot-side="top" data-mascot-x=".5" style="left:630px;bottom:460px;width:420px">
      <h3><em class="key">投茶</em></h3><p>三克茶叶铺满碗底</p>
    </div>
    <div class="bz-step t-blue abs" data-beat="3" data-mascot="3" data-mascot-side="right" data-mascot-dy="20" style="left:1110px;bottom:640px;width:460px">
      <h3><em class="key">注水</em></h3><p>八十度水沿碗边倒</p>
    </div>
    <button class="copy bz-lit abs" type="button" data-beat="3" style="left:1120px;top:870px" data-copy="tea brew --green --temp 80">tea brew --green --temp 80</button>
    <div class="mascot guide" style="left:300px;top:646px"></div>`,
  notes: [
    { beat: 0, key: '三步', say: '东西备齐了，泡一杯绿茶其实只要三步，一步一个台阶。' },
    { beat: 1, key: '温杯', say: '第一步温杯：热水把盖碗里外烫一遍，倒掉。' },
    { beat: 2, key: '投茶', say: '第二步投茶：三克茶叶放进去，铺满碗底就行。' },
    { beat: 3, key: '注水', say: '第三步注水：八十度的水沿着碗边慢慢倒。懒得记的话，下面这行命令点一下就能复制。' },
  ],
});

/* 海报大字（招牌页）：一页只讲一件事的街头海报。左上一块黄色海报色块写「先晾到」，下面一块更大的粉色色块写「80℃」，
   两块合起来占了大半个屏；每块的粗黑框都错开 22px，像套印没对准。右边一块蓝色色块是横排的副文，最下面一条横贯整页的墨色色带
   把三个数连起来。每拍：第 0 拍「先晾到」从旁边砰地撞进来；第 1 拍「80℃」带着位移撞进来，黑框被撞得错开一大截再弹回、
   整块抖两下；第 2 拍副文的色块砸下、颜色压印；第 3 拍色带从左往右一格格硬切出来。
   为什么是粗野主义：超大字、错位的粗黑框、撞色色块、满版色带，是新粗野主义海报的语言；一个数字占半屏，只有这种风格敢这么排。
   可读性：超大字只有「先晾到」「80℃」两处（8 个字以内）；错开的是框不是字，字离框线 40px 以上；副文横排、三行；
   阅读顺序上到下：先晾到 → 80℃ → 右边副文 → 底下色带。
   抄过去改：两块海报字（各 8 个字以内；字多了把 .ps-a、.ps-b 的字号调小，色块会跟着字变大变小）、副文（64px 一行 6 个字以内）、
   色带的三项（50px，三项加起来 30 个字以内）。这页不画大标题（noTitle），title 照样写，演讲者视图和阅读模式要用 */
Deck.add({
  id: 't-brutal-poster',
  chapter: '二、动手',
  topic: '特写：先晾到八十度',
  scene: 'brutal',
  title: '先晾到 80℃',
  noTitle: true,
  html: `
    <p class="bz-slab t-yellow abs ps-a" data-beat="0" style="left:120px;top:124px;--r:-1deg">先晾到</p>
    <p class="bz-slab t-pink abs ps-b" data-beat="1" data-recede="off" data-mascot="1" data-mascot-side="stay" style="left:220px;top:444px;--r:1deg">80<small>℃</small></p>
    <div class="bz-tile t-blue abs ps-c" data-beat="2" data-mascot="2" data-mascot-side="top" data-mascot-x=".5" style="left:1330px;top:452px;width:470px">
      <p>开水别急，<br>晾到<em class="key">八十度</em><br>再冲茶</p>
    </div>
    <p class="bz-band abs" data-beat="3" style="left:-40px;right:-40px;top:924px;--r:-1deg"><span>水温 80℃</span><i></i><span>茶量 3 克</span><i></i><span>时间 1 分钟</span></p>
    <div class="mascot guide" data-face="left" style="left:1520px;top:230px"></div>`,
  notes: [
    { beat: 0, say: '这一页只讲一句话：先晾一晾。' },
    { beat: 1, key: '80℃', say: '晾到多少度？八十度。这是绿茶最舒服的水温。' },
    { beat: 2, key: '八十度', say: '开水别急着冲，晾到八十度再冲。绿茶娇嫩，沸水一冲就烫熟了，还发苦。' },
    { beat: 3, say: '把三个数连起来记：水温八十度，茶量三克，时间一分钟。' },
  ],
});

/* 禁止清单（招牌页）：三块粗框警示牌从左往右排开。第 0 拍只有三个虚线槽位；每拍一块警示牌从高处砸进槽里（落地压进阴影、
   甩出冲击线、旁边已经落定的牌子被震一下），然后：顶上的黄黑警示条硬切出来 → 粉色面板弹起、黑色叉号图章盖下（错的做法）→
   粗箭头往下切出 → 对的做法弹起、蓝色对勾图章盖下。砰砰每拍跑到这块牌子底下。
   为什么是粗野主义：警示牌就是最粗暴的平面——黄黑斜纹、实心叉号、粗箭头、超粗描边加硬投影，一拍「砸下」一块，冲击感最强。
   可读性：坑和破法都直接写在牌子上（水太烫 → 晾到八十度），一直留着；错的做法不划线，叉号图章已经说明它是错的；
   三块从左往右一条线；牌子歪不超过 1.5°；重点词 3 个，都在对的做法上。
   抄过去改：每块牌子的坑（84px 一行 3–4 个字）和破法（56px 一行 6 个字以内）；牌子和槽位的位置大小要一致（写死宽高），
   牌子之间留 90px；坑多一个就加一个槽位和一块牌子，三块以上把宽度缩到 380 */
Deck.add({
  id: 't-brutal-donts',
  chapter: '二、动手',
  topic: '别踩的三个坑',
  scene: 'brutal',
  title: '别踩这三个坑',
  html: `
    <i class="bz-slot" style="left:120px;top:290px;width:500px;height:480px"></i>
    <i class="bz-slot" style="left:710px;top:290px;width:500px;height:480px"></i>
    <i class="bz-slot" style="left:1300px;top:290px;width:500px;height:480px"></i>
    <div class="bz-sign abs" data-beat="1" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".335" style="left:120px;top:290px;width:500px;height:480px;--r:-1.5deg">
      <i class="bz-haz"></i>
      <div class="bz-bad"><i class="bz-x"></i><b>水太烫</b></div>
      <i class="bz-down"></i>
      <p class="bz-fix"><i class="bz-ok"></i><span>晾到<em class="key">八十度</em></span></p>
    </div>
    <div class="bz-sign abs" data-beat="2" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".335" style="left:710px;top:290px;width:500px;height:480px;--r:1deg">
      <i class="bz-haz"></i>
      <div class="bz-bad"><i class="bz-x"></i><b>泡太久</b></div>
      <i class="bz-down"></i>
      <p class="bz-fix"><i class="bz-ok"></i><span><em class="key">一分钟</em>出汤</span></p>
    </div>
    <div class="bz-sign abs" data-beat="3" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".335" style="left:1300px;top:290px;width:500px;height:480px;--r:-.8deg">
      <i class="bz-haz"></i>
      <div class="bz-bad"><i class="bz-x"></i><b>茶太多</b></div>
      <i class="bz-down"></i>
      <p class="bz-fix"><i class="bz-ok"></i><span>只放<em class="key">三克</em></span></p>
    </div>
    <div class="mascot guide" style="left:290px;top:790px"></div>`,
  notes: [
    { beat: 0, key: '三个坑', say: '最后说三个最常见的坑，踩一个茶就不好喝。' },
    { beat: 1, key: '八十度', say: '第一个坑，水太烫：开水直接冲，茶会苦。晾到八十度再冲。' },
    { beat: 2, key: '一分钟', say: '第二个坑，泡太久：泡久了也苦。一分钟左右就出汤。' },
    { beat: 3, key: '三克', say: '第三个坑，茶太多：味道太冲。一个盖碗只放三克。' },
  ],
});

/* 结尾：左上是两行超大的收尾金句（逐字砸下来，「不苦」贴一块奶白贴纸），下面一颗超大的粉色按钮「谢谢大家，欢迎提问」；
   右边一块蓝色的问号气泡贴纸（第 0 拍拍上来），砰砰站在上面。
   1 拍：按钮砸下来、颜色压印，一只大光标从右下飞过来按下去，按钮被按进阴影再弹回，光标尖上甩出冲击线；砰砰在右边说谢谢。署名由引擎自动加在右下角。
   为什么是粗野主义：粗野主义来自网页，超大的实心按钮加硬投影就是它的招牌；「按下按钮 = 开始提问」把收尾做成一次互动。
   可读性：金句墨字直接写在奶黄底上，160px 两行；按钮上的字 66px 墨字压粉；光标落在按钮的右下角，不压字。
   抄过去改：金句（160px 一行最多 7 个字，两行以内）、按钮的字（66px 一行 12 个字以内）；光标的位置跟着按钮挪
   （光标尖在它自己左上角往里 12px，落在按钮右下角的空处）；y 990 以下留给署名，别放东西 */
Deck.add({
  id: 't-brutal-end',
  chapter: '结尾',
  scene: 'brutal',
  title: '谢谢',
  noTitle: true,
  html: `
    <p class="quote abs ed-quote" data-beat="0" style="left:120px;top:190px;width:1200px">水温对了，<br>茶就<em class="key">不苦</em></p>
    <div class="bz-btn t-pink abs" data-beat="1" data-mascot="1" data-mascot-side="stay" data-mascot-pose="happy" data-mascot-say="谢谢！" style="left:120px;top:690px">谢谢大家，欢迎提问<i></i></div>
    <i class="bz-cursor abs" data-beat="1" style="left:896px;top:812px"></i>
    <b class="bz-ask t-blue abs" data-beat="0" style="left:1420px;top:520px;--r:2deg">?</b>
    <div class="mascot guide" data-face="left" style="left:1487px;top:368px"></div>`,
  notes: [
    { beat: 0, key: '不苦', say: '最后只记一句：水温对了，茶就不苦。' },
    { beat: 1, say: '谢谢大家，有问题现在可以问。' },
  ],
});
