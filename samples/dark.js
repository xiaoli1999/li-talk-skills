/* =====================================================================
   科技暗黑 dark 自己的样板页：同一个虚构主题「怎么泡好一杯茶」，按发布会的控制台和 HUD 重新排
   - 和通用样板（samples.js）内容大致对应，版式全换成控制台、仪表上的画面：
     t-dark-cover 发布会主视觉（封面）、t-dark-scan 物件识别（要备的三样东西）、t-dark-pipe 流水线控制台（泡茶三步，招牌页）、
     t-dark-diff 改法对照（别踩的三个坑）、t-dark-hud HUD 仪表（三个数，招牌页）、t-dark-end 发布会收尾（金句）
   - 每拍「发生了什么」是控制台和仪表上的事：焦点框移到当前块、扫描线扫过、锁定框收紧、进度线跑完打勾、指针转到读数、数字滚上来、
     一道光扫过大字。这些动作由科技暗黑的版式组件（.dk-*）自己完成，页面里只写结构和 data-beat，不写 onBeat、不写风格专用的 data-in
   - 可读性：HUD、控制台是包装，要点直接写在版面上、讲完一直留着——物件的名字和说明写在取景框下面的标签里，
     每一步做什么写在流水线那一行里，坑和改法左右对照写成两行实色字，三个数的读数和一句说明写在仪表里。
     「当前」靠冰蓝描边和焦点框交代，讲过的块只由引擎退到 .8，不另外调暗；进度百分比这种只显示最新一块的过场数字加 data-transient。
     刻度、网格、光圈都很淡，不垫在字后面；银色渐变和扫光只给大字和大数字
   - 组件只在科技暗黑里有样子（换成别的风格会乱）：这几页只给 scene: 'dark' 用，不进通用样册
   - 抄过去时：id 换成 p〈讲稿页号〉，samples/dark.css 里对应的 [data-id="t-dark-…"] 一起换；字照讲稿改；
     坐标都是舞台坐标（1920×1080），版式组件的用法见 scenes/dark.js 开头的说明
   ===================================================================== */

/* 发布会主视觉（封面）：左边一组大字——银色渐变的大标题、一道冰蓝细光线、副标题；右边一枚 HUD 光圈（外圈刻度、三段冰蓝弧、
   中间一团柔光托着一只线稿盖碗）。翻进来时光圈一圈圈由虚到实转正、一道光沿外圈扫一周，大标题浮上来后一道白光从左扫到右。
   1 拍：讲者写在一枚玻璃胶囊里，从左往右柔边擦出，指示灯荡开一下，微光飞过去高兴一下。
   为什么适合：高端产品发布会的开场就是「大字 + 一个发光的主体」，光圈和刻度是 HUD 的语汇，但只做一枚、很克制，不堆角标乱码。
   抄过去改哪里：大标题（.dk-hero，8 个字以内，128px 一个字约 133 宽，别伸进右边的光圈）、副标题、讲者；
   光圈里的图标换 data-dk-ico（cup、leaf、kettle），不要图标就整行删掉 */
Deck.add({
  id: 't-dark-cover',
  chapter: '开场',
  scene: 'dark',
  title: '怎么泡好一杯茶',
  noTitle: true,
  html: `
    <div class="abs dk-orb" data-beat="0" style="left:1170px;top:220px;width:620px"><i class="dk-ico" data-dk-ico="cup"></i></div>
    <p class="abs dk-hero" data-beat="0" style="left:140px;top:330px">怎么<em class="key">泡好</em>一杯茶</p>
    <i class="abs dk-beam" data-beat="0" style="left:144px;top:508px;width:620px"></i>
    <p class="abs dk-sub" data-beat="0" style="left:144px;top:546px">水温、茶量、时间，三件事讲清楚</p>
    <p class="abs dk-cap" data-beat="1" style="left:144px;top:690px" data-mascot="1" data-mascot-side="right" data-mascot-pose="happy">讲者：〈你的名字〉 · 〈日期〉</p>
    <div class="mascot guide" style="left:1010px;top:790px"></div>`,
  notes: [
    { beat: 0, key: '泡好', say: '大家好，今天聊一件小事：怎么泡好一杯茶。' },
    { beat: 1, say: '我是〈你的名字〉，平时爱喝茶，也踩过不少坑。' },
  ],
});

/* 物件识别（要备的三样东西）：一排三个取景框，开场时框里是灰色的线稿、四角的锁定框张在框边，像相机还没对上焦。
   每拍识别一样：焦点框从上一个取景框飞过来，一道扫描线从上扫到下，锁定框收紧到物件上变冰蓝、线稿亮起来、顶上的指示灯亮，
   取景框下面接出一根引线，标签（序号、名字、一句说明）由虚到实；微光飘到这块标签下面。
   三块标签讲完都留着，锁定框也都锁着，只有当前这块是冰蓝。
   为什么适合：「备齐三样东西」讲成 HUD 一样一样识别出物件，扫描线、锁定框、指示灯都是控制台的语汇，
   比横排三张卡片更有「这一拍认出了什么」的感觉；名字和说明直接写在标签上，不用观众猜。
   抄过去改哪里：每个取景框里的图标（data-dk-ico）、标签的序号、名字（6 个字以内）、说明（一行，13 个字以内）；
   物件改成两样或四样就改 samples/dark.css 里 .dk-scan 的列数 */
Deck.add({
  id: 't-dark-scan',
  chapter: '一、准备',
  topic: '要备的三样东西',
  scene: 'dark',
  title: '动手之前，备齐三样东西',
  html: `
    <p class="explain" data-beat="0"><b>盖碗</b>：带盖的小茶碗，泡茶、闻香、出汤都用它</p>
    <div class="abs dk-scan" data-beat="0" style="left:120px;top:290px;width:1680px">
      <div class="dk-obj">
        <div class="dk-view"><i class="dk-ico" data-dk-ico="cup"></i></div>
        <div class="dk-tag" data-beat="1" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".36"><b><small data-small>01</small>一只盖碗</b><span><em class="key">白瓷</em>的最好，看得清茶色</span></div>
      </div>
      <div class="dk-obj">
        <div class="dk-view"><i class="dk-ico" data-dk-ico="leaf"></i></div>
        <div class="dk-tag" data-beat="2" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".36"><b><small data-small>02</small><em class="key">三克</em>绿茶</b><span>大约铺满碗底薄薄一层</span></div>
      </div>
      <div class="dk-obj">
        <div class="dk-view"><i class="dk-ico" data-dk-ico="kettle"></i></div>
        <div class="dk-tag" data-beat="3" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".36"><b><small data-small>03</small>一壶热水</b><span>烧开后晾到<em class="key">八十度</em></span></div>
      </div>
    </div>
    <div class="mascot guide" style="left:880px;top:820px"></div>`,
  notes: [
    { beat: 0, key: '盖碗', say: '动手之前先备齐东西。盖碗就是带盖的小茶碗，泡、闻、倒都用它。' },
    { beat: 1, key: '白瓷', say: '第一样是盖碗，白瓷的最好，茶汤什么颜色一眼就看清。' },
    { beat: 2, key: '三克', say: '第二样是茶叶，三克就够，大约铺满碗底薄薄一层。' },
    { beat: 3, key: '八十度', say: '第三样是热水。水烧开后别急，晾到八十度左右再用。' },
  ],
});

/* 流水线控制台（泡茶三步，招牌页）：左边一扇终端，第一行是要执行的命令（像一条输入栏，点一下就复制），
   下面三步像流水线一样一拍跑一行：焦点框从上一行移下来，这一行滑进来，底下一条冰蓝的进度线从左跑到右、状态灯转圈，
   跑完换成 ✓，最右边的参数亮出来。跑过的行留着，不刷屏。右边一个进度环，每跑一步亮一段，中间的百分比滚上去，
   跑完 100% 时微光高兴一下。
   为什么适合：步骤 = 流水线里的 step 1/2/3，「这一步跑完打勾、下一步接着跑」是技术分享里最熟的画面；
   每一行直接写着步骤名和做什么，参数只是点缀，观众不用懂命令行也读得懂。
   抄过去改哪里：命令（.copy 里的字和 data-copy，一行 50 个字符以内）、每一行的序号（1/3）、步骤名（2–4 个字）、
   做什么（一行，12 个字以内）、参数（10 个字符以内）；步骤多一步就加一行 .dk-job、进度环里加一段 .dk-arc，
   百分比的 data-from、data-to 跟着重算（最后一块不加 data-transient） */
Deck.add({
  id: 't-dark-pipe',
  chapter: '二、动手',
  topic: '泡茶三步',
  scene: 'dark',
  title: '泡茶三步，一条流水线跑完',
  html: `
    <div class="abs term dk-pipe" data-title="tea brew · 流水线" data-beat="0" style="left:120px;top:300px;width:1180px">
      <button class="copy dk-cmd" type="button" data-copy="tea brew --green --temp 80">tea brew --green --temp 80</button>
      <div class="dk-job" data-beat="1"><span class="dk-no">1/3</span><b>温杯</b><span class="dk-say">热水把盖碗<em class="key">烫一遍</em></span><span class="dk-arg">cup=warm</span></div>
      <div class="dk-job" data-beat="2"><span class="dk-no">2/3</span><b>投茶</b><span class="dk-say"><em class="key">三克</em>茶叶铺满碗底</span><span class="dk-arg">tea=3g</span></div>
      <div class="dk-job" data-beat="3"><span class="dk-no">3/3</span><b>注水</b><span class="dk-say"><em class="key">八十度</em>水沿碗边倒</span><span class="dk-arg">temp=80</span></div>
    </div>
    <div class="abs dk-ring" data-beat="0" data-recede="off" style="left:1380px;top:370px;width:420px" data-mascot="0" data-mascot-side="top" data-mascot-x=".33">
      <i class="dk-arc" data-beat="1"></i><i class="dk-arc" data-beat="2"></i><i class="dk-arc" data-beat="3" data-mascot="3" data-mascot-side="stay" data-mascot-pose="happy"></i>
      <div class="dk-swap">
        <b data-transient>0<small>%</small></b>
        <b data-beat="1" data-from="0" data-to="33" data-transient>33<small>%</small></b>
        <b data-beat="2" data-from="33" data-to="67" data-transient>67<small>%</small></b>
        <b data-beat="3" data-from="67" data-to="100">100<small>%</small></b>
      </div>
      <span class="dk-unit" data-small>完成进度</span>
    </div>
    <div class="mascot guide" style="left:1518px;top:206px"></div>`,
  notes: [
    { beat: 0, key: '三步', say: '东西备齐了，泡一杯绿茶其实只要三步，像一条流水线，一步跑完再跑下一步。' },
    { beat: 1, key: '温杯', say: '第一步温杯：热水把盖碗里外烫一遍，倒掉。' },
    { beat: 2, key: '投茶', say: '第二步投茶：三克茶叶放进去，铺满碗底就行。' },
    { beat: 3, key: '注水', say: '第三步注水：八十度的水沿着碗边慢慢倒，三步跑完。懒得记的话，最上面这行命令点一下就能复制。' },
  ],
});

/* 改法对照（别踩的三个坑）：一块深色缎面面板，像代码评审里的左右对照：顶上一行写文件名和「原来」「改成」两栏，
   每个坑一行：最左边是这一行管的维度（水温、时间、茶量），中间琥珀色「−」一行是原来的错做法，右边冰蓝「+」一行是改成的做法。
   每拍一行：焦点框移到这一行，「−」一行从左往右擦出，接着「+」一行擦出、一道光扫过；微光飘到这一行右边。
   三行讲完都留着，左右两栏都是实色横排的大字（44px），不划删除线，靠「−」「+」和两种颜色分对错。
   为什么适合：「错的 → 对的」正是 diff 的样子，技术听众一眼就懂；左右对照一行一个坑，比三张卡片更容易一眼扫完。
   抄过去改哪里：文件名、每一行的维度（2–4 个字）、错做法、对做法（各 9 个字以内）；
   行数改了不用改样式，面板高度跟着字走 */
Deck.add({
  id: 't-dark-diff',
  chapter: '二、动手',
  topic: '别踩的三个坑',
  scene: 'dark',
  title: '三个坑，一行一行改掉',
  html: `
    <div class="abs dk-panel dk-diff" data-beat="0" style="left:120px;top:310px;width:1440px">
      <div class="dk-diff-bar"><span data-small>泡茶.diff</span><span class="dk-was" data-small>原来</span><span class="dk-now" data-small>改成</span></div>
      <div class="dk-hunk" data-beat="1" data-mascot="1" data-mascot-side="right"><span class="dk-at">水温</span><p class="dk-del">水太烫</p><p class="dk-add">晾到<em class="key">八十度</em></p></div>
      <div class="dk-hunk" data-beat="2" data-mascot="2" data-mascot-side="right"><span class="dk-at">时间</span><p class="dk-del">泡太久</p><p class="dk-add"><em class="key">一分钟</em>出汤</p></div>
      <div class="dk-hunk" data-beat="3" data-mascot="3" data-mascot-side="right"><span class="dk-at">茶量</span><p class="dk-del">茶太多</p><p class="dk-add">只放<em class="key">三克</em></p></div>
    </div>
    <div class="mascot guide" style="left:1610px;top:820px"></div>`,
  notes: [
    { beat: 0, key: '三个坑', say: '泡茶最常踩的有三个坑，我们像改代码一样，一行一行改掉。' },
    { beat: 1, key: '八十度', say: '第一个坑是水太烫，滚水一冲茶就苦。改成：先晾到八十度。' },
    { beat: 2, key: '一分钟', say: '第二个坑是泡太久，茶会发涩。改成：一分钟左右就出汤。' },
    { beat: 3, key: '三克', say: '第三个坑是茶放太多，味道太浓。改成：只放三克。' },
  ],
});

/* HUD 仪表（三个数，招牌页）：一排三块仪表面板，像控制台上的读数：水温是一只 270° 的指针表，茶量是五格计量条（一格一克），
   时间是一圈计时环。开场时三块都在待机：表盘是暗的、指针在零、读数位置是很淡的「--」，名字前的指示灯是灰的。
   每拍点亮一块：焦点框移过来、面板描边扫一道光、指针转到读数（略过冲再回）或者计量条一格格亮到第三格、计时环转满一圈，
   大数字从 0 滚到读数、随后被一道光扫过染成冰蓝，下面一句说明由虚到实；微光飘到这块面板下面。
   点亮过的仪表一直亮着、读数一直在，只是当前这块描边是冰蓝。
   为什么适合：「三个数」讲成三块 HUD 仪表，指针、计量条、计时环本来就是表达「多少」的最直接的样子，一拍点亮一块，
   讲到哪一个数一目了然；读数用大号细体数字，后排也看得清。
   抄过去改哪里：每块的 data-dk-gauge（dial 指针表、bar 五格计量条、timer 计时环）和 --dk-to（读数占满量程的比例）、
   名字、数字（data-to 写数字；时间写秒数，再加 data-fmt="time"）、单位、说明（一行，12 个字以内） */
Deck.add({
  id: 't-dark-hud',
  chapter: '三、记住',
  topic: '三个数',
  scene: 'dark',
  title: '记住三个数就够了',
  html: `
    <div class="abs dk-hud" data-beat="0" style="left:120px;top:260px;width:1680px">
      <div class="dk-panel dk-gauge" data-dk-gauge="dial" style="--dk-to:.8" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".36">
        <span class="dk-lab">水温</span>
        <div class="dk-read" data-beat="1"><b class="dk-num" data-to="80"><em class="key">80</em><small>℃</small></b><span>开水晾一晾再冲</span></div>
      </div>
      <div class="dk-panel dk-gauge" data-dk-gauge="bar" style="--dk-to:.6" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".36">
        <span class="dk-lab">茶量</span>
        <div class="dk-read" data-beat="2"><b class="dk-num" data-to="3"><em class="key">3</em><small>克</small></b><span>铺满碗底薄薄一层</span></div>
      </div>
      <div class="dk-panel dk-gauge" data-dk-gauge="timer" style="--dk-to:1" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".36">
        <span class="dk-lab">时间</span>
        <div class="dk-read" data-beat="3"><b class="dk-num" data-to="60" data-fmt="time"><em class="key">1:00</em></b><span>一分钟就出汤</span></div>
      </div>
    </div>
    <div class="mascot guide" style="left:880px;top:880px"></div>`,
  notes: [
    { beat: 0, key: '三个数', say: '前面讲了这么多，其实只要记住三个数。' },
    { beat: 1, key: '80℃', say: '第一个，水温八十度。开水晾一晾再冲，茶就不苦。' },
    { beat: 2, key: '3 克', say: '第二个，茶量三克，铺满碗底薄薄一层。' },
    { beat: 3, key: '1 分钟', say: '第三个，时间一分钟，到点就出汤。' },
  ],
});

/* 发布会收尾（结尾）：正中一句银色渐变的大字金句，翻进来时由虚到实，一道白光从左扫到右，重点词「不苦」染成冰蓝；
   金句下面一道冰蓝细光线从中间拉开。1 拍：下面一枚玻璃胶囊柔边擦出「谢谢大家，欢迎提问」，指示灯荡开一下，微光飞到胶囊右边高兴一下。
   金句一直在，不换掉。
   为什么适合：发布会的最后一屏就是黑底上一句大字、底下一行「Q&A」；居中、留白多、只有一处冰蓝，收得干净。
   抄过去改哪里：金句（104px，一行 14 个字以内）、胶囊里的致谢；署名由引擎自动加在最后一页底部 */
Deck.add({
  id: 't-dark-end',
  chapter: '结尾',
  scene: 'dark',
  title: '谢谢',
  noTitle: true,
  html: `
    <div class="abs center" style="left:0;right:0;top:370px"><p class="dk-hero dk-quote t-dark-end-q" data-beat="0">水温对了，茶就<em class="key">不苦</em></p></div>
    <i class="abs dk-beam" data-beat="0" style="left:660px;top:548px;width:600px"></i>
    <div class="abs center" style="left:0;right:0;top:640px"><p class="dk-cap" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="happy">谢谢大家，欢迎提问</p></div>
    <div class="mascot guide" style="left:1500px;top:370px"></div>`,
  notes: [
    { beat: 0, key: '不苦', say: '最后只记一句：水温对了，茶就不苦。' },
    { beat: 1, say: '谢谢大家，有问题现在可以问。' },
  ],
});
