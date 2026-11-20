/* =====================================================================
   方格纸 paper 自己的样板页（虚构主题：怎么泡好一杯茶）
   - 内容和通用样板（samples.js）对应：封面、要备的三样东西、泡茶三步、收尾金句；另加两页只有学习笔记做得出来的招牌页：
     红笔订正（第 4 页：三个坑写成练习题，红笔批改）、坐标纸推演（第 5 页：在方格上用尺子画一条水温线，推出三个数）
   - 版式全按一本学习笔记来：字写在方格里（48px 的字一个字一格、96px 四格，框的边放在 48 的倍数上），
     一页一种笔记的写法——大括号归纳、图解（图 1、图 2、图 3）、作业订正、坐标图、框出重点；
     每拍是笔在纸上动：铅笔写一行字、尺子压着拉一条线、铅笔描一张速写、红笔划掉再写对的、便签翘着角贴上
   - 用到的方格纸自有组件（.pp-*，用法见 scenes/paper.js 开头）：手写字 .pp-hand、红笔字 .pp-red、圈码 .pp-no、一行笔记 .pp-row、
     铅笔速写 .pp-fig、尺子线 .pp-rule（.dash .arrow .dim、data-tick）、尺子框 .pp-frame、描点 .pp-dot、便签 .pp-note、
     红笔订正 .pp-fix（.pp-arw 箭头、.pp-tick 勾）、页边线 .pp-margin。它们只在方格纸里有样子，所以这些页只给方格纸用
   - 可读性（翻到最后一拍整页要一眼读清）：
     · 写出来的都留在页上；错的做法用红笔划一道，划掉的字照样读得清，旁边写对的
     · 一页一条阅读路径：从左往右、从上往下，或者用编号（1、2、3 / 图 1、图 2、图 3）串起来
     · 句子横排；便签歪不超过 1.5°；一页的强调（荧光笔、红字、圈）不超过 3 处，红笔只给订正
     · 速写、坐标线只是图，真正要记的话（三样东西、三步、三个数）都直接写成字
   - 抄一页过去：id 换成 p〈讲稿页号〉，samples/paper.css 里同一页的 [data-id="t-paper-…"] 一起换；字照讲稿改；
     位置尽量放在 48 的倍数上（对齐方格）；改完跑 check --browser
   - 页面里不写 data-in：写字、拉线、贴便签都由风格按类名选好出场；同一拍里的先后用 data-delay 排（一拍的动作引擎会压在约 1.2 秒内）
   ===================================================================== */

/* 封面：笔记本的第一页。左边大标题写在方格里（144px，一个字占九格），下面用尺子拉两道下划线，再写一行副题；
   右边一张铅笔速写：盖碗冒着热气，旁边两片茶叶。1 拍：讲者那张黄便签翘着角贴上来，尖尖跳上去高兴一下。
   为什么是方格纸：标题写在格子里、尺子画双下划线、页边随手画速写，是学生记笔记的第一页；没有封面图，靠手写和速写。
   可读性：一条路从上往下读——标题 → 副题 → 便签；强调只有标题里的「泡好」一处荧光笔。
   抄过去改：标题（7 个字以内一行；字多了把 .cv-title 的字号改成 96px）、副题、便签上的字；下划线的宽度跟着标题的宽度改 */
Deck.add({
  id: 't-paper-cover',
  chapter: '开场',
  scene: 'paper',
  title: '怎么泡好一杯茶',
  noTitle: true,
  html: `
    <p class="pp-hand abs cv-title" data-beat="0">怎么<em class="key">泡好</em>一杯茶</p>
    <i class="pp-rule abs" data-beat="0" data-delay=".4" style="left:192px;top:432px;width:1056px"></i>
    <i class="pp-rule abs" data-beat="0" data-delay=".55" style="left:192px;top:446px;width:1008px"></i>
    <p class="pp-hand abs cv-sub" data-beat="0" data-delay=".75">水温、茶量、时间，三件事讲清楚</p>
    <div class="pp-fig abs" data-beat="0" data-delay=".25" style="left:1296px;top:264px;width:432px">
      <svg viewBox="0 0 432 456" aria-hidden="true">
        <path class="hl" d="M92 318 C100 290 170 282 236 286 C300 290 350 300 346 330 C342 360 280 372 206 370 C136 368 86 350 92 318 Z"/>
        <ellipse cx="216" cy="404" rx="160" ry="18"/>
        <path d="M56 406 C62 428 122 438 216 438 C310 438 370 428 376 406"/>
        <path d="M178 398 L182 382 L250 382 L254 398"/>
        <path d="M100 264 C104 340 152 382 216 382 C280 382 328 340 332 264"/>
        <path class="lt" d="M110 298 Q216 320 322 298"/>
        <ellipse cx="216" cy="264" rx="116" ry="18"/>
        <path d="M118 260 C126 210 170 190 216 190 C262 190 306 210 314 260"/>
        <path class="lt" d="M128 246 Q216 264 304 246"/>
        <path d="M198 190 L200 174 L232 174 L234 190"/>
        <ellipse cx="216" cy="172" rx="18" ry="6"/>
        <path class="lt" d="M180 150 q-14 -16 0 -32 q14 -16 0 -32"/>
        <path class="lt" d="M216 140 q-14 -16 0 -32 q14 -16 0 -32 q-14 -16 0 -30"/>
        <path class="lt" d="M252 150 q-14 -16 0 -32 q14 -16 0 -32"/>
        <g transform="translate(330 96) rotate(-28)"><path d="M0 0 C14 -16 46 -16 60 0 C46 16 14 16 0 0 Z"/><path class="lt" d="M4 0 Q30 -3 56 0"/></g>
        <g transform="translate(352 156) rotate(18) scale(.75)"><path d="M0 0 C14 -16 46 -16 60 0 C46 16 14 16 0 0 Z"/><path class="lt" d="M4 0 Q30 -3 56 0"/></g>
      </svg>
    </div>
    <div class="pp-note t-yellow abs cv-note" data-beat="1" data-mascot="1" data-mascot-side="top" data-mascot-x=".86" data-mascot-pose="happy" style="left:192px;top:720px;--r:-1.2deg">
      <p>讲者：〈你的名字〉　·　〈日期〉</p>
    </div>
    <div class="mascot guide" data-face="left" style="left:1600px;top:792px"></div>`,
  notes: [
    { beat: 0, key: '泡好', say: '大家好，今天聊一件小事：怎么泡好一杯茶。' },
    { beat: 1, say: '我是〈你的名字〉，平时爱喝茶，也踩过不少坑。' },
  ],
});

/* 清单（大括号归纳）：学生归纳知识点的写法。左边写「三样东西」，一个大括号把右边三行括起来；
   每行是圈码 + 物名（48px，一个字一格）+ 下面一行说明，行尾随手画一张小速写（盖碗、茶叶、水壶）。
   第 0 拍：一句话解释写出来，「三样东西」写出来，大括号一笔描出来；第 1–3 拍：每拍一行——圈码圈出来 → 物名、说明写出来 → 小速写描出来，
   重点词随后划上荧光笔。尖尖每拍站到刚画好的速写右边。
   为什么是方格纸：大括号归纳、圈码、行尾小图，是课堂笔记最常见的样子；一行一行往下记，比三张卡片更像在本子上写。
   可读性：从左往右（总 → 分）、再从上往下；说明横排；荧光笔三处（盖碗、三克、八十度）。
   抄过去改：左边的总称（4 个字以内，两行）、三行的物名（6 个字以内）和说明（14 个字以内）；换速写就换 .pp-fig 里的 svg；
   行数 2 到 4 行：照 192px 一行往下排，大括号的高度跟着改（svg 的 viewBox 高度和 .ls-brace 的 top 一起改） */
Deck.add({
  id: 't-paper-list',
  chapter: '一、准备',
  topic: '要备的三样东西',
  scene: 'paper',
  title: '泡茶之前，备好三样东西',
  html: `
    <p class="explain" data-beat="0"><b>盖碗</b>：带盖的小茶碗，泡茶、闻香、出汤都用它</p>
    <p class="pp-hand abs ls-head" data-beat="0" data-delay=".2">三样<br>东西</p>
    <div class="pp-fig abs ls-brace" data-beat="0" data-delay=".5" style="left:432px;top:248px;width:48px">
      <svg viewBox="0 0 48 576" aria-hidden="true"><path d="M40 6 C22 6 24 30 24 70 L24 238 C24 272 14 286 6 288 C14 290 24 304 24 338 L24 506 C24 546 22 570 40 570"/></svg>
    </div>
    <div class="pp-row abs ls-row" data-beat="1" style="left:528px;top:288px">
      <b class="pp-no">1</b>
      <h3 class="pp-hand">一只<em class="key">盖碗</em></h3>
      <p class="pp-hand">白瓷的最好，看得清茶色</p>
      <div class="pp-fig" data-mascot="1" data-mascot-side="right">
        <svg viewBox="0 0 160 160" aria-hidden="true">
          <ellipse cx="80" cy="142" rx="62" ry="8"/>
          <path d="M30 94 C32 124 54 136 80 136 C106 136 128 124 130 94"/>
          <ellipse cx="80" cy="94" rx="50" ry="9"/>
          <path d="M36 92 C40 68 60 58 80 58 C100 58 120 68 124 92"/>
          <path d="M72 58 L73 50 L87 50 L88 58"/>
          <path class="lt" d="M80 38 q-7 -8 0 -16 q7 -8 0 -16"/>
        </svg>
      </div>
    </div>
    <div class="pp-row abs ls-row" data-beat="2" style="left:528px;top:480px">
      <b class="pp-no">2</b>
      <h3 class="pp-hand"><em class="key">三克</em>绿茶</h3>
      <p class="pp-hand">大约铺满碗底薄薄一层</p>
      <div class="pp-fig" data-mascot="2" data-mascot-side="right">
        <svg viewBox="0 0 160 160" aria-hidden="true">
          <path class="tea" d="M34 132 C44 110 116 110 126 132 Z"/>
          <path d="M22 126 Q80 152 138 126"/>
          <g transform="translate(30 76) rotate(-22)"><path d="M0 0 C12 -14 40 -14 52 0 C40 14 12 14 0 0 Z"/><path class="lt" d="M4 0 Q26 -3 48 0"/></g>
          <g transform="translate(84 46) rotate(28)"><path d="M0 0 C12 -14 40 -14 52 0 C40 14 12 14 0 0 Z"/><path class="lt" d="M4 0 Q26 -3 48 0"/></g>
          <g transform="translate(70 100) rotate(-6) scale(.85)"><path d="M0 0 C12 -14 40 -14 52 0 C40 14 12 14 0 0 Z"/><path class="lt" d="M4 0 Q26 -3 48 0"/></g>
        </svg>
      </div>
    </div>
    <div class="pp-row abs ls-row" data-beat="3" style="left:528px;top:672px">
      <b class="pp-no">3</b>
      <h3 class="pp-hand">一壶热水</h3>
      <p class="pp-hand">烧开后晾到<em class="key">八十度</em></p>
      <div class="pp-fig" data-mascot="3" data-mascot-side="right">
        <svg viewBox="0 0 160 160" aria-hidden="true">
          <path d="M40 138 C34 98 48 70 80 70 C112 70 126 98 120 138 Z"/>
          <path d="M62 72 C64 60 96 60 98 72"/>
          <circle cx="80" cy="56" r="5"/>
          <path d="M118 86 C146 86 146 128 120 128"/>
          <path d="M44 106 C30 102 22 88 14 76 L22 72 C28 84 36 94 46 96"/>
          <path class="lt" d="M14 60 q-6 -8 0 -16 q6 -8 0 -16"/>
        </svg>
      </div>
    </div>
    <div class="mascot guide" data-face="left" style="left:1640px;top:840px"></div>`,
  notes: [
    { beat: 0, key: '盖碗', say: '动手之前先备齐东西。盖碗就是带盖的小茶碗，泡、闻、倒都用它。' },
    { beat: 1, key: '盖碗', say: '第一样是盖碗，白瓷的最好，茶汤什么颜色一眼就看清。' },
    { beat: 2, key: '三克', say: '第二样是茶叶，三克就够，大约铺满碗底薄薄一层。' },
    { beat: 3, key: '八十度', say: '第三样是热水。水烧开后别急，晾到八十度左右再用。' },
  ],
});

/* 步骤（图解三步）：课本里的分步图。三张铅笔速写站在同一道尺子画的桌沿线上，下面各写一行图注「图 1　温杯」和一句说明，
   图和图之间用尺子拉一支箭头。第 0 拍：尺子拉出桌沿线；第 1–3 拍：（箭头先拉出来）→ 这一步的速写一笔笔描出来 → 图注、说明写出来，
   步骤名随后划上荧光笔；第 3 拍最后一张黄便签（可复制的命令）翘着角贴到右下角。尖尖每拍站到刚画完的那张图下面，最后站到便签旁边。
   为什么是方格纸：「图 1、图 2、图 3」加图注是课本和实验笔记的写法；速写是现场一笔笔描出来的，不是一排卡片弹出来。
   可读性：从左往右一条路，编号就是顺序；每一步的真话（温杯：热水把盖碗烫一遍……）直接写在图下面，看不懂图也读得懂。
   抄过去改：图注和说明的字（说明 10 个字以内）；换速写就换 svg（viewBox 432×336，底边 y 336 正好落在桌沿线上）；
   步数 2 到 4 步：图的宽度改成（1632 − 箭头空当）÷ 步数，箭头放在两张图之间的空当里 */
Deck.add({
  id: 't-paper-steps',
  chapter: '二、动手',
  topic: '泡茶三步',
  scene: 'paper',
  title: '泡一杯绿茶，只要三步',
  html: `
    <i class="pp-rule abs" data-beat="0" style="left:144px;top:624px;width:1632px"></i>
    <div class="pp-fig abs st-fig" data-beat="1" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".5" style="left:144px;top:288px">
      <svg viewBox="0 0 432 336" aria-hidden="true">
        <ellipse cx="260" cy="326" rx="118" ry="9"/>
        <path d="M226 318 L229 306 L291 306 L294 318"/>
        <path d="M168 222 C172 282 212 306 260 306 C308 306 348 282 352 222"/>
        <ellipse cx="260" cy="222" rx="92" ry="14"/>
        <path d="M30 332 C38 302 62 292 84 292 C106 292 130 302 138 332 Z"/>
        <path d="M76 292 L77 284 L91 284 L92 292"/>
        <g transform="translate(100 112) rotate(28)">
          <path d="M-56 40 C-64 -10 -44 -48 0 -48 C44 -48 64 -10 56 40 Z"/>
          <path d="M-26 -46 C-22 -62 22 -62 26 -46"/>
          <ellipse cx="0" cy="-65" rx="8" ry="4"/>
          <path d="M-52 -22 C-94 -22 -94 30 -56 30"/>
          <path d="M52 4 C72 -2 84 -24 98 -40 L104 -34 C92 -16 82 8 56 20"/>
        </g>
        <path class="lt" d="M206 130 C222 152 242 184 250 214"/>
        <path class="lt" d="M302 196 q-10 -12 0 -24 q10 -12 0 -24"/>
        <path class="lt" d="M328 202 q-10 -12 0 -24 q10 -12 0 -24"/>
      </svg>
      <p class="pp-hand st-cap"><span>图 1</span><em class="key">温杯</em></p>
      <p class="pp-hand st-desc">热水把盖碗烫一遍</p>
    </div>
    <i class="pp-rule arrow abs" data-beat="2" style="left:600px;top:432px;width:120px"></i>
    <div class="pp-fig abs st-fig" data-beat="2" data-delay=".45" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".5" style="left:744px;top:288px">
      <svg viewBox="0 0 432 336" aria-hidden="true">
        <path class="tea" d="M130 222 C160 206 240 206 270 222 C240 234 160 234 130 222 Z"/>
        <ellipse cx="200" cy="326" rx="118" ry="9"/>
        <path d="M166 318 L169 306 L231 306 L234 318"/>
        <path d="M108 222 C112 282 152 306 200 306 C248 306 288 282 292 222"/>
        <ellipse cx="200" cy="222" rx="92" ry="14"/>
        <g transform="translate(238 96) rotate(-22)">
          <path d="M0 0 C34 34 124 34 160 0 C124 14 34 14 0 0 Z"/>
          <path class="lt" d="M24 10 C60 22 100 22 136 10"/>
          <g transform="translate(70 12) rotate(-8) scale(.45)"><path d="M0 0 C10 -12 34 -12 44 0 C34 12 10 12 0 0 Z"/></g>
        </g>
        <path class="lt" stroke-dasharray="6 10" d="M232 112 L212 196"/>
        <g transform="translate(212 132) rotate(32) scale(.55)"><path d="M0 0 C10 -12 34 -12 44 0 C34 12 10 12 0 0 Z"/></g>
        <g transform="translate(188 160) rotate(-24) scale(.5)"><path d="M0 0 C10 -12 34 -12 44 0 C34 12 10 12 0 0 Z"/></g>
        <g transform="translate(222 178) rotate(64) scale(.48)"><path d="M0 0 C10 -12 34 -12 44 0 C34 12 10 12 0 0 Z"/></g>
      </svg>
      <p class="pp-hand st-cap"><span>图 2</span><em class="key">投茶</em></p>
      <p class="pp-hand st-desc">三克茶叶铺满碗底</p>
    </div>
    <i class="pp-rule arrow abs" data-beat="3" style="left:1200px;top:432px;width:120px"></i>
    <div class="pp-fig abs st-fig" data-beat="3" data-delay=".45" style="left:1344px;top:288px">
      <svg viewBox="0 0 432 336" aria-hidden="true">
        <ellipse class="tea" cx="196" cy="224" rx="84" ry="10"/>
        <ellipse cx="196" cy="326" rx="118" ry="9"/>
        <path d="M162 318 L165 306 L227 306 L230 318"/>
        <path d="M104 222 C108 282 148 306 196 306 C244 306 284 282 288 222"/>
        <ellipse cx="196" cy="222" rx="92" ry="14"/>
        <g transform="translate(330 104) scale(-1 1) rotate(28)">
          <path d="M-56 40 C-64 -10 -44 -48 0 -48 C44 -48 64 -10 56 40 Z"/>
          <path d="M-26 -46 C-22 -62 22 -62 26 -46"/>
          <ellipse cx="0" cy="-65" rx="8" ry="4"/>
          <path d="M-52 -22 C-94 -22 -94 30 -56 30"/>
          <path d="M52 4 C72 -2 84 -24 98 -40 L104 -34 C92 -16 82 8 56 20"/>
        </g>
        <path class="lt" d="M222 122 C196 148 150 186 124 214"/>
        <path class="lt" stroke-dasharray="10 9" d="M116 250 C138 274 254 274 276 250"/>
        <path class="lt" d="M260 244 L278 250 L266 264"/>
      </svg>
      <p class="pp-hand st-cap"><span>图 3</span><em class="key">注水</em></p>
      <p class="pp-hand st-desc">八十度水沿碗边倒</p>
    </div>
    <button class="copy abs" type="button" data-beat="3" data-delay=".95" data-mascot="3" data-mascot-side="left" style="left:1152px;top:840px;--r:-1deg" data-copy="tea brew --green --temp 80">tea brew --green --temp 80</button>
    <div class="mascot guide" style="left:180px;top:836px"></div>`,
  notes: [
    { beat: 0, key: '三步', say: '东西备齐了，泡一杯绿茶其实只要三步。' },
    { beat: 1, key: '温杯', say: '第一步温杯：热水把盖碗里外烫一遍，倒掉。' },
    { beat: 2, key: '投茶', say: '第二步投茶：三克茶叶放进去，铺满碗底就行。' },
    { beat: 3, key: '注水', say: '第三步注水：八十度的水沿着碗边慢慢倒。懒得记的话，右下角这张便签点一下就能复制。' },
  ],
});

/* 招牌页「红笔订正」：三个坑写成一页作业。左边一道淡红页边线，线外是题号，线里是铅笔写的「我的泡法」（错的那几样）；
   第 0 拍：三行错的做法一行行用铅笔写出来；第 1–3 拍：老师的红笔一行行批改——先把错的划一道（data-mark="strike"，划了照样读得清）
   → 画一支红箭头 → 写上对的做法 → 打一个勾。尖尖每拍站到刚打的勾旁边。
   为什么是方格纸：作业本、页边线、红笔订正，是只有学习笔记才有的场面；先看到错的，再一条条改对，正好是「别踩的坑」。
   可读性：一行一个坑，从左往右读「错 → 对」，从上往下三行；错的划掉但不涂黑；红笔只用在订正上，这页不另加荧光笔。
   字是 96px，一个字正好占四格。
   抄过去改：错的做法（4 个字以内）、对的做法（6 个字以内）；行数 2 到 4 行：照 192px 一行往下排（.fx-bad 的下边距），
   .pp-fix 的 top 跟着那一行走 */
Deck.add({
  id: 't-paper-fix',
  chapter: '二、动手',
  topic: '别踩的三个坑',
  scene: 'paper',
  title: '别踩的三个坑',
  html: `
    <i class="pp-margin" style="left:288px"></i>
    <div class="pp-row abs fx-list" data-beat="0" style="left:192px;top:336px">
      <p class="fx-bad"><b class="pp-no">1</b><span class="pp-hand" data-mark="strike" data-mark-beat="1" data-mark-color="var(--pp-red)">水太烫</span></p>
      <p class="fx-bad"><b class="pp-no">2</b><span class="pp-hand" data-mark="strike" data-mark-beat="2" data-mark-color="var(--pp-red)">泡太久</span></p>
      <p class="fx-bad"><b class="pp-no">3</b><span class="pp-hand" data-mark="strike" data-mark-beat="3" data-mark-color="var(--pp-red)">茶太多</span></p>
    </div>
    <div class="pp-fix abs" data-beat="1" data-delay=".4" data-mascot="1" data-mascot-side="right" style="left:672px;top:336px">
      <svg class="pp-arw" viewBox="0 0 96 40" aria-hidden="true"><path d="M4 22 C30 17 58 17 86 20"/><path d="M70 8 L88 20 L72 32"/></svg>
      <b class="pp-red">晾到八十度</b>
      <svg class="pp-tick" viewBox="0 0 72 64" aria-hidden="true"><path d="M6 34 L26 54 L66 8"/></svg>
    </div>
    <div class="pp-fix abs" data-beat="2" data-delay=".4" data-mascot="2" data-mascot-side="right" style="left:672px;top:528px">
      <svg class="pp-arw" viewBox="0 0 96 40" aria-hidden="true"><path d="M4 21 C30 18 58 16 86 19"/><path d="M70 7 L88 19 L72 31"/></svg>
      <b class="pp-red">一分钟出汤</b>
      <svg class="pp-tick" viewBox="0 0 72 64" aria-hidden="true"><path d="M6 32 L27 54 L66 9"/></svg>
    </div>
    <div class="pp-fix abs" data-beat="3" data-delay=".4" data-mascot="3" data-mascot-side="right" style="left:672px;top:720px">
      <svg class="pp-arw" viewBox="0 0 96 40" aria-hidden="true"><path d="M4 22 C30 18 58 18 86 21"/><path d="M70 9 L88 21 L72 33"/></svg>
      <b class="pp-red">只放三克</b>
      <svg class="pp-tick" viewBox="0 0 72 64" aria-hidden="true"><path d="M6 33 L26 54 L66 7"/></svg>
    </div>
    <div class="mascot guide" data-face="left" style="left:1600px;top:820px"></div>`,
  notes: [
    { beat: 0, key: '三个坑', say: '泡茶最常踩的三个坑，我以前全踩过：水太烫、泡太久、茶太多。' },
    { beat: 1, key: '八十度', say: '第一个，水太烫。开水直接冲，绿茶会被烫熟，汤又黄又苦。改成：晾到八十度再冲。' },
    { beat: 2, key: '一分钟', say: '第二个，泡太久。泡着忘了，茶就涩了。改成：一分钟就出汤。' },
    { beat: 3, key: '三克', say: '第三个，茶太多。抓一大把，又苦又浪费。改成：只放三克。' },
  ],
});

/* 招牌页「坐标纸推演」：在方格上画一张水温图。横轴分钟、纵轴 ℃（一格 10℃，一分钟三格），用尺子一拍画一段线，
   推出来的三个数一个个写在右边的便签上。
   第 0 拍：尺子拉出横轴、纵轴（刻度跟着长出来），写上 ℃、分钟、0、80、100；
   第 1 拍：从 20℃ 一直画到 100℃（烧开），描一个点，写「100℃ 开盖晾」；
   第 2 拍：开盖往下晾，一段斜线落到 80℃，从纵轴描一条虚线过来对齐，落点打一个圈；「水温 80℃」的黄便签贴上；
   第 3 拍：落点旁写「投茶 3 克」，「茶量 3 克」的绿便签贴上；
   第 4 拍：再画一分钟的一小段，描出终点，下面画一道尺寸线写「1 分钟」，「时间 1 分钟」的粉便签贴上。
   尖尖第 1 拍站在「100℃ 开盖晾」旁边，之后每拍站到刚贴的便签左边。
   为什么是方格纸：坐标纸本来就是方格，用尺子画轴、描点、连线、打圈、画尺寸线，是只有理科笔记才有的推演；数字是推出来的，不是摆出来的。
   可读性：左边是推演（图），右边是结论（三张便签从上往下），三个数又大又直接；图上的字只留几个短标注。
   抄过去改：坐标的换算（舞台 x = 240 + 分钟 × 144，y = 864 − ℃ × 4.8）；每段线的起点、长度、角度（长度 = √(dx²+dy²)，角度 = atan(dy/dx)，往下斜是正的）；
   便签上的标签（2 个字）和数（3 个字符以内） */
Deck.add({
  id: 't-paper-graph',
  chapter: '三、记住',
  topic: '三个数',
  scene: 'paper',
  title: '一条水温线，推出三个数',
  html: `
    <i class="pp-rule arrow abs" data-beat="0" data-tick style="left:240px;top:864px;width:960px;--pp-tick:144px"></i>
    <i class="pp-rule arrow abs" data-beat="0" data-tick data-delay=".2" style="left:240px;top:864px;width:576px;--r:-90deg;--pp-tick:48px"></i>
    <p class="pp-hand abs gr-ax" data-beat="0" data-delay=".5" style="left:168px;top:264px">℃</p>
    <p class="pp-hand abs gr-tk" data-beat="0" data-delay=".55" style="left:144px;top:366px">100</p>
    <p class="pp-hand abs gr-tk" data-beat="0" data-delay=".6" style="left:144px;top:462px">80</p>
    <p class="pp-hand abs gr-tk" data-beat="0" data-delay=".65" style="left:144px;top:880px">0</p>
    <p class="pp-hand abs gr-ax" data-beat="0" data-delay=".7" style="left:1128px;top:888px">分钟</p>

    <i class="pp-rule abs" data-beat="1" style="left:240px;top:768px;width:480px;--r:-53.13deg"></i>
    <i class="pp-dot abs" data-beat="1" data-delay=".55" style="left:528px;top:384px"></i>
    <p class="pp-hand abs gr-lb" data-beat="1" data-delay=".7" data-mascot="1" data-mascot-side="right" style="left:560px;top:300px">100℃ 开盖晾</p>

    <i class="pp-rule abs" data-beat="2" style="left:528px;top:384px;width:443px;--r:12.53deg"></i>
    <i class="pp-rule dash abs" data-beat="2" data-delay=".55" style="left:240px;top:480px;width:720px"></i>
    <i class="pp-dot ring abs" data-beat="2" data-delay=".75" style="left:960px;top:480px"></i>
    <div class="pp-note t-yellow abs gr-n" data-beat="2" data-delay=".95" data-mascot="2" data-mascot-side="left" style="left:1296px;top:336px;--r:-1deg"><span>水温</span><b>80℃</b></div>

    <p class="pp-hand abs gr-lb" data-beat="3" style="left:720px;top:504px">投茶 3 克</p>
    <div class="pp-note t-mint abs gr-n" data-beat="3" data-delay=".4" data-mascot="3" data-mascot-side="left" style="left:1296px;top:528px;--r:.8deg"><span>茶量</span><b>3 克</b></div>

    <i class="pp-rule abs" data-beat="4" style="left:960px;top:480px;width:146px;--r:9.46deg"></i>
    <i class="pp-dot abs" data-beat="4" data-delay=".45" style="left:1104px;top:504px"></i>
    <i class="pp-rule dim abs" data-beat="4" data-delay=".5" style="left:960px;top:576px;width:144px"></i>
    <p class="pp-hand abs gr-lb" data-beat="4" data-delay=".75" style="left:976px;top:596px">1 分钟</p>
    <div class="pp-note t-pink abs gr-n" data-beat="4" data-delay=".9" data-mascot="4" data-mascot-side="left" style="left:1296px;top:720px;--r:-.6deg"><span>时间</span><b>1 分钟</b></div>
    <div class="mascot guide" data-face="left" style="left:1440px;top:860px"></div>`,
  notes: [
    { beat: 0, key: '三个数', say: '开头说的三件事，水温、茶量、时间，其实各是一个数。我们在坐标纸上把它推出来。' },
    { beat: 1, key: '一百度', say: '水先烧开，到一百度。烧开以后别急着冲，把盖子打开晾一晾。' },
    { beat: 2, key: '八十度', say: '晾到八十度，就是冲茶的点。第一个数：水温八十度。' },
    { beat: 3, key: '三克', say: '这时候投茶，三克就够。第二个数：茶量三克。' },
    { beat: 4, key: '一分钟', say: '注水以后大约一分钟就出汤，泡久了会苦。第三个数：时间一分钟。' },
  ],
});

/* 结尾（框出重点）：笔记最后一页，把要记住的一句话用尺子沿方格线框起来（双线框），左上角画一颗涂了荧光笔的星；
   第 0 拍：框的四条边一笔接一笔画出来 → 金句写进框里 → 「不苦」划上荧光笔 → 星星描出来；
   第 1 拍：「谢谢大家，欢迎提问」写在一张绿便签上，翘着角贴到框的右下角，尖尖在旁边说谢谢。署名由引擎自动加在右下角。
   为什么是方格纸：学生复习时把最重要的一句框起来、画星，是笔记里「划重点」的样子。
   可读性：框里只有一句话（120px），星星和便签都在框边上，不压字；强调只有「不苦」一处。
   抄过去改：金句（10 个字以内一行；字多了把字号改成 96px，框的宽度跟着改，框的边放在 48 的倍数上）、便签的字；y 990 以下留给署名 */
Deck.add({
  id: 't-paper-end',
  chapter: '结尾',
  scene: 'paper',
  title: '谢谢',
  noTitle: true,
  html: `
    <div class="pp-frame double abs" data-beat="0" style="left:288px;top:336px;width:1344px;height:336px"></div>
    <p class="pp-hand abs ed-quote" data-beat="0" data-delay=".55">水温对了，茶就<em class="key">不苦</em></p>
    <div class="pp-fig abs" data-beat="0" data-delay="1" style="left:228px;top:276px;width:120px">
      <svg viewBox="0 0 96 96" aria-hidden="true">
        <path class="hl" d="M48 8 L58 34.2 L86 35.6 L64.2 53.3 L71.5 80.4 L48 65 L24.5 80.4 L31.8 53.3 L10 35.6 L38 34.2 Z"/>
        <path d="M48 8 L58 34.2 L86 35.6 L64.2 53.3 L71.5 80.4 L48 65 L24.5 80.4 L31.8 53.3 L10 35.6 L38 34.2 Z"/>
      </svg>
    </div>
    <div class="pp-note t-mint abs ed-note" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="happy" data-mascot-say="谢谢！" style="left:1200px;top:624px;--r:1.2deg">
      <p>谢谢大家，欢迎提问</p>
    </div>
    <div class="mascot guide" data-face="left" style="left:1660px;top:828px"></div>`,
  notes: [
    { beat: 0, key: '不苦', say: '最后只记一句：水温对了，茶就不苦。' },
    { beat: 1, say: '谢谢大家，有问题现在可以问。' },
  ],
});
