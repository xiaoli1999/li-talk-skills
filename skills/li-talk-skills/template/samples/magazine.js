/* =====================================================================
   杂志复古 magazine 自己的样板页（虚构主题：怎么泡好一杯茶）
   - 内容和通用样板（samples.js）大致对应：封面、要备的三样东西、泡茶三步、收尾金句；
     另加两页只有杂志做得出来的招牌页：拼贴目录（第 2 页）、跨页大特写（第 5 页）
   - 版式全按老杂志来：每页一个强烈的视觉重心，大小错落、不对称；宋体大标题配小号的栏目信息（刊头、栏目小标、页脚）；
     内容像剪报一样按顺序贴上去（先贴大块、再贴小纸条、胶带按上），不是一排三张一样大的卡片
   - 用到的杂志自有组件（.mag-*，写法见 scenes/magazine.css 末尾）：剪报 .mag-clip、套印大字 .mag-no、虚线引导 .mag-lead、
     栏目注释 .mag-col（横排小栏 .mag-col.h）、刊头 .mag-mast、套印插图 .mag-fig、网点圆 .mag-disc、引语 .mag-pull、跨页中缝 .mag-gutter、
     页脚 .mag-folio、文末方块 .mag-end，加上原有的封面色块 .mag-cover。它们只在杂志复古里有样子，所以这些页只给杂志复古用
   - 可读性（翻到最后一拍整页要一眼读清）：
     · 拼贴只拼「形」：大小、纸色、歪的方向可以错落，但一页只有一条阅读顺序（上到下或左到右），歪不超过 2°（--r 在 ±1.5deg 以内）
     · 套印大号数字就是顺序：01、02、03；页码另写成栏目小标里的小字 <small>P.03</small>，别拿页码当序号
     · 句子一律横排：竖排只留给「目录」这种两三个字的标签；编者按这类一句话用横排小栏 .mag-col.h
     · 刊头、页脚、栏目小标这类讲稿外的小字能少就少：一页最多一两处；一页的重点词加圈注不超过 3 处
   - 抄一页过去：id 换成 p〈讲稿页号〉，samples/magazine.css 里同一页的 [data-id="t-magazine-…"] 一起换；字照讲稿改；
     位置按字数挪（剪报不写死高度，字多了会自己变高，挪的时候看下面一块会不会被压住），改完跑 check --browser
   ===================================================================== */

/* 封面：老杂志的封面。左边一大块撕边的墨绿纸压着一枚橘红网点圆，是整页的重心，大标题反白写在绿纸上；
   右边是刊头（刊名 + 两道栏线 + 一行小字）和一个大号的套印期号「01」。1 拍：讲者那张纸条用胶带贴到右下角，小铅跳上去高兴一下。
   为什么是杂志：撕边色块 + 网点圆的撞色拼版、刊头和期号是杂志封面才有的东西；版面一边重一边轻，不对称。
   可读性：期号只出现一次（大号的 01），刊头小字只留两项；讲者纸条只写讲者和日期，不另加栏目小标。
   抄过去改：大标题、导语、刊名和刊头小字；大标题超过 4 个字一行就把 .cv-title 的字号调小（176px 一行最多放 4 个字） */
Deck.add({
  id: 't-magazine-cover',
  chapter: '开场',
  scene: 'magazine',
  title: '怎么泡好一杯茶',
  noTitle: true,
  html: `
    <div class="mag-cover abs" data-beat="0" style="left:120px;top:124px;width:900px;height:856px">
      <span class="tag abs" style="left:64px;top:62px;--r:-1.5deg">封面故事</span>
      <p class="abs cv-title">怎么<em class="key">泡好</em><br><span>一杯茶</span></p>
      <i class="abs cv-bar"></i>
      <p class="abs cv-deck">水温、茶量、时间，<br>三件事讲清楚</p>
    </div>
    <div class="mag-mast abs" data-beat="0" style="left:1080px;top:132px;width:720px"><b>新人茶话会</b><span data-small><i>冬季号</i><i>茶话特刊</i></span></div>
    <b class="mag-no abs cv-no" data-beat="0">01<small>期</small></b>
    <div class="mag-clip abs" data-beat="1" data-mascot="1" data-mascot-side="top" data-mascot-x=".9" data-mascot-pose="happy" style="left:1080px;top:792px;width:720px;--r:-1.2deg">
      <p>讲者：〈你的名字〉　·　〈日期〉</p>
    </div>
    <div class="mascot guide" data-face="left" style="left:1038px;top:433px"></div>`,
  notes: [
    { beat: 0, key: '泡好', say: '大家好，这一期新人茶话会，封面故事就一件小事：怎么泡好一杯茶。' },
    { beat: 1, say: '我是〈你的名字〉，平时爱喝茶，也踩过不少坑。' },
  ],
});

/* 拼贴目录（招牌页）：杂志的目录页。左边一个竖排的大号套印「目录」，右边三张剪报从上往下排成一列，每张一篇，
   左边探出一个套印大序号 01、02、03（就是阅读顺序），栏目小标的右头写这篇在第几页（P.03）；
   一拍贴一张：先贴一张纸白的，再贴一张墨绿纸的，最后贴一张旧报纸色的，像把要目一张张剪下来拼到版面上；
   右边一枚网点圆给拼贴一个撞色的底，只让中间那张的胶带压上去、不垫在纸条后面（讲过的纸条退到 .8，底下的网点会透出来发脏）。
   小铅每拍跳到刚贴上的那张右边。
   为什么是杂志：目录 + 序号 + 页码是杂志的结构；剪报宽窄、纸色、左右错开和歪的方向都不一样，拼贴感来自「不整齐」，
   但三张只沿一条线从上往下排，序号一眼就看出先读哪张。
   抄过去改：每张剪报的序号（data-no：01、02、03，就是顺序）、栏目小标和页码（<small>P.几</small>）、标题、一句话；
   篇数 2 到 4 张：照这一列往下排，每张约 215px 高（三行字），四张时把 .ct-item 的标题、一句话合成一行 */
Deck.add({
  id: 't-magazine-contents',
  chapter: '开场',
  topic: '本期目录',
  scene: 'magazine',
  title: '这一期，只讲三件事',
  html: `
    <i class="mag-disc abs" data-beat="0" style="left:1474px;top:500px;width:326px"></i>
    <b class="mag-no abs ct-word" data-beat="0">目录</b>
    <div class="mag-clip side abs ct-item" data-beat="1" data-no="01" data-mascot="1" data-mascot-side="right" style="left:640px;top:258px;width:860px;--r:-.8deg">
      <span class="mag-kick" data-small>备器<small>P.03</small></span><h3>三样东西，备齐再动手</h3><p>盖碗、茶叶、热水，一样不能少</p>
    </div>
    <div class="mag-clip side ink-g abs ct-item" data-beat="2" data-no="02" data-mascot="2" data-mascot-side="right" style="left:790px;top:498px;width:660px;--r:1deg">
      <span class="mag-kick" data-small>图解<small>P.04</small></span><h3>泡茶只要三步</h3><p>温杯、投茶、注水</p>
    </div>
    <div class="mag-clip side news abs ct-item" data-beat="3" data-no="03" data-mascot="3" data-mascot-side="right" style="left:700px;top:738px;width:740px;--r:-.6deg">
      <span class="mag-kick" data-small>特写<small>P.05</small></span><h3>八十度的秘密</h3><p>茶苦，多半是水太烫</p>
    </div>
    <div class="mascot guide" style="left:300px;top:836px"></div>`,
  notes: [
    { beat: 0, say: '先看一眼这一期的目录，一共三篇。' },
    { beat: 1, key: '备器', say: '第一篇在第 3 页：动手之前，三样东西要备齐。' },
    { beat: 2, key: '三步', say: '第二篇在第 4 页：泡茶其实只要三步。' },
    { beat: 3, key: '八十度', say: '第三篇是特写：八十度，茶不苦的秘密。' },
  ],
});

/* 器物图鉴：杂志的「好物」版。三样东西画成一排双色版画（墨线 + 墨绿 + 橘红网点，套印略微错位），站在一道双栏线的「桌沿」上，
   盖碗最大、背后压着一枚网点圆，是整页的重心；下面三张图注一拍贴一张：先从图注的位置描一条虚线到那样东西上（橘红圆点落下），
   再把图注贴到线的尽头。小铅每拍跟到刚贴的图注旁边。
   为什么是杂志：图片为主、图注为辅，靠虚线把字和东西连起来，是杂志介绍物件的老办法；三样东西大小不一，不排成一样大的三格。
   可读性：三张图注从左往右一条线；图注只写标题和一句话（不加和标题重复的栏目小标）；强调一共 3 处：
   前两拍的重点词贴橘红纸条，第 3 拍换成橘红笔圈出「八十度」。
   抄过去改：换插图就换 .mag-fig 里的 svg（用 magazine.css 里列的那几个上色类，别写死颜色）；图注的字；虚线的起点和角度
   （起点在图注上沿，终点落在东西身上：终点 = 起点 + 长度 ×（cos 角度, sin 角度），朝上是负的角度） */
Deck.add({
  id: 't-magazine-list',
  chapter: '一、准备',
  topic: '要备的三样东西',
  scene: 'magazine',
  title: '泡茶之前，备好三样东西',
  html: `
    <p class="explain" data-beat="0"><b>盖碗</b>：带盖的小茶碗，泡茶、闻香、出汤都用它</p>
    <i class="mag-disc abs" data-beat="0" style="left:430px;top:262px;width:330px"></i>
    <i class="abs ls-shelf"></i>
    <div class="mag-fig abs" data-beat="0" style="left:170px;top:300px;width:440px">
      <svg viewBox="0 0 400 330" aria-hidden="true">
        <ellipse class="sh" cx="200" cy="314" rx="182" ry="13"/>
        <path class="w k" d="M32 282 Q34 302 200 306 Q366 302 368 282 Z"/>
        <ellipse class="w k" cx="200" cy="282" rx="168" ry="24"/>
        <path class="w k" d="M160 256 L164 282 L236 282 L240 256 Z"/>
        <path class="w k" d="M86 166 C90 236 140 266 200 266 C260 266 310 236 314 166 Z"/>
        <path class="g" d="M89 190 Q200 214 311 190 L308 208 Q200 234 92 208 Z"/>
        <path class="k thin" d="M89 190 Q200 214 311 190 M92 208 Q200 234 308 208"/>
        <path class="w k" d="M104 164 C110 120 150 106 200 106 C250 106 290 120 296 164 Q200 182 104 164 Z"/>
        <path class="k thin" d="M114 150 Q200 166 286 150"/>
        <path class="w k" d="M180 108 C180 98 183 92 187 89 L213 89 C217 92 220 98 220 108 Z"/>
        <ellipse class="w k" cx="200" cy="89" rx="15" ry="5"/>
        <path class="k thin" d="M180 72 q-9 -11 0 -22 q9 -11 0 -22 M200 66 q-9 -11 0 -22 q9 -11 0 -22 q-9 -11 0 -20 M220 72 q-9 -11 0 -22 q9 -11 0 -22"/>
        <g class="plate">
          <path class="od" d="M98 214 Q200 240 302 214 C290 248 250 264 200 264 C150 264 110 248 98 214 Z"/>
          <path class="od" d="M212 110 C252 112 284 126 292 158 Q262 164 238 150 Q216 136 212 110 Z"/>
          <path class="od" d="M250 300 Q330 296 364 284 Q352 298 306 303 Z"/>
        </g>
      </svg>
    </div>
    <div class="mag-fig abs" data-beat="0" style="left:790px;top:470px;width:320px">
      <svg viewBox="0 0 320 190" aria-hidden="true">
        <ellipse class="sh" cx="160" cy="178" rx="146" ry="10"/>
        <path class="w k" d="M30 140 Q36 168 160 172 Q284 168 290 140 Z"/>
        <ellipse class="w k" cx="160" cy="140" rx="130" ry="24"/>
        <ellipse class="k thin" cx="160" cy="138" rx="104" ry="15"/>
        <g class="k thin">
          <path class="g" transform="translate(92 132) rotate(12) scale(0.9)" d="M-38 0 C-20 -17 18 -17 38 0 C18 15 -20 15 -38 0 Z M-32 0 Q0 -3 32 0"/>
          <path class="g" transform="translate(228 134) rotate(-14) scale(0.9)" d="M-38 0 C-20 -17 18 -17 38 0 C18 15 -20 15 -38 0 Z M-32 0 Q0 -3 32 0"/>
          <path class="w" transform="translate(120 118) rotate(-26) scale(1)" d="M-38 0 C-20 -17 18 -17 38 0 C18 15 -20 15 -38 0 Z"/><path class="gd" transform="translate(120 118) rotate(-26) scale(1)" d="M-38 0 C-20 -17 18 -17 38 0 C18 15 -20 15 -38 0 Z"/><path transform="translate(120 118) rotate(-26) scale(1)" d="M-38 0 C-20 -17 18 -17 38 0 C18 15 -20 15 -38 0 Z M-32 0 Q0 -3 32 0"/>
          <path class="g" transform="translate(200 116) rotate(24) scale(1)" d="M-38 0 C-20 -17 18 -17 38 0 C18 15 -20 15 -38 0 Z M-32 0 Q0 -3 32 0"/>
          <path class="w" transform="translate(160 126) rotate(-4) scale(1.1)" d="M-38 0 C-20 -17 18 -17 38 0 C18 15 -20 15 -38 0 Z"/><path class="gd" transform="translate(160 126) rotate(-4) scale(1.1)" d="M-38 0 C-20 -17 18 -17 38 0 C18 15 -20 15 -38 0 Z"/><path transform="translate(160 126) rotate(-4) scale(1.1)" d="M-38 0 C-20 -17 18 -17 38 0 C18 15 -20 15 -38 0 Z M-32 0 Q0 -3 32 0"/>
          <path class="g" transform="translate(140 96) rotate(16) scale(0.95)" d="M-38 0 C-20 -17 18 -17 38 0 C18 15 -20 15 -38 0 Z M-32 0 Q0 -3 32 0"/>
          <path class="w" transform="translate(184 92) rotate(-28) scale(0.9)" d="M-38 0 C-20 -17 18 -17 38 0 C18 15 -20 15 -38 0 Z"/><path class="gd" transform="translate(184 92) rotate(-28) scale(0.9)" d="M-38 0 C-20 -17 18 -17 38 0 C18 15 -20 15 -38 0 Z"/><path transform="translate(184 92) rotate(-28) scale(0.9)" d="M-38 0 C-20 -17 18 -17 38 0 C18 15 -20 15 -38 0 Z M-32 0 Q0 -3 32 0"/>
          <path class="g" transform="translate(160 74) rotate(6) scale(0.85)" d="M-38 0 C-20 -17 18 -17 38 0 C18 15 -20 15 -38 0 Z M-32 0 Q0 -3 32 0"/>
        </g>
        <g class="plate">
          <path class="od" d="M226 158 Q276 152 288 142 Q282 162 236 168 Z"/>
          <path class="od" d="M168 60 Q214 70 226 118 Q196 104 168 60 Z"/>
        </g>
      </svg>
    </div>
    <div class="mag-fig abs" data-beat="0" style="left:1290px;top:288px;width:340px">
      <svg viewBox="0 0 340 380" aria-hidden="true">
        <ellipse class="sh" cx="172" cy="364" rx="144" ry="12"/>
        <path class="k" style="stroke-width:9" d="M112 190 C108 74 232 74 228 190"/>
        <path class="w k" d="M102 260 C72 250 52 226 38 196 L52 188 C66 212 86 230 110 236 Z"/>
        <path class="w" d="M92 352 C64 300 66 226 104 196 C128 178 148 172 170 172 C192 172 212 178 236 196 C274 226 276 300 248 352 Z"/>
        <path class="g" d="M77 316 C120 330 220 330 263 316 C260 330 255 342 248 352 L92 352 C85 342 80 330 77 316 Z"/>
        <path class="k" d="M92 352 C64 300 66 226 104 196 C128 178 148 172 170 172 C192 172 212 178 236 196 C274 226 276 300 248 352 Z M77 316 C120 330 220 330 263 316"/>
        <path class="w k" d="M124 184 C132 164 150 158 170 158 C190 158 208 164 216 184 Q170 194 124 184 Z"/>
        <path class="w k" d="M163 158 L165 148 L175 148 L177 158 Z"/>
        <ellipse class="w k" cx="170" cy="146" rx="15" ry="7"/>
        <circle class="w k" cx="112" cy="190" r="7"/>
        <circle class="w k" cx="228" cy="190" r="7"/>
        <path class="k thin" d="M34 178 q-10 -12 0 -24 q10 -12 0 -24 M56 170 q-9 -11 0 -22 q9 -11 0 -22"/>
        <g class="plate">
          <path class="od" d="M206 182 C242 194 268 228 270 280 C270 296 268 306 264 314 Q236 322 214 322 C232 286 232 228 206 182 Z"/>
          <path class="od" d="M182 162 Q204 164 212 180 Q196 180 182 162 Z"/>
        </g>
      </svg>
    </div>
    <i class="mag-lead dot abs" data-beat="1" style="left:430px;top:716px;width:150px;--r:-90deg"></i>
    <div class="mag-clip abs" data-beat="1" data-mascot="1" data-mascot-side="right" style="left:150px;top:724px;width:520px;--r:-1.2deg">
      <h3>一只<em class="key">盖碗</em></h3><p>白瓷的最好，看得清茶色</p>
    </div>
    <i class="mag-lead dot abs" data-beat="2" style="left:986px;top:744px;width:150px;--r:-92deg"></i>
    <div class="mag-clip abs" data-beat="2" data-mascot="2" data-mascot-side="right" style="left:760px;top:750px;width:440px;--r:1.2deg">
      <h3><em class="key">三克</em>绿茶</h3><p>大约铺满碗底薄薄一层</p>
    </div>
    <i class="mag-lead dot abs" data-beat="3" style="left:1560px;top:708px;width:200px;--r:-106deg"></i>
    <div class="mag-clip abs" data-beat="3" data-mascot="3" data-mascot-side="top" data-mascot-x=".96" style="left:1290px;top:716px;width:510px;--r:-.8deg">
      <h3>一壶热水</h3><p>烧开后晾到<span data-mark="circle">八十度</span></p>
    </div>
    <div class="mascot guide" data-face="left" style="left:1688px;top:522px"></div>`,
  notes: [
    { beat: 0, key: '盖碗', say: '动手之前先备齐东西。盖碗就是带盖的小茶碗，泡、闻、倒都用它。' },
    { beat: 1, key: '盖碗', say: '第一样是盖碗，白瓷的最好，茶汤什么颜色一眼就看清。' },
    { beat: 2, key: '三克', say: '第二样是茶叶，三克就够，大约铺满碗底薄薄一层。' },
    { beat: 3, key: '八十度', say: '第三样是热水。水烧开后别急，晾到八十度左右再用。' },
  ],
});

/* 图解步骤：杂志里的图解。三张纸条从左上往右下错开着贴，每张左边一个大号套印序号（01、02、03）；
   每拍先从上一张纸条描一条虚线箭头下来，再把这一步的纸条贴到箭头底下，序号的橘红一版随后对准；
   第 3 拍左下角再贴一张「剪下这一行」的剪角券（点一下复制），压住斜线左下的空白。小铅每拍顺着箭头往下走一格。
   为什么是杂志：编号大字 + 错开的纸条 + 虚线引导，是杂志「图解」栏目的样子；一路斜着往下走，比横排三格有方向感。
   可读性：序号 + 箭头串成一条路，纸条歪不超过 1°；讲稿外的字不加（标题已经说了是三步）。
   抄过去改：每步的标题和一句话；步数 2 到 4 步时照斜线再排一张（纸条左边要留出约 170px 放序号）；
   虚线的起点在上一张的右边，终点刚好落在下一张的上沿上方（换了位置要重算，算法见 magazine.css 的 .mag-lead） */
Deck.add({
  id: 't-magazine-steps',
  chapter: '二、动手',
  topic: '泡茶三步',
  scene: 'magazine',
  title: '泡一杯绿茶，只要三步',
  html: `
    <div class="mag-clip side abs st-step" data-beat="1" data-no="01" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".5" style="left:340px;top:262px;width:470px;--r:-1deg">
      <h3><em class="key">温杯</em></h3><p>热水把盖碗烫一遍</p>
    </div>
    <i class="mag-lead abs" data-beat="2" style="left:820px;top:350px;width:196px;--r:32deg"></i>
    <div class="mag-clip side abs st-step" data-beat="2" data-no="02" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".5" style="left:840px;top:472px;width:470px;--r:.8deg">
      <h3><em class="key">投茶</em></h3><p>三克茶叶铺满碗底</p>
    </div>
    <i class="mag-lead abs" data-beat="3" style="left:1320px;top:560px;width:196px;--r:32deg"></i>
    <div class="mag-clip side abs st-step" data-beat="3" data-no="03" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".5" style="left:1330px;top:682px;width:470px;--r:-.6deg">
      <h3><em class="key">注水</em></h3><p>八十度水沿碗边倒</p>
    </div>
    <span class="mag-kick abs" data-beat="3" data-small style="left:150px;top:842px">懒得记？剪下这一行</span>
    <button class="copy abs" type="button" data-beat="3" style="left:150px;top:892px;--r:-.8deg" data-copy="tea brew --green --temp 80">tea brew --green --temp 80</button>
    <div class="mascot guide" style="left:400px;top:560px"></div>`,
  notes: [
    { beat: 0, key: '三步', say: '东西备齐了，泡一杯绿茶其实只要三步。' },
    { beat: 1, key: '温杯', say: '第一步温杯：热水把盖碗里外烫一遍，倒掉。' },
    { beat: 2, key: '投茶', say: '第二步投茶：三克茶叶放进去，铺满碗底就行。' },
    { beat: 3, key: '注水', say: '第三步注水：八十度的水沿着碗边慢慢倒。懒得记的话，这张券点一下就能复制。' },
  ],
});

/* 跨页大特写（招牌页）：杂志摊开的左右两页，中间一道装订缝的阴影。左页一个占满半版的套印大数字「80℃」，
   右页一句大号金句一行行排上来，紧跟着下面一条横排的「编者按」小栏（第 1 拍），最下面贴一张小剪报回答「怎么知道到了八十度」（第 2 拍）；
   左下角一行页脚（P.05，和目录页写的页码对上）。小铅先站在大数字脚边，再走到金句旁、剪报旁。
   为什么是杂志：跨页、中缝、页脚、编者按小栏、巨大的套印数字，全是印刷品的版式语言；一句话占大半版，只有杂志敢这么排。
   可读性：右页从上往下一条线（金句 → 编者按 → 剪报）；编者按是一句话，横排；讲稿外的小字只留一行页脚。
   抄过去改：大数字（.ft-no，一到三个字符；字多了把字号调小）、金句（三行以内，一行不超过 5 个字）、编者按（一行，16 个字以内）、剪报的字；
   这页不画大标题（noTitle），title 照样写那句金句，演讲者视图和阅读模式要用 */
Deck.add({
  id: 't-magazine-feature',
  chapter: '二、动手',
  topic: '特写：八十度',
  scene: 'magazine',
  title: '开水别急，晾到八十度再冲茶',
  noTitle: true,
  html: `
    <i class="mag-gutter"></i>
    <span class="tag abs" data-beat="0" style="left:120px;top:126px;--r:-1.5deg">特写</span>
    <b class="mag-no abs ft-no" data-beat="0">80<small>℃</small></b>
    <p class="abs ft-deck" data-beat="0">绿茶最舒服的水温</p>
    <p class="abs ft-quote" data-beat="1" data-recede="off" data-mascot="1" data-mascot-side="left" data-mascot-dy="40">开水别急，<br>晾到<em class="key">八十度</em><br>再冲茶。</p>
    <p class="mag-col h abs ft-note" data-beat="1"><b data-small>编者按</b>绿茶娇嫩，沸水会把它烫熟</p>
    <div class="mag-clip abs" data-beat="2" data-mascot="2" data-mascot-side="right" style="left:1070px;top:796px;width:540px;--r:1.2deg">
      <h3>怎么知道到了八十度？</h3><p>烧开后开盖，晾三分钟左右</p>
    </div>
    <p class="mag-folio abs" data-small style="left:120px;top:1006px"><b>P.05</b>新人茶话会</p>
    <div class="mascot guide" data-face="left" style="left:742px;top:560px"></div>`,
  notes: [
    { beat: 0, key: '八十度', say: '这一页只讲一个数字：八十度，绿茶最舒服的水温。' },
    { beat: 1, key: '八十度', say: '开水别急着冲，晾到八十度再冲。绿茶娇嫩，沸水一冲就烫熟了，汤色发黄，还发苦。' },
    { beat: 2, say: '没有温度计也不要紧：水烧开以后开着盖，晾三分钟左右就差不多了。' },
  ],
});

/* 封底（结尾）：和封面首尾呼应。右边一大块撕边墨绿纸（撕边在左、网点圆从左边探出来），上面一句大号引语，前后一对橘红的大引号；
   左边是小一号的刊头。1 拍：「谢谢大家」那张纸条贴到左下、压住网点圆的一角，句末一个文末方块，小铅跳上去说谢谢。署名由引擎自动加在右下角。
   为什么是杂志：封底和封面同一套拼版（色块 + 网点圆 + 刊头），引语加大引号、文末方块都是排版里的老规矩。
   可读性：刊头小字只留「全文完」一项；引语米白字压在实色墨绿纸上，网点圆只从纸边探出来，不垫在字下面。
   抄过去改：引语两行以内（130px 一行最多 5 个字）、刊头的字、致谢的字；y 990 以下留给署名，别放东西 */
Deck.add({
  id: 't-magazine-end',
  chapter: '结尾',
  scene: 'magazine',
  title: '谢谢',
  noTitle: true,
  html: `
    <div class="mag-cover left abs" data-beat="0" style="left:700px;top:132px;width:1100px;height:800px">
      <span class="tag abs" style="left:160px;top:72px;--r:1.5deg">编后记</span>
      <p class="mag-pull abs ed-quote">水温对了，<br>茶就<em class="key">不苦</em></p>
    </div>
    <div class="mag-mast abs ed-mast" data-beat="0" style="left:120px;top:140px;width:470px"><b>新人茶话会</b><span data-small><i>全文完</i></span></div>
    <div class="mag-clip abs" data-beat="1" data-mascot="1" data-mascot-side="top" data-mascot-x=".8" data-mascot-pose="happy" data-mascot-say="谢谢！" style="left:140px;top:716px;width:560px;--r:-1.2deg">
      <p class="ed-thanks">谢谢大家，欢迎提问<i class="mag-end"></i></p>
    </div>
    <div class="mascot guide" data-face="left" style="left:548px;top:409px"></div>`,
  notes: [
    { beat: 0, key: '不苦', say: '最后只记一句：水温对了，茶就不苦。' },
    { beat: 1, say: '谢谢大家，有问题现在可以问。' },
  ],
});
