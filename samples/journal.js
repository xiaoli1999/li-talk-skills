/* =====================================================================
   像素手账 journal 自己的样板页（虚构主题：怎么泡好一杯茶）
   - 内容和通用样板（samples.js）对应：封面、要备的三样东西、泡茶三步、三个坑、三个数、收尾金句；
     版式全按一本手账来：封面是一本牛皮纸手账（标签纸写书名），里面一页一种手账的记法——
     贴纸页（三样东西，招牌页）、打卡表（泡茶三步，招牌页）、口袋里抽出的索引卡（三个坑）、涂色记录格（三个数）、贴在便签上的一句话（收尾）
   - 每拍是手在本子上动：贴纸从贴纸页上揭下来贴好、纸胶带撕一截压住、印章「咚」地盖下去、打勾、拿彩笔一格一格涂满、字一行行写出来。
     这些动作做在手账自有的组件（.jn-*，用法见 scenes/journal.js 开头）里，页面只写结构和 data-beat，不写 onBeat、不写 data-in
   - 像素只留给形象（点点）、形象说话的对话框和右上角的节拍格；纸、字、贴纸、印章都是手绘手账
   - 可读性（翻到最后一拍整页要一眼读清）：
     · 讲过的都留在本子上：贴纸、印章、卡片、涂好的格子不收走；贴纸页上揭走的只是复制品
     · 一页一条阅读路径：从上往下一行行（贴纸页、记录格），或者从左往右一列列（打卡表、索引卡），编号就是顺序
     · 句子横排；有字的贴纸、卡片歪不超过 2°；胶带、印章只压纸角和空白，不压字；一页的荧光带不超过 3 处
     · 贴纸、卡片、印章是包装，真话（白瓷的最好、热水把盖碗烫一遍、水太烫就晾到八十度）都直接写成字
   - 组件只在像素手账里有样子（换成别的风格就是几个普通的框）：这几页只给 scene: 'journal' 用
   - 抄一页过去：id 换成 p〈讲稿页号〉，samples/journal.css 里同一页的 [data-id="t-journal-…"] 一起换；字照讲稿改；改完跑 check --browser
   - 同一拍里的先后用 data-delay 排（一拍的动作引擎会压在约 1.2 秒内）
   ===================================================================== */

/* 封面：一本牛皮纸手账的封面。左边书脊、右边一根松紧带，正中贴一张双线框的标签纸写书名和副题，两道纸胶带压住标签的上角，
   封面上还随手贴着三枚小圆贴纸（爱心、星星、茶叶）。1 拍：讲者一行写在标签底下，旁边「咚」地盖一枚茶杯印章，点点跳到印章旁边高兴一下。
   为什么是手账：手账本的第一眼就是封面——牛皮纸、松紧带、自己写的标签、随手贴的贴纸、盖个章；比一行大字更像「这是我的本子」。
   可读性：字都在白色标签纸上，一条路从上往下读——书名 → 副题 → 讲者；强调只有书名里的「泡好」一处。
   抄过去改：书名（7 个字以内一行；字多了把 .t-journal-cover-title 的字号改成 84px）、副题、讲者一行；
   印章图标 data-jn-icon 可换 cup、leaf、kettle、heart、check；小圆贴纸换 data-jn-art */
Deck.add({
  id: 't-journal-cover',
  chapter: '开场',
  scene: 'journal',
  title: '怎么泡好一杯茶',
  noTitle: true,
  html: `
    <div class="jn-book abs" style="left:330px;top:110px;width:1260px;height:860px"><i class="jn-band" style="right:72px"></i></div>
    <div class="jn-sticker jn-mini abs t-pink" style="left:462px;top:172px;--r:-8deg"><i class="jn-art" data-jn-art="heart"></i></div>
    <div class="jn-sticker jn-mini abs t-yellow" style="left:458px;top:764px;--s:112px;--r:10deg"><i class="jn-art" data-jn-art="star"></i></div>
    <div class="jn-sticker jn-mini abs t-mint" style="left:1020px;top:790px;--s:118px;--r:-6deg"><i class="jn-art" data-jn-art="leaf"></i></div>
    <div class="jn-label abs" style="left:540px;top:330px;width:820px;height:384px">
      <p class="t-journal-cover-title">怎么<em class="key">泡好</em>一杯茶</p>
      <p class="t-journal-cover-sub">水温、茶量、时间，三件事讲清楚</p>
      <p class="t-journal-cover-me" data-beat="1">讲者：〈你的名字〉 · 〈日期〉</p>
    </div>
    <i class="jn-tape abs" data-beat="0" data-delay=".35" style="left:500px;top:316px;width:176px;--r:-34deg"></i>
    <i class="jn-tape jn-mint abs" data-beat="0" data-delay=".5" style="left:1232px;top:316px;width:176px;--r:32deg"></i>
    <i class="jn-stamp abs" data-beat="1" data-delay=".45" data-jn-icon="cup" data-mascot="1" data-mascot-side="right" data-mascot-dx="-6" data-mascot-pose="happy" style="left:1250px;top:620px;--s:168px;--r:-12deg"></i>
    <div class="mascot guide" style="left:1636px;top:836px"></div>`,
  notes: [
    { beat: 0, key: '泡好', say: '大家好，今天聊一件小事：怎么泡好一杯茶。' },
    { beat: 1, say: '我是〈你的名字〉，平时爱喝茶，也踩过不少坑。' },
  ],
});

/* 贴纸页（要备的三样东西，招牌页）：右边是一张贴纸底纸，上面印着三张模切贴纸（盖碗、茶叶、水壶，各带手写名字）；
   左边是手账的这一页。第 0 拍：一句话解释写出来，底纸上三张贴纸都在。第 1–3 拍：每拍一张贴纸从底纸上揭起来（略放大、影子变大），
   沿一道弧飞到左边这一行、按平，一截纸胶带撕下来压住它的左上角，再在右边写一行说明（前面一个随手画的箭头指回贴纸）；
   底纸上那一格只剩模切线和底纸。点点每拍跳到刚写好的那行说明右边。
   为什么是手账：手账最常见的动作就是从贴纸本上揭一张贴到本子上、贴完压一截胶带、旁边写一句；
   贴纸本身就是「这样东西长什么样」，名字写在贴纸上，说明写在旁边，比三张卡片更像在本子上记东西。
   可读性：从上往下一行一张，左贴纸、右说明；三句说明都横排写在本子上一直留着；荧光带三处（白瓷、三克、八十度）。
   抄过去改：贴纸里的小图（data-jn-art）和名字（6 个字以内）、说明（14 个字以内）；颜色类换 t-yellow / t-mint / t-blue / t-pink。
   行数 2 到 4 行：每行占 226px（贴纸 290×172，大小在 samples/journal.css），底纸上的格子（.jn-slot）和左边的贴纸放在同样的高度（贴纸就横着飞过去），
   data-jn-from 和 data-jn-slot 写成同一个名字 */
Deck.add({
  id: 't-journal-stickers',
  chapter: '一、准备',
  topic: '要备的三样东西',
  scene: 'journal',
  title: '泡茶之前，备齐三样东西',
  html: `
    <p class="explain" data-beat="0"><b>盖碗</b>：带盖的小茶碗，泡茶、闻香、出汤都用它</p>
    <div class="jn-sheet abs" style="left:1410px;top:248px;width:390px;height:728px">
      <div class="jn-slot" data-jn-slot="cup" style="left:50px;top:70px"></div>
      <div class="jn-slot" data-jn-slot="leaf" style="left:50px;top:296px"></div>
      <div class="jn-slot" data-jn-slot="kettle" style="left:50px;top:522px"></div>
    </div>
    <div class="jn-sticker abs t-blue" data-beat="1" data-jn-from="cup" style="left:150px;top:318px;--r:-1.5deg">
      <i class="jn-art" data-jn-art="gaiwan"></i><b>一只盖碗</b>
      <i class="jn-tape" style="left:-46px;top:-6px;width:130px;--r:-40deg"></i>
    </div>
    <p class="abs t-journal-stickers-note" data-beat="1" data-delay=".7" data-mascot="1" data-mascot-side="right" style="left:500px;top:376px"><i class="jn-arw"></i><em class="key">白瓷</em>的最好，看得清茶色</p>
    <div class="jn-sticker abs t-mint" data-beat="2" data-jn-from="leaf" style="left:150px;top:544px;--r:1.2deg">
      <i class="jn-art" data-jn-art="leaf"></i><b><em class="key">三克</em>绿茶</b>
      <i class="jn-tape jn-pink" style="left:-46px;top:-6px;width:130px;--r:-40deg"></i>
    </div>
    <p class="abs t-journal-stickers-note" data-beat="2" data-delay=".7" data-mascot="2" data-mascot-side="right" style="left:500px;top:602px"><i class="jn-arw"></i>大约铺满碗底薄薄一层</p>
    <div class="jn-sticker abs t-yellow" data-beat="3" data-jn-from="kettle" style="left:150px;top:770px;--r:-1deg">
      <i class="jn-art" data-jn-art="kettle"></i><b>一壶热水</b>
      <i class="jn-tape jn-mint" style="left:-46px;top:-6px;width:130px;--r:-40deg"></i>
    </div>
    <p class="abs t-journal-stickers-note" data-beat="3" data-delay=".7" data-mascot="3" data-mascot-side="right" style="left:500px;top:828px"><i class="jn-arw"></i>烧开后晾到<em class="key">八十度</em></p>
    <div class="mascot guide" style="left:1248px;top:846px"></div>`,
  notes: [
    { beat: 0, key: '盖碗', say: '动手之前先备齐东西。盖碗就是带盖的小茶碗，泡、闻、倒都用它。' },
    { beat: 1, key: '白瓷', say: '第一样是盖碗，白瓷的最好，茶汤什么颜色一眼就看清。' },
    { beat: 2, key: '三克', say: '第二样是茶叶，三克就够，大约铺满碗底薄薄一层。' },
    { beat: 3, key: '八十度', say: '第三样是热水。水烧开后别急，晾到八十度左右再用。' },
  ],
});

/* 打卡表（泡茶三步，招牌页）：手账里的打卡格。一张手画的表，三列是三步（表头写「① 温杯」「② 投茶」「③ 注水」），
   中间一排是打卡格（一圈淡虚线等着盖章），底下一排写备注；表的两个上角压着纸胶带。
   第 0 拍：表和表头都在（打卡表是先写好要做的事，做完一件盖一个章）。第 1–3 拍：每拍这一列的打卡格「咚」地盖下一枚印章
   （温杯是茶杯、投茶是茶叶、注水是水壶），印泥洇开一圈，接着在下面写一行备注；点点跳到这一列底下。
   第 3 拍最后一条可复制的命令写在表下面，两头压两截胶带。
   为什么是手账：打卡表是手账的看家本领——事先列好、做完盖章；「盖到第几个章」一眼就知道讲到第几步，比三张卡片翻出来更像手账。
   可读性：从左往右一列一步，编号就是顺序；每一步做什么（热水把盖碗烫一遍……）直接写在备注里；印章只盖在打卡格里，不压字；
   荧光带三处（烫一遍、三克、八十度）。
   抄过去改：表头的步骤名（4 个字以内）、备注（10 个字以内）、印章图标（data-jn-icon）；
   步数 2 到 4 步：列宽改成 1620 ÷ 步数，表线（svg.sketch 里的竖线）、表头、打卡格、备注的 left 一起按列宽排 */
Deck.add({
  id: 't-journal-tracker',
  chapter: '二、动手',
  topic: '泡茶三步',
  scene: 'journal',
  title: '泡一杯绿茶，只要三步',
  html: `
    <i class="abs t-journal-tracker-head" style="left:150px;top:256px;width:1620px;height:120px"></i>
    <svg class="sketch">
      <rect x="150" y="256" width="1620" height="514"/>
      <line x1="690" y1="256" x2="690" y2="770"/><line x1="1230" y1="256" x2="1230" y2="770"/>
      <line x1="150" y1="376" x2="1770" y2="376"/><line x1="150" y1="650" x2="1770" y2="650"/>
    </svg>
    <i class="jn-tape abs" data-beat="0" data-delay=".3" style="left:108px;top:228px;width:150px;--r:-32deg"></i>
    <i class="jn-tape jn-pink abs" data-beat="0" data-delay=".45" style="left:1662px;top:228px;width:150px;--r:30deg"></i>
    <p class="abs center t-journal-tracker-th" style="left:150px;top:284px;width:540px"><b class="jn-no">1</b>温杯</p>
    <p class="abs center t-journal-tracker-th" style="left:690px;top:284px;width:540px"><b class="jn-no">2</b>投茶</p>
    <p class="abs center t-journal-tracker-th" style="left:1230px;top:284px;width:540px"><b class="jn-no">3</b>注水</p>
    <i class="jn-spot abs" style="left:322px;top:415px;--s:196px"></i>
    <i class="jn-spot abs" style="left:862px;top:415px;--s:196px"></i>
    <i class="jn-spot abs" style="left:1402px;top:415px;--s:196px"></i>
    <i class="jn-stamp abs" data-beat="1" data-jn-icon="cup" style="left:322px;top:415px;--s:196px;--r:-9deg"></i>
    <p class="abs center t-journal-tracker-td" data-beat="1" data-delay=".4" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".367" data-mascot-dy="34" style="left:150px;top:676px;width:540px">热水把盖碗<em class="key">烫一遍</em></p>
    <i class="jn-stamp abs" data-beat="2" data-jn-icon="leaf" style="left:862px;top:415px;--s:196px;--r:7deg"></i>
    <p class="abs center t-journal-tracker-td" data-beat="2" data-delay=".4" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".367" data-mascot-dy="34" style="left:690px;top:676px;width:540px"><em class="key">三克</em>茶叶铺满碗底</p>
    <i class="jn-stamp abs" data-beat="3" data-jn-icon="kettle" style="left:1402px;top:415px;--s:196px;--r:-5deg"></i>
    <p class="abs center t-journal-tracker-td" data-beat="3" data-delay=".4" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".367" data-mascot-dy="34" style="left:1230px;top:676px;width:540px"><em class="key">八十度</em>水沿碗边倒</p>
    <button class="copy abs" type="button" data-beat="3" data-delay=".7" style="left:150px;top:862px" data-copy="tea brew --green --temp 80">tea brew --green --temp 80</button>
    <i class="jn-tape jn-mint abs" data-beat="3" data-delay=".95" style="left:124px;top:846px;width:96px;--r:-24deg"></i>
    <div class="mascot guide" data-face="left" style="left:1640px;top:818px"></div>`,
  notes: [
    { beat: 0, key: '三步', say: '东西备齐了，泡一杯绿茶其实只要三步。我把它画成一张打卡表，做完一步盖一个章。' },
    { beat: 1, key: '温杯', say: '第一步温杯：热水把盖碗里外烫一遍，倒掉。' },
    { beat: 2, key: '投茶', say: '第二步投茶：三克茶叶放进去，铺满碗底就行。' },
    { beat: 3, key: '注水', say: '第三步注水：八十度的水沿着碗边慢慢倒。懒得记的话，下面这行命令点一下就能复制。' },
  ],
});

/* 口袋里抽出的索引卡（别踩的三个坑）：页面底下贴着一只牛皮纸口袋（背面高出一截、正面一道拇指缺口和一圈缝线，左上角一截胶带把它粘在本子上，
   右下角一枚星星小贴纸），点点站在口袋旁边。
   第 1–3 拍：每拍从口袋里抽出一张索引卡——卡片先从口袋口往上抽出来，再移到上面这一排自己的位置、摆到自己的角度，
   最后在卡片下半截那行「怎么破」后面打一个绿勾；点点跳到这张卡底下。
   卡片上半截是坑（前面一个红叉：水太烫），一道箭头往下，下半截是破法（晾到八十度 ✓）。三张卡从左往右排开一直留着。
   为什么是手账：手账页上常贴一只小口袋，收着票根、卡片；「坑」收在口袋里，讲一个抽一张，比一排警示牌更像自己的本子。
   可读性：从左往右三张，每张从上往下读「坑 → 破法」；坑和破法都是横排的字，叉和勾只是记号；荧光带三处（八十度、一分钟、三克）。
   抄过去改：每张卡的坑（6 个字以内）和破法（8 个字以内）；张数 2 到 4 张：卡宽改成（1620 − 间距）÷ 张数，
   口袋放在卡片下面居中（口袋的 data-jn-pocket 和每张卡的 data-jn-from 写成同一个名字） */
Deck.add({
  id: 't-journal-pits',
  chapter: '二、动手',
  topic: '别踩的三个坑',
  scene: 'journal',
  title: '泡茶别踩这三个坑',
  html: `
    <div class="jn-pocket abs" data-jn-pocket="pits" style="left:700px;top:760px;width:520px;height:200px"></div>
    <i class="jn-tape jn-mint abs" style="left:660px;top:742px;width:130px;--r:-36deg"></i>
    <div class="jn-sticker jn-mini abs t-yellow t-journal-pits-star" style="left:1124px;top:866px;--s:96px;--r:12deg"><i class="jn-art" data-jn-art="star"></i></div>
    <div class="jn-card abs" data-beat="1" data-jn-from="pits" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".356" style="left:150px;top:290px;width:500px;--r:-1.5deg">
      <p class="t-journal-pits-bad"><i class="jn-cross"></i>水太烫</p>
      <p class="t-journal-pits-to"><i class="jn-arw jn-down"></i></p>
      <p class="t-journal-pits-good">晾到<em class="key">八十度</em><i class="jn-tick"></i></p>
    </div>
    <div class="jn-card abs" data-beat="2" data-jn-from="pits" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".356" style="left:710px;top:290px;width:500px;--r:1deg">
      <p class="t-journal-pits-bad"><i class="jn-cross"></i>泡太久</p>
      <p class="t-journal-pits-to"><i class="jn-arw jn-down"></i></p>
      <p class="t-journal-pits-good"><em class="key">一分钟</em>出汤<i class="jn-tick"></i></p>
    </div>
    <div class="jn-card abs" data-beat="3" data-jn-from="pits" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".356" style="left:1270px;top:290px;width:500px;--r:-1deg">
      <p class="t-journal-pits-bad"><i class="jn-cross"></i>茶太多</p>
      <p class="t-journal-pits-to"><i class="jn-arw jn-down"></i></p>
      <p class="t-journal-pits-good">只放<em class="key">三克</em><i class="jn-tick"></i></p>
    </div>
    <div class="mascot guide" data-face="left" style="left:1250px;top:836px"></div>`,
  notes: [
    { beat: 0, key: '三个坑', say: '泡茶最怕三个坑。我把它们收在这个小口袋里，讲一个抽一张。' },
    { beat: 1, key: '八十度', say: '第一个坑是水太烫，滚水一冲茶就苦。办法是先晾到八十度。' },
    { beat: 2, key: '一分钟', say: '第二个坑是泡太久，茶会发涩。一分钟左右就出汤。' },
    { beat: 3, key: '三克', say: '第三个坑是茶放太多，味道太浓。只放三克就好。' },
  ],
});

/* 涂色记录格（三个数）：手账里「喝水记录」那种涂色格。三行，每行左边写记的是什么，中间一排空格子，右边写出数：
   水温是一支横放的温度计（10 节，一节十度），茶量是一排五片叶子（一片一克），时间是一圈 12 格的钟面（涂满一圈 = 一分钟）；
   格子和数之间一道点线连着，像菜单。第 1–3 拍：每拍拿彩笔把这一行一格一格涂过去（温度计涂到第 8 节、叶子涂 3 片、钟面涂满一圈），
   涂完在右边写出这个数；点点跳到这个数右边。
   为什么是手账：手账爱用「涂一格记一格」的记录格（喝水、睡觉、运动），涂到哪一格就是多少，数字不用讲观众也看得懂。
   可读性：从上往下一行一个数，每行从左往右「记什么 → 涂到哪 → 多少」；大数字是实色手写字，荧光带三处就是这三个数。
   抄过去改：每行的名字（2–4 个字）、格数 data-jn-n 和涂几格 data-jn-k、右边的数和单位；
   格子换样子用 data-jn-cell（tube 温度计、leaf 叶子、box 方格）；一圈的就用 .jn-clock */
Deck.add({
  id: 't-journal-numbers',
  chapter: '三、记住',
  topic: '三个数',
  scene: 'journal',
  title: '记住三个数',
  html: `
    <p class="abs t-journal-numbers-lab" style="left:150px;top:316px">水温</p>
    <div class="jn-meter abs" data-jn-n="10" data-jn-cell="tube" style="left:372px;top:306px"><i class="jn-ink" data-beat="1" data-jn-k="8"></i></div>
    <i class="jn-dots abs" style="left:1166px;top:356px;width:80px"></i>
    <p class="abs t-journal-numbers-num" data-beat="1" data-delay=".7" data-mascot="1" data-mascot-side="right" style="left:1270px;top:282px"><em class="key">80</em><small>℃</small></p>
    <p class="abs t-journal-numbers-lab" style="left:150px;top:536px">茶量</p>
    <div class="jn-meter abs" data-jn-n="5" data-jn-cell="leaf" style="left:372px;top:534px"><i class="jn-ink" data-beat="2" data-jn-k="3"></i></div>
    <i class="jn-dots abs" style="left:1022px;top:576px;width:224px"></i>
    <p class="abs t-journal-numbers-num" data-beat="2" data-delay=".5" data-mascot="2" data-mascot-side="right" style="left:1270px;top:502px"><em class="key">3</em><small>克</small></p>
    <p class="abs t-journal-numbers-lab" style="left:150px;top:756px">时间</p>
    <div class="jn-clock abs" style="left:372px;top:708px;--s:176px"><i class="jn-ink" data-beat="3"></i></div>
    <i class="jn-dots abs" style="left:582px;top:796px;width:664px"></i>
    <p class="abs t-journal-numbers-num" data-beat="3" data-delay=".8" data-mascot="3" data-mascot-side="right" style="left:1270px;top:722px"><em class="key">1</em><small>分钟</small></p>
    <div class="mascot guide" data-face="left" style="left:1660px;top:840px"></div>`,
  notes: [
    { beat: 0, key: '三个数', say: '最后把要记的浓缩成三个数，像手账里的记录格，涂一格记一格。' },
    { beat: 1, key: '80℃', say: '水温八十度：温度计涂到第八节。' },
    { beat: 2, key: '3 克', say: '茶量三克：五片叶子涂三片。' },
    { beat: 3, key: '1 分钟', say: '时间一分钟：钟面涂满一圈就出汤。' },
  ],
});

/* 便签上的一句话（结尾）：一张从线圈本上撕下来的便签（顶上一排穿孔、一圈虚线内框），两角压着纸胶带，金句手写在正中，右下角贴一枚茶杯小圆贴纸；
   点点坐在便签的上沿。1 拍：点点跳到便签下面，旁边弹出一个像素对话框「谢谢大家，欢迎提问」，点点高兴一下。
   为什么是手账：手账一页的最后常常贴一张便签写今天的一句话；像素对话框是这个风格唯一的像素，留给形象说「谢谢」。
   可读性：金句 96px 实色手写，强调只有「不苦」一处；对话框只放一句致谢，不放要点。
   抄过去改：金句（12 个字以内一行）、对话框里的致谢；署名由引擎自动加在最后一页底部（y 990 以下别放字） */
Deck.add({
  id: 't-journal-end',
  chapter: '结尾',
  scene: 'journal',
  title: '谢谢',
  noTitle: true,
  html: `
    <div class="jn-memo abs" style="left:300px;top:246px;width:1320px;height:372px">
      <p class="t-journal-end-quote" data-beat="0">水温对了，茶就<em class="key">不苦</em></p>
    </div>
    <i class="jn-tape abs" data-beat="0" data-delay=".3" style="left:254px;top:226px;width:180px;--r:-30deg"></i>
    <i class="jn-tape jn-pink abs" data-beat="0" data-delay=".45" style="left:1486px;top:226px;width:180px;--r:30deg"></i>
    <div class="jn-sticker jn-mini abs t-pink" style="left:1478px;top:520px;--s:150px;--r:9deg"><i class="jn-art" data-jn-art="cup"></i></div>
    <p class="jn-say abs" data-beat="1" data-mascot="1" data-mascot-side="left" data-mascot-dx="-34" data-mascot-pose="happy" style="left:900px;top:770px">谢谢大家，欢迎提问</p>
    <div class="mascot guide" style="left:1180px;top:126px"></div>`,
  notes: [
    { beat: 0, key: '不苦', say: '最后只记一句：水温对了，茶就不苦。' },
    { beat: 1, say: '谢谢大家，有问题现在可以问。' },
  ],
});
