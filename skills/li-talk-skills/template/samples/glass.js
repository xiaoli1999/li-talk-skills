/* =====================================================================
   液态玻璃 glass 自己的样板页：同一个虚构主题「怎么泡好一杯茶」，按会融合、会变形的胶囊和液体重新排
   - 和通用样板（samples.js）内容大致对应，版式全换成液态玻璃里的画面：
     t-glass-cover 液滴透镜（封面）、t-glass-bubbles 玻璃气泡（要备的三样东西）、t-glass-tube 液态胶囊（泡茶三步，招牌页）、
     t-glass-fix 冷却分液（别踩的三个坑）、t-glass-level 注水液面（三个数，招牌页）、t-glass-end 水滴汇合（收尾金句）
   - 每拍「发生了什么」是液体的事：一滴水落下来摊开、气泡从下面浮上来晃两下、胶囊从上一节的末端鼓出一团再拉长、
     暖色的液体流成冷色的胶囊再断开细颈、水滴落进杯里水面晃着升一段、两颗水滴撞在一起合成一枚胶囊，一道高光扫过。
     这些动作由液态玻璃的版式组件（.gl-*）自己完成，页面里只写结构和 data-beat，不写 onBeat、不写 data-in
   - 和毛玻璃 frost 拉开：毛玻璃是层叠的磨砂卡片和控件（叠成一摞再展开、滑块、旋钮）；这里没有叠起来的卡片、没有控件，
     是液体本身在融合、拉长、断开、上涨
   - 可读性：液体只是浅浅的半透明底色，字一律写在液体上面、实色深墨；每拍出的要点讲完都留着——胶囊长出的每一节、
     每一行坑和改法、杯子旁的每条刻度说明，翻到最后一拍都在。讲过的只由引擎退到 .8，不另外调暗
   - 组件只在液态玻璃里有样子（换成别的风格会乱）：这几页只给 scene: 'glass' 用，不进通用样册
   - 抄过去时：id 换成 p〈讲稿页号〉，samples/glass.css 里对应的 [data-id="t-glass-…"] 一起换；字照讲稿改；
     坐标都是舞台坐标（1920×1080），版式组件的用法见 scenes/glass.js 开头的说明
   ===================================================================== */

/* 液滴透镜（封面）：左边一组大字——大标题、副标题；右边一颗大的液态透镜，透镜里一只线稿盖碗，背后的光斑在透镜边上被折弯。
   翻进来时一滴水从上面落下来，压扁、摊开成透镜，果冻似地回弹，盖碗在玻璃里由大到清楚，一道高光扫过。
   1 拍：透镜底下又落下一滴水，从中间向两边摊开成一枚胶囊，里面写讲者；透透跑到胶囊左边高兴一下。
   为什么适合：液态玻璃的主角就是一块会动的厚玻璃；「一滴水落下来摊开」是这种风格最典型的出场，封面用它最直接。
   可读性：字都在左边一条线上（大字 → 副标题），透镜里只放图标；讲者胶囊里只写讲者和日期。
   抄过去改：大标题（.cv-hero，132px 一行最多 7 个字，别伸进右边的透镜）、副标题、讲者；
   透镜里的图标换 data-gl-ico（cup、leaf、kettle），透镜大小改 width（正圆） */
Deck.add({
  id: 't-glass-cover',
  chapter: '开场',
  scene: 'glass',
  title: '怎么泡好一杯茶',
  noTitle: true,
  html: `
    <p class="abs cv-hero" data-beat="0" style="left:140px;top:318px">怎么<em class="key">泡好</em>一杯茶</p>
    <p class="abs cv-sub" data-beat="0" style="left:146px;top:506px">水温、茶量、时间，三件事讲清楚</p>
    <div class="abs gl-orb" data-beat="0" style="left:1170px;top:190px;width:540px"><i class="gl-ico" data-gl-ico="cup"></i></div>
    <div class="abs gl-pill" data-beat="1" data-mascot="1" data-mascot-side="left" data-mascot-pose="happy" style="left:1110px;top:790px;width:660px">讲者：〈你的名字〉 · 〈日期〉</div>
    <div class="mascot guide" style="left:880px;top:660px"></div>`,
  notes: [
    { beat: 0, key: '泡好', say: '大家好，今天聊一件小事：怎么泡好一杯茶。' },
    { beat: 1, say: '我是〈你的名字〉，平时爱喝茶，也踩过不少坑。' },
  ],
});

/* 玻璃气泡（要备的三样东西）：三颗透明的玻璃气泡排成一排，每颗托着一样东西的线稿（盖碗、茶叶、热水壶），
   气泡下面一枚名字胶囊（序号 01、02、03 写在胶囊里），再下面一行说明。
   每拍浮上来一颗：气泡从下面浮上来、像真的气泡一样晃两下站稳，东西在玻璃里由大到清楚，名字胶囊弹出来、说明滑进来；
   透透跟到这颗气泡底下。三颗讲完都留着。
   为什么适合：气泡是液体里最常见的形状，一颗颗浮上来比卡片淡入更像「液态」；透明的球把背后的光斑折弯，正是液态玻璃的质感。
   可读性：从左到右一条线，序号就是顺序；名字和说明直接写在气泡下面，不用观众猜图；三处重点词各在说明里一处。
   抄过去改：每颗气泡里的图标（data-gl-ico）、名字（6 个字以内）、说明（一行，12 个字以内）；
   两颗或四颗就照样增删 .gl-bubble（按个数自动等分；四颗时把 .gl-ball 的大小调小一点） */
Deck.add({
  id: 't-glass-bubbles',
  chapter: '一、准备',
  topic: '要备的三样东西',
  scene: 'glass',
  title: '泡茶之前，备好三样东西',
  html: `
    <p class="explain" data-beat="0"><b>盖碗</b>：带盖的小茶碗，泡茶、闻香、出汤都用它</p>
    <div class="abs gl-bubbles" style="left:120px;top:330px;width:1680px">
      <div class="gl-bubble" data-beat="1" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".379">
        <div class="gl-ball"><i class="gl-ico" data-gl-ico="cup"></i></div>
        <b class="gl-chip"><small data-small>01</small>一只盖碗</b>
        <span><em class="key">白瓷</em>的最好，看得清茶色</span>
      </div>
      <div class="gl-bubble" data-beat="2" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".379">
        <div class="gl-ball"><i class="gl-ico" data-gl-ico="leaf"></i></div>
        <b class="gl-chip"><small data-small>02</small>三克绿茶</b>
        <span>大约铺满碗底<em class="key">薄薄一层</em></span>
      </div>
      <div class="gl-bubble" data-beat="3" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".379">
        <div class="gl-ball"><i class="gl-ico" data-gl-ico="kettle"></i></div>
        <b class="gl-chip"><small data-small>03</small>一壶热水</b>
        <span>烧开后晾到<em class="key">八十度</em></span>
      </div>
    </div>
    <div class="mascot guide" style="left:1680px;top:860px"></div>`,
  notes: [
    { beat: 0, key: '盖碗', say: '动手之前先备齐东西。盖碗就是带盖的小茶碗，泡、闻、倒都用它。' },
    { beat: 1, key: '白瓷', say: '第一样是盖碗，白瓷的最好，茶汤什么颜色一眼就看清。' },
    { beat: 2, key: '薄薄一层', say: '第二样是茶叶，三克就够，大约铺满碗底薄薄一层。' },
    { beat: 3, key: '八十度', say: '第三样是热水。水烧开后别急，晾到八十度左右再用。' },
  ],
});

/* 液态胶囊（泡茶三步，招牌页）：一根横着的厚玻璃管。翻进来时管子像液体一样从左流开，一颗种子液滴落进管子左头。
   每拍长出一节：从上一节的右端（第一节从种子液滴）鼓出一团液体，拉长成新的一节、果冻似地回弹，交界处融成圆润的细颈，
   一道高光扫过这一节；序号、步骤名、一句话随后滑进来。三节依次是浅蓝、薄荷、浅杏，最后连成一条，每节的字都在。
   第 3 拍下面再弹出一行可复制的命令。透透站在当前这一节的上沿。
   为什么适合：「一步接一步」讲成一颗液态胶囊一节节长出来、融成一体，是液态玻璃才有的形态（会融合、会变形）；
   三节连着又各自鼓成一段，既看得出是一个流程，又分得清每一步。
   可读性：从左到右一条线，序号 01、02、03 就是顺序；字写在浅色液体上面、实色深墨；讲过的节只由引擎退到 .8。
   抄过去改：每节的序号、步骤名（4 个字以内）、一句话（一行，10 个字以内）；节数 2 到 5 节，照样增删 .gl-seg（自动等分，
   五节时把一句话缩到 6 个字以内）；命令改 .copy 的字和 data-copy，不要命令就删掉那一行 */
Deck.add({
  id: 't-glass-tube',
  chapter: '二、动手',
  topic: '泡茶三步',
  scene: 'glass',
  title: '泡一杯绿茶，只要三步',
  html: `
    <div class="abs gl-tube" data-beat="0" style="left:120px;top:384px;width:1680px">
      <div class="gl-seg" data-beat="1" data-mascot="1" data-mascot-side="top" data-mascot-x=".5"><b class="gl-no" data-small>01</b><h3><em class="key">温杯</em></h3><p>热水把盖碗烫一遍</p></div>
      <div class="gl-seg" data-beat="2" data-mascot="2" data-mascot-side="top" data-mascot-x=".5"><b class="gl-no" data-small>02</b><h3><em class="key">投茶</em></h3><p>三克茶叶铺满碗底</p></div>
      <div class="gl-seg" data-beat="3" data-mascot="3" data-mascot-side="top" data-mascot-x=".5"><b class="gl-no" data-small>03</b><h3><em class="key">注水</em></h3><p>八十度水沿碗边倒</p></div>
    </div>
    <button class="copy abs" type="button" data-beat="3" style="left:660px;top:770px" data-copy="tea brew --green --temp 80">tea brew --green --temp 80</button>
    <div class="mascot guide" style="left:1680px;top:820px"></div>`,
  notes: [
    { beat: 0, key: '三步', say: '东西备齐了，泡一杯绿茶其实只要三步，一步接着一步，连成一串。' },
    { beat: 1, key: '温杯', say: '第一步温杯：热水把盖碗里外烫一遍，倒掉。' },
    { beat: 2, key: '投茶', say: '第二步投茶：三克茶叶放进去，铺满碗底就行。' },
    { beat: 3, key: '注水', say: '第三步注水：八十度的水沿着碗边慢慢倒。懒得记的话，下面这行命令点一下就能复制。' },
  ],
});

/* 冷却分液（别踩的三个坑）：三行，每行左边一团暖杏色的液体写错的做法（✕ 水太烫），右边一枚薄荷色的胶囊写对的做法（✓ 晾到八十度），
   中间一股细流连着两头，细流中间鼓着一颗带箭头的水珠。每拍一行：暖色液体从左端流开，再从它的右端淌出一股细流，
   水珠顶在流的前头往右走，细流从暖杏渐渐变成薄荷，流到右边鼓成冷色的胶囊，箭头弹出来；透透跟到这一行右边。
   为什么适合：「错的 → 对的」讲成一团热的液体淌过去、冷下来变成另一枚胶囊，颜色从暖到冷正好是「水晾凉」；
   流开、淌过去、交界处融成一体，都是液体才有的样子，静下来也看得出是一股连着的水。
   可读性：每行从左往右读，✕ 和 ✓ 分对错，三行从上到下；错的做法不划掉，两边都是实色横排大字；重点词三处，都在对的做法里。
   抄过去改：每行的错做法（6 个字以内）、对做法（8 个字以内）；行数改了就照样增删 .gl-fix，每行隔 170px */
Deck.add({
  id: 't-glass-fix',
  chapter: '二、动手',
  topic: '别踩的三个坑',
  scene: 'glass',
  title: '三个坑，换个做法就好',
  html: `
    <div class="abs gl-fix" data-beat="1" data-mascot="1" data-mascot-side="right" style="left:410px;top:320px;width:1100px">
      <p class="gl-bad"><i>✕</i>水太烫</p><i class="gl-to">→</i><p class="gl-good"><i>✓</i>晾到<em class="key">八十度</em></p>
    </div>
    <div class="abs gl-fix" data-beat="2" data-mascot="2" data-mascot-side="right" style="left:410px;top:490px;width:1100px">
      <p class="gl-bad"><i>✕</i>泡太久</p><i class="gl-to">→</i><p class="gl-good"><i>✓</i><em class="key">一分钟</em>出汤</p>
    </div>
    <div class="abs gl-fix" data-beat="3" data-mascot="3" data-mascot-side="right" style="left:410px;top:660px;width:1100px">
      <p class="gl-bad"><i>✕</i>茶太多</p><i class="gl-to">→</i><p class="gl-good"><i>✓</i>只放<em class="key">三克</em></p>
    </div>
    <div class="mascot guide" style="left:1660px;top:860px"></div>`,
  notes: [
    { beat: 0, key: '三个坑', say: '泡茶最常踩的有三个坑，每个坑换个做法就好。' },
    { beat: 1, key: '八十度', say: '第一个坑是水太烫，滚水一冲茶就苦。换成：先晾到八十度。' },
    { beat: 2, key: '一分钟', say: '第二个坑是泡太久，茶会发涩。换成：一分钟左右就出汤。' },
    { beat: 3, key: '三克', say: '第三个坑是茶放太多，味道太浓。换成：只放三克。' },
  ],
});

/* 注水液面（三个数，招牌页）：左边一只大玻璃杯（杯壁厚、边上折光，右侧一列细刻度），杯子右边三条刻度说明，
   各自对准杯上的一条刻度线，由一根海蓝引线连到杯边：大数字（80℃、3 克、1 分钟）、名字胶囊、一句说明。
   翻进来时杯子从底下长出来、果冻回弹，杯里是空的。每拍一滴水落进杯里、水面漾开一圈，水面晃着升到下一条刻度，
   那条刻度线变海蓝，引线从杯边伸出来，数字弹出来、说明滑进来；透透跟到这条说明右边。
   为什么适合：「三个数」讲成往杯里注水，一拍升一段，液面就是进度；水滴、水面晃动、厚玻璃杯都是液态玻璃的语汇，
   比一排数字卡片更有「记到哪儿了」的感觉。
   可读性：三条说明跟着水面从下往上排，引线把每条说明和它的刻度连起来；数字、名字、说明都是实色横排，讲完都留着。
   抄过去改：每条说明的 --lv（这条刻度在杯子的几成高，0–1，一拍比一拍大，相邻两条差 .27 以上，免得两行说明叠住）、
   数字和单位、名字（4 个字以内）、说明（一行，10 个字以内）；杯子的位置和大小改 .gl-beaker 的 left、top、height */
Deck.add({
  id: 't-glass-level',
  chapter: '三、记住',
  topic: '三个数',
  scene: 'glass',
  title: '记住三个数就够了',
  html: `
    <div class="abs gl-beaker" data-beat="0" style="left:330px;top:250px;width:1180px;height:720px">
      <div class="gl-vessel"></div>
      <div class="gl-level" data-beat="1" data-mascot="1" data-mascot-side="right" style="--lv:.3"><b class="gl-num"><em class="key">80</em><small>℃</small></b><div class="gl-say"><b class="gl-chip">水温</b><span>烧开后晾到八十度</span></div></div>
      <div class="gl-level" data-beat="2" data-mascot="2" data-mascot-side="right" style="--lv:.58"><b class="gl-num"><em class="key">3</em><small>克</small></b><div class="gl-say"><b class="gl-chip">茶量</b><span>铺满碗底薄薄一层</span></div></div>
      <div class="gl-level" data-beat="3" data-mascot="3" data-mascot-side="right" style="--lv:.86"><b class="gl-num"><em class="key">1</em><small>分钟</small></b><div class="gl-say"><b class="gl-chip">时间</b><span>一分钟就出汤</span></div></div>
    </div>
    <div class="mascot guide" style="left:1600px;top:820px"></div>`,
  notes: [
    { beat: 0, key: '三个数', say: '前面讲了这么多，其实只要记住三个数。' },
    { beat: 1, key: '80℃', say: '第一个，水温八十度。开水晾一晾再冲，茶就不苦。' },
    { beat: 2, key: '3 克', say: '第二个，茶量三克，铺满碗底薄薄一层。' },
    { beat: 3, key: '1 分钟', say: '第三个，时间一分钟，到点就出汤。' },
  ],
});

/* 水滴汇合（结尾）：正中一句大字金句，重点词「不苦」被一枚小玻璃胶囊包住、一道反光扫过。
   1 拍：两颗水滴从两边滚进来，在金句下面正中撞在一起，合成一枚胶囊向两边摊开，里面写「谢谢大家，欢迎提问」；
   透透跑到胶囊右边高兴一下。金句一直在，不换掉。
   为什么适合：收尾用「两滴水合成一滴」，是液态玻璃最招牌的融合动作；居中、留白多，收得干净。
   抄过去改：金句（112px，一行 12 个字以内）、胶囊里的致谢；署名由引擎自动加在最后一页底部（y 990 以下别放东西） */
Deck.add({
  id: 't-glass-end',
  chapter: '结尾',
  scene: 'glass',
  title: '谢谢',
  noTitle: true,
  html: `
    <div class="abs center" style="left:0;right:0;top:350px"><p class="quote ed-quote" data-beat="0">水温对了，茶就<em class="key">不苦</em></p></div>
    <div class="abs center" style="left:0;right:0;top:620px"><div class="gl-merge" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="happy">谢谢大家，欢迎提问</div></div>
    <div class="mascot guide" style="left:1560px;top:700px"></div>`,
  notes: [
    { beat: 0, key: '不苦', say: '最后只记一句：水温对了，茶就不苦。' },
    { beat: 1, say: '谢谢大家，有问题现在可以问。' },
  ],
});
