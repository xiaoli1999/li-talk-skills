/* =====================================================================
   漫画 comic 自己的样板页：同一个虚构主题「怎么泡好一杯茶」，按一本漫画的各种分镜重新排
   - 和通用样板（samples.js）内容大致对应，版式全换成漫画里的画面：
     t-comic-cover 扉页（封面）、t-comic-items 主角登场（要备的三样东西）、t-comic-strip 四格漫画（泡茶三步，招牌页）、
     t-comic-ngok 错误示范和正确示范（别踩的三个坑，招牌页）、t-comic-end 最后一格「完」（收尾金句）
   - 每拍「发生了什么」是画漫画、看漫画的事：分格的毛笔墨线一条条甩出来、蓝铅笔草稿格上墨、集中线往里收、插画一笔笔描出来、
     拟声大字砰地砸下、对白气泡从尾巴那头冒出来、漫符（汗滴、阴沉线、闪光）弹出来、最后盖一个「完」字章。
     这些动作由漫画的版式组件（.cm-*）自己完成，页面里只写结构和 data-beat，不写 onBeat、不写 data-in
   - 可读性：漫画是包装，真话直接写在格子里——东西的名字写在旁白框里、说明横排在下面，每一步的做法写在对白气泡里，
     坑和破法分别写在上下两排格子的旁白框里；气泡、旁白框讲完一直留着，不轮换。拟声字、漫符、集中线只是装饰，
     不压字（集中线用 data-cm-burst-box 挡在字外面），拟声字墨黑或钴蓝，朱红只给重点词。
     一页一条阅读路径：格号 1、2、3 就是顺序，从左到右、从上到下；翻到每页最后一拍，整页信息完整
   - 组件只在漫画里有样子（换成别的风格会乱）：这几页只给 scene: 'comic' 用，不进通用样册
   - 抄过去时：id 换成 p〈讲稿页号〉，samples/comic.css 里对应的 [data-id="t-comic-…"] 一起换；字照讲稿改；
     坐标都是舞台坐标（1920×1080），斜格的点、格子里的子元素是格子自己的坐标；版式组件的用法见 scenes/comic.js 开头的说明
   ===================================================================== */

/* 扉页（封面）：一话漫画开头的扉页。两格斜着分开——左格是「第 1 话」和粗墨大字标题、下面一个旁白框写副题；
   右格一圈集中线收向冒着热气的盖碗。第 0 拍左格的墨线先甩出来、标题砸下，右格跟着画出来；
   1 拍：最下面一条横格画出来，讲者一行写在里面，叨叨从格子空处醒来、跑到讲者旁边高兴一下。
   为什么适合：漫画每一话的第一页就是扉页，「第几话 + 大标题 + 一幅主角画」正是封面要做的事；斜着的分格线是漫画最有辨识度的样子。
   可读性：左格从上往下读（第 1 话 → 标题 → 副题），标题是 7 个字的装饰大字，副题、讲者都是实色横排；集中线只在右格（没有字）。
   抄过去改哪里：话数、标题（.cm-logo 两行，一行 4 个字以内，8 个字以内才用这种字效）、副题、讲者；
   斜格的点（data-cm-cut，格子自己的坐标）改了要让两格之间的缝一样宽（这里横着量 40）；插画换 data-cm-art */
Deck.add({
  id: 't-comic-cover',
  chapter: '开场',
  scene: 'comic',
  title: '怎么泡好一杯茶',
  noTitle: true,
  html: `
    <div class="cm-cut abs" data-beat="0" data-cm-cut="0,0 1030,0 880,650 0,650" style="left:120px;top:118px;width:1030px;height:650px">
      <span class="cm-cap ink abs t-comic-cover-ep" style="left:60px;top:50px">第 1 话</span>
      <p class="cm-logo abs" style="left:54px;top:132px">怎么<em class="key">泡好</em><br>一杯茶</p>
      <p class="cm-cap abs" style="left:60px;top:532px">水温、茶量、时间，三件事讲清楚</p>
    </div>
    <div class="cm-cut abs" data-beat="0" data-delay=".25" data-cm-cut="150,0 760,0 760,650 0,650" data-cm-burst="410,350,215" style="left:1040px;top:118px;width:760px;height:650px">
      <i class="cm-art abs" data-cm-art="cover" style="left:170px;top:120px;width:480px"></i>
    </div>
    <div class="cm-cut abs" data-beat="1" data-cm-cut="0,0 1680,0 1680,150 0,150" style="left:120px;top:806px;width:1680px;height:150px">
      <p class="abs t-comic-cover-me" data-mascot="1" data-mascot-side="right" data-mascot-pose="happy" style="left:64px;top:46px">讲者：〈你的名字〉 · 〈日期〉</p>
    </div>
    <div class="mascot guide" data-pose="rest" data-face="left" style="left:1560px;top:812px"></div>`,
  notes: [
    { beat: 0, key: '泡好', say: '大家好，今天聊一件小事：怎么泡好一杯茶。' },
    { beat: 1, say: '我是〈你的名字〉，平时爱喝茶，也踩过不少坑。' },
  ],
});

/* 主角登场（要备的三样东西）：三格斜格从左到右排开，像漫画里一个个角色登场。开场只有大标题和一句旁白（盖碗是什么）；
   每拍画出一格：墨线甩出来 → 集中线往里收 → 这样东西一笔笔描出来 → 名牌旁白框横切进来 → 说明弹出来 → 格子角上砸下一个小拟声字
   （叮！、沙沙、呼～），叨叨跑到这一格下面。
   为什么适合：「出发前备齐三样东西」讲成三个主角依次登场，集中线、名牌、破格的拟声字都是漫画登场画面的老套路；
   三格的分格线一正一反地斜，比三张一样的卡片有动感。
   可读性：名字写在旁白框里、说明横排在下面，讲完一直留着；格号 1、2、3 就是顺序；集中线只铺在插画四周（data-cm-burst-box 挡在名牌上面），
   重点词三处（白瓷、三克、八十度），拟声字墨黑、小一号。
   抄过去改哪里：每格的插画（data-cm-art）、名字（4 个字以内）、说明（两行，一行 6 个字以内）、拟声字（3 个字以内）；
   斜格的点：相邻两格的斜边要平行、横着量隔 36（这里 P1 右边 680→620，P2 左边 716→656）；字离斜边至少 30 */
Deck.add({
  id: 't-comic-items',
  chapter: '一、准备',
  topic: '要备的三样东西',
  scene: 'comic',
  title: '泡茶之前，三样东西登场',
  html: `
    <p class="explain" data-beat="0"><b>盖碗</b>：带盖的小茶碗，泡茶、闻香、出汤都用它</p>
    <div class="cm-cut abs" data-beat="1" data-cm-cut="0,0 560,0 500,540 0,540" data-cm-burst="270,166,122" data-cm-burst-box="0,0,560,312"
      data-mascot="1" data-mascot-side="bottom" data-mascot-x=".26" style="left:120px;top:284px;width:560px;height:540px">
      <i class="cm-art abs" data-cm-art="gaiwan" style="left:135px;top:50px;width:270px"></i>
      <p class="cm-sfx ink sm abs" style="left:380px;top:-30px;--r:8deg">叮！</p>
      <p class="cm-cap abs" style="left:36px;top:326px"><b class="cm-no">1</b>一只盖碗</p>
      <p class="abs t-comic-items-txt" style="left:42px;top:412px"><em class="key">白瓷</em>的最好，<br>看得清茶色</p>
    </div>
    <div class="cm-cut abs" data-beat="2" data-cm-cut="60,0 548,0 608,540 0,540" data-cm-burst="304,166,122" data-cm-burst-box="0,0,608,312"
      data-mascot="2" data-mascot-side="bottom" data-mascot-x=".26" style="left:656px;top:284px;width:608px;height:540px">
      <i class="cm-art abs" data-cm-art="sprig" style="left:189px;top:52px;width:230px"></i>
      <p class="cm-sfx ink sm abs" style="left:360px;top:-30px;--r:-7deg">沙沙</p>
      <p class="cm-cap abs" style="left:64px;top:326px"><b class="cm-no">2</b><em class="key">三克</em>绿茶</p>
      <p class="abs t-comic-items-txt" style="left:70px;top:412px">大约铺满碗底<br>薄薄一层</p>
    </div>
    <div class="cm-cut abs" data-beat="3" data-cm-cut="0,0 560,0 560,540 60,540" data-cm-burst="282,182,128" data-cm-burst-box="0,0,560,312"
      data-mascot="3" data-mascot-side="bottom" data-mascot-x=".26" style="left:1240px;top:284px;width:560px;height:540px">
      <i class="cm-art abs" data-cm-art="kettle" style="left:100px;top:40px;width:300px"></i>
      <p class="cm-sfx ink sm abs" style="left:330px;top:-30px;--r:6deg">呼～</p>
      <p class="cm-cap abs" style="left:76px;top:326px"><b class="cm-no">3</b>一壶热水</p>
      <p class="abs t-comic-items-txt" style="left:90px;top:412px">烧开后晾到<br><em class="key">八十度</em></p>
    </div>
    <div class="mascot guide" data-face="left" style="left:1620px;top:836px"></div>`,
  notes: [
    { beat: 0, key: '盖碗', say: '动手之前先备齐东西。盖碗就是带盖的小茶碗，泡、闻、倒都用它。' },
    { beat: 1, key: '白瓷', say: '第一样是盖碗，白瓷的最好，茶汤什么颜色一眼就看清。' },
    { beat: 2, key: '三克', say: '第二样是茶叶，三克就够，大约铺满碗底薄薄一层。' },
    { beat: 3, key: '八十度', say: '第三样是热水。水烧开后别急，晾到八十度左右再用。' },
  ],
});

/* 四格漫画（泡茶三步，招牌页）：三步加一格结果，正好是四格漫画的起承转合。开场四个格子都是蓝铅笔虚线的草稿框；
   每拍给一格上墨：墨线描出来 → 角上的旁白框写上格号和步骤名 → 插画一笔笔描出来 → 拟声大字砰地砸下（哗啦、簌簌、咕嘟咕嘟、锵锵！）→
   对白气泡最后冒出来，尾巴指着站在格子下面的叨叨，像是它在讲。第 4 拍是结果：盖好的一碗茶冒着热气、闪着光，
   右下贴上一行可复制的命令，叨叨跑到命令旁边。
   为什么适合：四格漫画就是「一格一个动作、最后一格见结果」的讲法，草稿框先把四格摆出来，观众一眼知道要讲几步、讲到第几格；
   每格的拟声字和气泡把动作讲活，是只有漫画才有的节奏。
   可读性：每一步的做法写在气泡里（不轮换、不换掉），步骤名写在旁白框里，格号 1–4 从左到右；
   重点词三处（烫一遍、三克、八十度）都在气泡里；拟声字墨黑、一格一个，结果格的「锵锵！」用钴蓝。
   抄过去改哪里：每格的步骤名（4 个字以内）、气泡（两行，一行 5 个字以内）、拟声字（4 个字以内，小一号的一行最多 4 个字）、
   插画（data-cm-art）；格子大小改了要连 .cm-slot 一起改（四格各宽 396、隔 32，从 x 120 排到 1800） */
Deck.add({
  id: 't-comic-strip',
  chapter: '二、动手',
  topic: '泡茶三步',
  scene: 'comic',
  title: '泡一杯绿茶，看这四格',
  html: `
    <div class="cm-slot" style="left:120px;top:252px;width:396px;height:520px">
      <div class="cm-panel abs" data-beat="1" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".24">
        <i class="cm-art abs" data-cm-art="koma-warm" style="left:18px;top:88px;width:360px"></i>
        <p class="cm-sfx ink sm abs" style="left:196px;top:46px;--r:8deg">哗啦</p>
        <p class="cm-cap abs" style="left:-14px;top:-22px"><b class="cm-no">1</b>温杯</p>
        <p class="cm-say abs" style="left:34px;top:360px">热水把盖碗<br><em class="key">烫一遍</em></p>
      </div>
    </div>
    <div class="cm-slot" style="left:548px;top:252px;width:396px;height:520px">
      <div class="cm-panel abs" data-beat="2" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".24">
        <i class="cm-art abs" data-cm-art="koma-drop" style="left:18px;top:88px;width:360px"></i>
        <p class="cm-sfx ink sm abs" style="left:226px;top:50px;--r:-8deg">簌簌</p>
        <p class="cm-cap abs" style="left:-14px;top:-22px"><b class="cm-no">2</b>投茶</p>
        <p class="cm-say abs" style="left:34px;top:360px"><em class="key">三克</em>茶叶<br>铺满碗底</p>
      </div>
    </div>
    <div class="cm-slot" style="left:976px;top:252px;width:396px;height:520px">
      <div class="cm-panel abs" data-beat="3" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".24">
        <i class="cm-art abs" data-cm-art="koma-pour" style="left:18px;top:88px;width:360px"></i>
        <p class="cm-sfx ink sm abs t-comic-strip-long" style="left:122px;top:40px;--r:-5deg">咕嘟咕嘟</p>
        <p class="cm-cap abs" style="left:-14px;top:-22px"><b class="cm-no">3</b>注水</p>
        <p class="cm-say abs" style="left:34px;top:360px"><em class="key">八十度</em>水<br>沿碗边倒</p>
      </div>
    </div>
    <div class="cm-slot" style="left:1404px;top:252px;width:396px;height:520px">
      <div class="cm-panel abs" data-beat="4">
        <i class="cm-art abs" data-cm-art="koma-done" style="left:10px;top:190px;width:376px"></i>
        <p class="cm-sfx cool abs" style="left:64px;top:62px;--r:-6deg">锵锵！</p>
        <p class="cm-cap abs" style="left:-14px;top:-22px"><b class="cm-no">4</b>一杯好茶</p>
      </div>
    </div>
    <button class="copy abs" type="button" data-beat="4" data-delay=".5" data-mascot="4" data-mascot-side="left" style="left:1146px;top:812px" data-copy="tea brew --green --temp 80">tea brew --green --temp 80</button>
    <div class="mascot guide" data-face="left" style="left:1600px;top:782px"></div>`,
  notes: [
    { beat: 0, key: '三步', say: '东西备齐了，泡一杯绿茶其实只要三步，加上结果，正好画成四格漫画。' },
    { beat: 1, key: '温杯', say: '第一格温杯：热水把盖碗里外烫一遍，倒掉。' },
    { beat: 2, key: '投茶', say: '第二格投茶：三克茶叶放进去，铺满碗底就行。' },
    { beat: 3, key: '注水', say: '第三格注水：八十度的水沿着碗边慢慢倒。' },
    { beat: 4, key: '好茶', say: '第四格，一杯好茶就成了。懒得记的话，下面这行命令点一下就能复制。' },
  ],
});

/* 错误示范和正确示范（别踩的三个坑，招牌页）：左边竖着两个大字「NG」「OK」标出上下两排；上排三格是错误示范，下排三格是正确示范。
   开场六个格子都是蓝铅笔草稿框；每拍给一列上墨：上面的 NG 格先画出来——旁白框写这个坑，茶杯苦着脸（阴沉线、汗滴、蚊香眼这些漫符弹出来），
   气泡里是后果（好苦！）；箭头往下一指，下面的 OK 格画出来——旁白框写破法，茶杯笑了、闪光弹出来。叨叨跑到这一列的 OK 格下面。
   为什么适合：漫画、综艺最爱的「NG / OK」对照：同一个茶杯、上下两种表情，一眼看出差在哪；一拍一列，坑和破法总是成对出现。
   可读性：坑写在 NG 格的旁白框里（带格号 1、2、3），破法写在 OK 格的旁白框里，后果写在气泡里，都是横排、讲完留着；
   读法是一列一列从上往下、列从左往右（箭头和格号串起来）；重点词三处（八十度、一分钟、三克）都在破法里，NG、OK 两个字是装饰大字。
   抄过去改哪里：每列的坑（旁白框，4 个字以内）、后果（气泡，4 个字以内）、破法（旁白框，5 个字以内）、两张表情（data-cm-art 换 cup-*）；
   列数 2 到 3 列，每列宽 480、隔 40，格子高 260；箭头的 x 是这一列的中线 */
Deck.add({
  id: 't-comic-ngok',
  chapter: '二、动手',
  topic: '别踩的三个坑',
  scene: 'comic',
  title: '别这样泡，要这样泡',
  html: `
    <p class="cm-sfx ink abs t-comic-ngok-row" data-beat="0" style="left:112px;top:314px;--r:-5deg">NG</p>
    <p class="cm-sfx cool abs t-comic-ngok-row" data-beat="0" style="left:112px;top:648px;--r:-5deg">OK</p>
    <div class="cm-slot" style="left:280px;top:236px;width:480px;height:260px">
      <div class="cm-panel abs" data-beat="1">
        <i class="cm-art abs" data-cm-art="cup-bitter" style="left:230px;top:50px;width:240px"></i>
        <p class="cm-cap abs" style="left:-14px;top:-22px"><b class="cm-no">1</b>水太烫</p>
        <p class="cm-say tail-e abs" style="left:30px;top:104px">好苦！</p>
      </div>
    </div>
    <div class="cm-slot" style="left:280px;top:570px;width:480px;height:260px">
      <div class="cm-panel abs" data-beat="1" data-delay=".3" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".3">
        <i class="cm-art abs" data-cm-art="cup-happy" style="left:246px;top:54px;width:230px"></i>
        <p class="cm-cap abs t-comic-ngok-fix" style="left:24px;top:98px">晾到<em class="key">八十度</em></p>
      </div>
    </div>
    <div class="cm-slot" style="left:800px;top:236px;width:480px;height:260px">
      <div class="cm-panel abs" data-beat="2">
        <i class="cm-art abs" data-cm-art="cup-sour" style="left:230px;top:50px;width:240px"></i>
        <p class="cm-cap abs" style="left:-14px;top:-22px"><b class="cm-no">2</b>泡太久</p>
        <p class="cm-say tail-e abs" style="left:30px;top:104px">好涩…</p>
      </div>
    </div>
    <div class="cm-slot" style="left:800px;top:570px;width:480px;height:260px">
      <div class="cm-panel abs" data-beat="2" data-delay=".3" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".3">
        <i class="cm-art abs" data-cm-art="cup-wink" style="left:246px;top:54px;width:230px"></i>
        <p class="cm-cap abs t-comic-ngok-fix" style="left:24px;top:98px"><em class="key">一分钟</em>出汤</p>
      </div>
    </div>
    <div class="cm-slot" style="left:1320px;top:236px;width:480px;height:260px">
      <div class="cm-panel abs" data-beat="3">
        <i class="cm-art abs" data-cm-art="cup-strong" style="left:230px;top:50px;width:240px"></i>
        <p class="cm-cap abs" style="left:-14px;top:-22px"><b class="cm-no">3</b>茶太多</p>
        <p class="cm-say tail-e abs" style="left:30px;top:104px">太浓！</p>
      </div>
    </div>
    <div class="cm-slot" style="left:1320px;top:570px;width:480px;height:260px">
      <div class="cm-panel abs" data-beat="3" data-delay=".3" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".3">
        <i class="cm-art abs" data-cm-art="cup-calm" style="left:246px;top:54px;width:230px"></i>
        <p class="cm-cap abs t-comic-ngok-fix" style="left:24px;top:98px">只放<em class="key">三克</em></p>
      </div>
    </div>
    <svg class="sketch">
      <path data-beat="1" data-delay=".22" data-arrow d="M520 508 C516 526 524 544 520 562"/>
      <path data-beat="2" data-delay=".22" data-arrow d="M1040 508 C1036 526 1044 544 1040 562"/>
      <path data-beat="3" data-delay=".22" data-arrow d="M1560 508 C1556 526 1564 544 1560 562"/>
    </svg>
    <div class="mascot guide" style="left:96px;top:840px"></div>`,
  notes: [
    { beat: 0, key: '三个坑', say: '泡茶最怕三个坑。上面一排是错误示范，下面一排是正确示范，我们一列一列看。' },
    { beat: 1, key: '八十度', say: '第一个坑是水太烫，滚水一冲茶就苦。办法是先晾到八十度。' },
    { beat: 2, key: '一分钟', say: '第二个坑是泡太久，茶会发涩。一分钟左右就出汤。' },
    { beat: 3, key: '三克', say: '第三个坑是茶放太多，味道太浓。只放三克就够。' },
  ],
});

/* 最后一格「完」（结尾）：一整条宽格，左边一个大旁白框写金句，右边一圈集中线收向冒着热气的盖碗。
   1 拍：格子右下角砸下一个「完」字圆章，下面冒出一个对白气泡「谢谢大家，欢迎提问」，尾巴指着旁边高兴的叨叨。
   为什么适合：漫画一话的最后一格常是一句旁白收住全篇，再盖一个「完」；最后道谢交给叨叨的对白气泡，和封面的扉页首尾呼应。
   可读性：金句是 96px 的实色大字，横排两行写在旁白框里，一直留着；集中线只铺在右半格（data-cm-burst-box 挡在旁白框外面）；
   致谢横排在气泡里；从左上往右下读：金句 → 盖碗 → 「完」 → 致谢。
   抄过去改哪里：金句（两行，一行 5 个字以内，96px）、致谢的字；插画换 data-cm-art；
   y 990 以下留给引擎自动加的署名，别放东西 */
Deck.add({
  id: 't-comic-end',
  chapter: '结尾',
  scene: 'comic',
  title: '谢谢',
  noTitle: true,
  html: `
    <div class="cm-cut abs" data-beat="0" data-cm-cut="0,0 1680,0 1680,660 0,660" data-cm-burst="1180,370,250" data-cm-burst-box="780,0,1680,660" style="left:120px;top:110px;width:1680px;height:660px">
      <i class="cm-art abs" data-cm-art="cover" style="left:880px;top:46px;width:600px"></i>
      <p class="cm-nar abs" style="left:96px;top:176px">水温对了，<br>茶就<em class="key">不苦</em></p>
    </div>
    <p class="cm-fin abs" data-beat="1" style="left:1626px;top:668px">完</p>
    <p class="cm-say tail-e abs t-comic-end-thanks" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="happy" style="left:150px;top:820px">谢谢大家，欢迎提问</p>
    <div class="mascot guide" data-pose="rest" data-face="left" style="left:1380px;top:812px"></div>`,
  notes: [
    { beat: 0, key: '不苦', say: '最后只记一句：水温对了，茶就不苦。' },
    { beat: 1, say: '谢谢大家，有问题现在可以问。' },
  ],
});
