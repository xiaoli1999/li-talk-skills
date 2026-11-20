/* =====================================================================
   水彩田园 watercolor 自己的样板页（虚构主题：怎么泡好一杯茶）
   - 内容和通用样板（samples.js）大致对应：封面、要备的三样东西、泡茶三步、收尾金句；另加三页：
     绘本跨页特写（招牌页）、调色盘里的三个数。招牌页是「小路路牌」（第 3 页）和「绘本跨页」（第 4 页）
   - 版式全按一本温柔的水彩绘本来：每页是一幅画，字写在画外面——刚画好的三张小画晾在绳子上、
     一条弯弯的小路边立起三块木路牌、一页大插画配一句旁白、三格颜料落进调色盘、最后寄出一张明信片
   - 每拍「发生了什么」是画画的事：铅笔先描线稿、颜色从一点洇开、画纸荡上绳子、路牌从草地里翻起来、
     一笔颜料把小路往前刷一段、叶子飘下来、颜料落进格子溅起几点。这些动作由水彩田园的自有组件（.wc-*）自己完成，
     页面里只写结构和 data-beat，不写 onBeat、不写风格专用的 data-in（组件的用法见 scenes/watercolor.js 开头）
   - 可读性（翻到每页最后一拍，整页一眼读清）：
     · 画里不放字，字都写在画外面的纸色或很淡的水彩上，一律横排、实色深褐墨；讲过的只退到 .8，不另调淡
     · 每页一条阅读路径：晾画、路牌、颜料格都从左往右排，路牌带编号 1、2、3；绘本旁白一行读完
     · 讲过的都留在页上：路牌不倒、画不收、颜料格不擦、旁白不换；一页的重点词不超过 3 处
     · 文字块倾斜不超过 2°（--r 写在 ±1.5deg 以内）
   - 组件只在水彩田园里有样子：这几页只给 scene: 'watercolor' 用，不进通用样册
   - 抄一页过去：id 换成 p〈讲稿页号〉，samples/watercolor.css 里同一页的 [data-id="t-watercolor-…"] 一起换；字照讲稿改；
     坐标都是舞台坐标（1920×1080）；小画（.wc-art）里的 svg 视图框和小画一样大，换画就换里面的形状，
     颜色用 watercolor.css 里列的颜色类（sky、sun、leaf…），别写死颜色。改完跑 check --browser
   ===================================================================== */

/* 封面：一本水彩绘本的封面。左边手写的大书名（重点词底下晕一抹暖阳黄），书名下一道天空蓝的水彩笔触托着副题；
   右边一幅大大的茶枝写生（一芽两叶加几片大叶子，两片落叶），是整页的重心。
   第 0 拍：书名一个字一个字像墨一样显出，笔触从左往右刷过去、副题显出，茶枝的铅笔线稿一笔笔描出来、绿色随后洇开；
   第 1 拍：一张藏书票轻轻落在书名下面，写着讲者和日期，朵朵跑过去高兴一下。
   为什么是水彩：绘本封面就是「一个书名 + 一幅主画」；写生的茶枝、铅笔线加水彩、藏书票，都是纸上画画的东西。
   可读性：书名、副题、讲者都横排实色字；茶枝里没有字；副题身后的笔触很淡。
   抄过去改：书名（8 个字以内，128px 以上一行最多放 7 个字）、副题、藏书票上的字；换主画就换 .wc-art 里的两层 svg */
Deck.add({
  id: 't-watercolor-cover',
  chapter: '开场',
  scene: 'watercolor',
  title: '怎么泡好一杯茶',
  noTitle: true,
  html: `
    <i class="wc-wash abs" data-beat="0" style="left:136px;top:438px;width:880px;height:84px"></i>
    <p class="wc-title abs t-wc-cv-title" data-beat="0" style="left:146px;top:226px">怎么<em class="key">泡好</em>一杯茶</p>
    <p class="abs t-wc-cv-sub" data-beat="0" style="left:162px;top:446px">水温、茶量、时间，三件事讲清楚</p>
    <div class="wc-art abs" data-beat="0" style="left:1200px;top:196px;width:520px;height:680px">
      <svg class="wc-paint" viewBox="0 0 520 680" aria-hidden="true">
        <path class="sky" d="M60 300C40 160 150 70 280 74C410 78 500 190 490 330C482 470 470 600 330 640C190 676 70 600 60 470C54 410 66 360 60 300Z" style="--o:.14"/>
        <circle class="sun" cx="418" cy="120" r="64" style="--o:.5"/>
        <path class="leaf st" d="M254 644C266 544 242 444 262 354C276 284 284 214 294 154" style="--w:8;--o:.5"/>
        <g transform="translate(256 565) rotate(-160)"><path class="leaf" d="M0 0C57 -57.5 136.8 -47.5 190 0C136.8 47.5 57 57.5 0 0Z" style="--o:.55"/></g>
        <g transform="translate(254 475) rotate(-20)"><path class="leaf" d="M0 0C60 -62.1 144 -51.3 200 0C144 51.3 60 62.1 0 0Z" style="--o:.5"/></g>
        <g transform="translate(260 377) rotate(-152)"><path class="leaf" d="M0 0C48 -50.6 115.2 -41.8 160 0C115.2 41.8 48 50.6 0 0Z" style="--o:.55"/></g>
        <g transform="translate(270 297) rotate(-28)"><path class="leaf" d="M0 0C46.8 -48.3 112.3 -39.9 156 0C112.3 39.9 46.8 48.3 0 0Z" style="--o:.5"/></g>
        <g transform="translate(285 210) rotate(-138)"><path class="mint" d="M0 0C35.4 -36.8 85 -30.4 118 0C85 30.4 35.4 36.8 0 0Z" style="--o:.62"/></g>
        <g transform="translate(291 173) rotate(-48)"><path class="mint" d="M0 0C32.4 -32.2 77.8 -26.6 108 0C77.8 26.6 32.4 32.2 0 0Z" style="--o:.62"/></g>
        <g transform="translate(295 155) rotate(-84)"><path class="mint" d="M0 0C27.6 -19.6 66.2 -16.2 92 0C66.2 16.2 27.6 19.6 0 0Z" style="--o:.7"/></g>
        <g transform="translate(64 620) rotate(24)"><path class="leaf" d="M0 0C18 -18.4 43.2 -15.2 60 0C43.2 15.2 18 18.4 0 0Z" style="--o:.45"/></g>
        <g transform="translate(424 646) rotate(-36)"><path class="sun" d="M0 0C15 -16.1 36 -13.3 50 0C36 13.3 15 16.1 0 0Z" style="--o:.62"/></g>
      </svg>
      <svg class="sketch" viewBox="0 0 520 680" aria-hidden="true">
        <path d="M250 640C262 540 238 440 258 350C272 280 280 210 290 150"/>
        <g transform="translate(252 560) rotate(-160)"><path d="M0 0C57 -57.5 136.8 -47.5 190 0C136.8 47.5 57 57.5 0 0Z"/><path d="M7.6 0Q95 -5 171 0" data-roughness=".5" stroke-width="1.6"/><path d="M57 -2q19 -20 38 -35M57 1q19 20 38 35M104.5 -3q15.2 -17.5 30.4 -27.5M104.5 0q15.2 17.5 30.4 27.5" data-roughness=".4" stroke-width="1.3"/></g>
        <g transform="translate(250 470) rotate(-20)"><path d="M0 0C60 -62.1 144 -51.3 200 0C144 51.3 60 62.1 0 0Z"/><path d="M8 0Q100 -5.4 180 0" data-roughness=".5" stroke-width="1.6"/><path d="M60 -2q20 -21.6 40 -37.8M60 1q20 21.6 40 37.8M110 -3q16 -18.9 32 -29.7M110 0q16 18.9 32 29.7" data-roughness=".4" stroke-width="1.3"/></g>
        <g transform="translate(256 372) rotate(-152)"><path d="M0 0C48 -50.6 115.2 -41.8 160 0C115.2 41.8 48 50.6 0 0Z"/><path d="M6.4 0Q80 -4.4 144 0" data-roughness=".5" stroke-width="1.6"/><path d="M48 -2q16 -17.6 32 -30.8M48 1q16 17.6 32 30.8M88 -3q12.8 -15.4 25.6 -24.2M88 0q12.8 15.4 25.6 24.2" data-roughness=".4" stroke-width="1.3"/></g>
        <g transform="translate(266 292) rotate(-28)"><path d="M0 0C46.8 -48.3 112.3 -39.9 156 0C112.3 39.9 46.8 48.3 0 0Z"/><path d="M6.2 0Q78 -4.2 140.4 0" data-roughness=".5" stroke-width="1.6"/><path d="M46.8 -2q15.6 -16.8 31.2 -29.4M46.8 1q15.6 16.8 31.2 29.4" data-roughness=".4" stroke-width="1.3"/></g>
        <g transform="translate(281 205) rotate(-138)"><path d="M0 0C35.4 -36.8 85 -30.4 118 0C85 30.4 35.4 36.8 0 0Z"/><path d="M4.7 0Q59 -3.2 106.2 0" data-roughness=".5" stroke-width="1.5"/></g>
        <g transform="translate(287 168) rotate(-48)"><path d="M0 0C32.4 -32.2 77.8 -26.6 108 0C77.8 26.6 32.4 32.2 0 0Z"/><path d="M4.3 0Q54 -2.8 97.2 0" data-roughness=".5" stroke-width="1.5"/></g>
        <g transform="translate(291 150) rotate(-84)"><path d="M0 0C27.6 -19.6 66.2 -16.2 92 0C66.2 16.2 27.6 19.6 0 0Z" data-roughness=".6"/></g>
        <g transform="translate(60 615) rotate(24)"><path d="M0 0C18 -18.4 43.2 -15.2 60 0C43.2 15.2 18 18.4 0 0Z" data-roughness=".5"/></g>
        <g transform="translate(420 641) rotate(-36)"><path d="M0 0C15 -16.1 36 -13.3 50 0C36 13.3 15 16.1 0 0Z" data-roughness=".5"/></g>
      </svg>
    </div>
    <div class="wc-paper wc-plate abs" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="happy" style="left:150px;top:648px;--r:-1deg">
      <p>讲者：〈你的名字〉 · 〈日期〉</p>
    </div>
    <div class="mascot guide" data-face="left" style="left:1056px;top:744px"></div>`,
  notes: [
    { beat: 0, key: '泡好', say: '大家好，今天聊一件小事：怎么泡好一杯茶。水温、茶量、时间，三件事讲清楚。' },
    { beat: 1, say: '我是〈你的名字〉，平时爱喝茶，也踩过不少坑。' },
  ],
});

/* 晾画绳（要备的三样东西）：两根木杆之间拉一根晾衣绳，三张刚画好的水彩小画一张张夹上去晾干。
   每张画纸上半截是一样东西的写生，下半截写编号、名字和一句说明。
   第 0 拍：一句话解释盖碗；木杆和绳子用铅笔描出来。
   第 1–3 拍：一张画从木夹子那里荡上绳子、晃两下停住，画里的颜色洇开，名字和说明再显出；朵朵跑到这张画下面。
   为什么是水彩：画水彩的人就是这样把刚画好的画夹在绳子上晾干的；三张画顺着绳子从左往右，像在小院里看画。
   可读性：名字、说明都写在画纸的白底上（不压在颜色上），横排实色；三张从左往右一条线，编号 1、2、3 就是顺序；
   重点词一共 3 处（白瓷、三克、八十度）；画纸歪不超过 1.2°。
   抄过去改：每张画纸的小画（.wc-art 里的两层 svg，视图框 400×220）、编号、名字（6 个字以内）、说明（一行 11 个字以内）；
   张数 2 到 4 张：绳子是一条二次曲线（M120 300 Q960 428 1800 300），画纸的上沿放在夹子处绳子下面约 8px，
   绳子在 x 处的高度 = 300 + 256·t·(1−t)，t = (x − 120) ÷ 1680 */
Deck.add({
  id: 't-watercolor-items',
  chapter: '一、准备',
  topic: '要备的三样东西',
  scene: 'watercolor',
  title: '泡茶之前，备好三样东西',
  html: `
    <p class="explain" data-beat="0"><b>盖碗</b>：带盖的小茶碗，泡茶、闻香、出汤都用它</p>
    <svg class="sketch" aria-hidden="true">
      <g data-beat="0">
        <path d="M134 906L132 284" stroke-width="3"/>
        <path d="M1786 900L1788 284" stroke-width="3"/>
        <path d="M120 300Q960 428 1800 300"/>
      </g>
    </svg>
    <div class="wc-paper wc-hang abs" data-beat="1" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".36" style="left:185px;top:346px;width:470px;--r:-1.2deg">
      <div class="wc-art">
        <svg class="wc-paint" viewBox="0 0 400 220" aria-hidden="true">
          <path class="sky" d="M40 118C40 50 120 18 210 20C300 22 370 60 366 126C362 188 290 212 200 210C110 208 40 188 40 118Z" style="--o:.3"/>
          <ellipse class="shade" cx="206" cy="200" rx="140" ry="13" style="--o:.18"/>
          <path class="sky" d="M120 132Q200 152 280 132L278 144Q200 164 122 144Z" style="--o:.55"/>
          <path class="sky-d" d="M240 120C262 124 278 118 282 114C278 156 258 180 222 186C240 166 246 144 240 120Z" style="--o:.32"/>
          <path class="sky-d" d="M232 66C258 74 272 88 276 106C262 110 248 108 240 104C244 90 240 76 232 66Z" style="--o:.26"/>
        </svg>
        <svg class="sketch" viewBox="0 0 400 220" aria-hidden="true">
          <ellipse cx="200" cy="196" rx="150" ry="18"/>
          <ellipse cx="200" cy="192" rx="104" ry="11" data-roughness=".6" stroke-width="1.6"/>
          <path d="M116 112C120 160 150 186 200 186C250 186 280 160 284 112"/>
          <ellipse cx="200" cy="112" rx="84" ry="13"/>
          <path d="M124 108C130 74 162 60 200 60C238 60 270 74 276 108"/>
          <path d="M186 60C186 50 214 50 214 60" data-roughness=".5"/>
          <path d="M122 136Q200 154 278 136" data-roughness=".5" stroke-width="1.6"/>
          <path d="M176 40q-9 -10 0 -19q9 -10 0 -19M224 40q-9 -10 0 -19q9 -10 0 -19" data-roughness=".4" stroke-width="1.6"/>
        </svg>
      </div>
      <h3><i class="wc-no">1</i>一只盖碗</h3>
      <p><em class="key">白瓷</em>的最好，看得清茶色</p>
    </div>
    <div class="wc-paper wc-hang abs" data-beat="2" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".36" style="left:725px;top:372px;width:470px;--r:.8deg">
      <div class="wc-art">
        <svg class="wc-paint" viewBox="0 0 400 220" aria-hidden="true">
          <path class="mint" d="M36 122C34 56 118 20 208 22C302 24 370 62 366 128C362 190 288 212 198 210C108 208 38 190 36 122Z" style="--o:.34"/>
          <ellipse class="shade" cx="206" cy="180" rx="146" ry="22" style="--o:.16"/>
          <g transform="translate(118 160) rotate(-20)"><path class="leaf" d="M0 0C13.2 -12.7 31.7 -10.5 44 0C31.7 10.5 13.2 12.7 0 0Z" style="--o:.62"/></g>
          <g transform="translate(150 150) rotate(15)"><path class="leaf" d="M0 0C13.2 -12.7 31.7 -10.5 44 0C31.7 10.5 13.2 12.7 0 0Z" style="--o:.62"/></g>
          <g transform="translate(176 164) rotate(-35)"><path class="leaf" d="M0 0C13.2 -12.7 31.7 -10.5 44 0C31.7 10.5 13.2 12.7 0 0Z" style="--o:.62"/></g>
          <g transform="translate(206 148) rotate(8)"><path class="leaf" d="M0 0C13.2 -12.7 31.7 -10.5 44 0C31.7 10.5 13.2 12.7 0 0Z" style="--o:.62"/></g>
          <g transform="translate(230 162) rotate(-12)"><path class="leaf" d="M0 0C13.2 -12.7 31.7 -10.5 44 0C31.7 10.5 13.2 12.7 0 0Z" style="--o:.62"/></g>
          <g transform="translate(252 150) rotate(30)"><path class="leaf" d="M0 0C13.2 -12.7 31.7 -10.5 44 0C31.7 10.5 13.2 12.7 0 0Z" style="--o:.62"/></g>
          <g transform="translate(160 172) rotate(-4)"><path class="leaf" d="M0 0C13.2 -12.7 31.7 -10.5 44 0C31.7 10.5 13.2 12.7 0 0Z" style="--o:.62"/></g>
          <g transform="translate(112 74) rotate(-15)"><path class="leaf" d="M0 0C28.8 -29.9 69.1 -24.7 96 0C69.1 24.7 28.8 29.9 0 0Z" style="--o:.5"/></g>
          <g transform="translate(234 54) rotate(20)"><path class="mint" d="M0 0C26.4 -27.6 63.4 -22.8 88 0C63.4 22.8 26.4 27.6 0 0Z" style="--o:.7"/></g>
        </svg>
        <svg class="sketch" viewBox="0 0 400 220" aria-hidden="true">
          <ellipse cx="200" cy="170" rx="152" ry="32"/>
          <ellipse cx="200" cy="164" rx="120" ry="20" data-roughness=".6" stroke-width="1.6"/>
          <g transform="translate(116 156) rotate(-20)"><path d="M0 0C13.2 -12.7 31.7 -10.5 44 0C31.7 10.5 13.2 12.7 0 0Z" data-roughness=".4" stroke-width="1.6"/></g>
          <g transform="translate(148 146) rotate(15)"><path d="M0 0C13.2 -12.7 31.7 -10.5 44 0C31.7 10.5 13.2 12.7 0 0Z" data-roughness=".4" stroke-width="1.6"/></g>
          <g transform="translate(174 160) rotate(-35)"><path d="M0 0C13.2 -12.7 31.7 -10.5 44 0C31.7 10.5 13.2 12.7 0 0Z" data-roughness=".4" stroke-width="1.6"/></g>
          <g transform="translate(204 144) rotate(8)"><path d="M0 0C13.2 -12.7 31.7 -10.5 44 0C31.7 10.5 13.2 12.7 0 0Z" data-roughness=".4" stroke-width="1.6"/></g>
          <g transform="translate(228 158) rotate(-12)"><path d="M0 0C13.2 -12.7 31.7 -10.5 44 0C31.7 10.5 13.2 12.7 0 0Z" data-roughness=".4" stroke-width="1.6"/></g>
          <g transform="translate(250 146) rotate(30)"><path d="M0 0C13.2 -12.7 31.7 -10.5 44 0C31.7 10.5 13.2 12.7 0 0Z" data-roughness=".4" stroke-width="1.6"/></g>
          <g transform="translate(108 70) rotate(-15)"><path d="M0 0C28.8 -29.9 69.1 -24.7 96 0C69.1 24.7 28.8 29.9 0 0Z"/><path d="M3.8 0Q48 -2.6 86.4 0" data-roughness=".4" stroke-width="1.4"/></g>
          <g transform="translate(230 50) rotate(20)"><path d="M0 0C26.4 -27.6 63.4 -22.8 88 0C63.4 22.8 26.4 27.6 0 0Z"/><path d="M3.5 0Q44 -2.4 79.2 0" data-roughness=".4" stroke-width="1.4"/></g>
        </svg>
      </div>
      <h3><i class="wc-no">2</i><em class="key">三克</em>绿茶</h3>
      <p>大约铺满碗底薄薄一层</p>
    </div>
    <div class="wc-paper wc-hang abs" data-beat="3" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".36" style="left:1265px;top:346px;width:470px;--r:-.6deg">
      <div class="wc-art">
        <svg class="wc-paint" viewBox="0 0 400 220" aria-hidden="true">
          <path class="sun" d="M42 116C44 52 122 18 212 20C304 22 368 62 364 126C360 188 290 212 200 210C110 208 40 182 42 116Z" style="--o:.3"/>
          <ellipse class="sky" cx="80" cy="66" rx="30" ry="40" style="--o:.22"/>
          <ellipse class="sky" cx="106" cy="58" rx="20" ry="30" style="--o:.18"/>
          <ellipse class="shade" cx="204" cy="200" rx="104" ry="10" style="--o:.2"/>
          <path class="peach" d="M128 196C108 156 126 108 200 104C274 108 292 156 272 196Z" style="--o:.5"/>
          <path class="pink" d="M244 116C270 128 284 156 270 194L236 196C254 168 256 140 244 116Z" style="--o:.32"/>
          <path class="peach st" d="M134 160C114 152 100 134 88 118" style="--w:9;--o:.42"/>
        </svg>
        <svg class="sketch" viewBox="0 0 400 220" aria-hidden="true">
          <path d="M128 196C108 156 126 108 200 104C274 108 292 156 272 196Z"/>
          <path d="M170 106C174 92 226 92 230 106"/>
          <ellipse cx="200" cy="90" rx="11" ry="5" data-roughness=".4"/>
          <path d="M146 116C140 44 260 44 254 116"/>
          <path d="M134 164C112 156 98 136 84 118L92 112C106 128 120 142 138 148"/>
          <path d="M156 130Q160 118 172 112" data-roughness=".4" stroke-width="1.6"/>
          <path d="M78 100q-10 -12 0 -24q10 -12 0 -24M100 94q-8 -10 0 -20q8 -10 0 -20" data-roughness=".4" stroke-width="1.6"/>
        </svg>
      </div>
      <h3><i class="wc-no">3</i>一壶热水</h3>
      <p>烧开后晾到<em class="key">八十度</em></p>
    </div>
    <div class="mascot guide" style="left:160px;top:800px"></div>`,
  notes: [
    { beat: 0, key: '盖碗', say: '动手之前先备齐东西。盖碗就是带盖的小茶碗，泡、闻、倒都用它。' },
    { beat: 1, key: '白瓷', say: '第一样是盖碗，白瓷的最好，茶汤什么颜色一眼就看清。' },
    { beat: 2, key: '三克', say: '第二样是茶叶，三克就够，大约铺满碗底薄薄一层。' },
    { beat: 3, key: '八十度', say: '第三样是热水。水烧开后别急，晾到八十度左右再用。' },
  ],
});

/* 小路路牌（泡茶三步，招牌页）：一片草地上，一条弯弯的土路从左下角的近处往右上的远处去，越远越窄；
   路边立着三块箭头木牌（温杯 → 投茶 → 注水），牌上写编号、步骤名和一句短说明，右边远处一棵小树。
   第 0 拍：草地和远处的小树描出来、绿色洇开，近处的一截路刷出来，朵朵站在路口。
   第 1–3 拍：一笔颜料把小路往前刷一段 → 路边一块路牌像立体绘本那样从地上翻起来立住、木头颜色洇开、字显出，
   两片叶子从牌子上飘下来；朵朵沿着路跑到这块牌子脚下。第 3 拍右下角再出一行可复制的命令（点一下复制）。
   为什么是水彩：「一步步往前走」画成绘本里的一条乡间小路，路牌、草地、远处的树都是田园里的东西；
   路一段段刷出来、牌子一块块立起来，走到哪一步一眼就看得出。
   可读性：牌子上的字横排、实色，木头颜色很淡；三块牌子从左往右、一块比一块高一点，箭头都朝右，编号 1、2、3；
   讲过的牌子一直立着；重点词 3 处（标题的三步、三克、八十度）。
   抄过去改：每块牌子的编号、步骤名（4 个字以内）、说明（一行 8 个字以内）；牌子的位置和 --post（柱子从牌子底边到地面的长度）；
   路是 svg.wc-brush 里首尾相接的几段 path（stroke-width 是路宽，往远处一段比一段窄），柱子脚要落在路的上沿；
   朵朵站在柱子右边：data-mascot-dy ≈ 柱子落地处的 y + 20 − 123 − 牌子底边 − 10 */
Deck.add({
  id: 't-watercolor-path',
  chapter: '二、动手',
  topic: '泡茶三步',
  scene: 'watercolor',
  title: '泡一杯绿茶，只要三步',
  titleHtml: '泡一杯绿茶，只要<em class="key">三步</em>',
  html: `
    <div class="wc-art abs" style="left:0;top:0;width:1920px;height:1080px">
      <svg class="wc-paint" viewBox="0 0 1920 1080" data-beat="0" style="--bx:20%;--by:80%" aria-hidden="true">
        <path class="grass" d="M-40 760C300 724 620 752 960 734C1300 716 1620 696 1960 716L1960 1100L-40 1100Z" style="--o:.26"/>
        <path class="leaf" d="M1730 680C1716 640 1740 600 1780 596C1800 570 1850 576 1860 610C1890 620 1892 668 1864 684C1840 704 1756 704 1730 680Z" style="--o:.45"/>
        <path class="wood" d="M1792 696L1812 696L1814 752L1790 752Z" style="--o:.5"/>
        <circle class="pink" cx="250" cy="812" r="9" style="--o:.6"/>
        <circle class="sun" cx="284" cy="836" r="8" style="--o:.7"/>
        <circle class="pink" cx="690" cy="790" r="8" style="--o:.6"/>
        <circle class="sun" cx="1170" cy="756" r="8" style="--o:.7"/>
        <circle class="pink" cx="1250" cy="852" r="9" style="--o:.55"/>
        <circle class="sun" cx="1660" cy="860" r="8" style="--o:.7"/>
      </svg>
      <svg class="sketch" viewBox="0 0 1920 1080" aria-hidden="true">
        <g data-beat="0">
          <path d="M-40 760C300 724 620 752 960 734C1300 716 1620 696 1960 716"/>
          <path d="M1730 680C1716 640 1740 600 1780 596C1800 570 1850 576 1860 610C1890 620 1892 668 1864 684C1840 704 1756 704 1730 680Z"/>
          <path d="M1794 698L1792 752M1810 698L1812 752" data-roughness=".5"/>
          <path d="M226 840q4 -16 8 0q4 -18 8 0q4 -14 8 0M660 812q4 -14 8 0q4 -16 8 0M1140 780q4 -14 8 0q4 -16 8 0q4 -12 8 0M1222 880q4 -16 8 0q4 -14 8 0M1630 888q4 -14 8 0q4 -16 8 0" data-roughness=".4" stroke-width="1.6"/>
        </g>
      </svg>
    </div>
    <svg class="wc-brush" aria-hidden="true">
      <path class="earth" data-beat="0" stroke-width="132" d="M150 1100C190 1040 250 995 330 962"/>
      <path class="earth" data-beat="1" stroke-width="108" d="M330 962C400 934 440 914 520 892C620 866 700 852 780 842"/>
      <path class="earth" data-beat="2" stroke-width="84" d="M780 842C880 830 940 826 1020 818C1120 808 1200 800 1290 790"/>
      <path class="earth" data-beat="3" stroke-width="60" d="M1290 790C1380 780 1440 774 1520 768C1600 762 1660 752 1740 742"/>
    </svg>
    <div class="wc-sign abs" data-beat="1" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".5" data-mascot-dx="24" data-mascot-dy="164" style="left:200px;top:420px;width:400px;--post:283px;--r:-1deg">
      <b><i class="wc-no">1</i>温杯</b><span>热水把盖碗烫一遍</span>
    </div>
    <div class="wc-sign abs" data-beat="2" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".5" data-mascot-dx="24" data-mascot-dy="120" style="left:760px;top:380px;width:400px;--post:239px;--r:.8deg">
      <b><i class="wc-no">2</i>投茶</b><span><em class="key">三克</em>茶叶铺满碗底</span>
    </div>
    <div class="wc-sign abs" data-beat="3" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".5" data-mascot-dx="24" data-mascot-dy="118" style="left:1320px;top:340px;width:400px;--post:237px;--r:-.6deg">
      <b><i class="wc-no">3</i>注水</b><span><em class="key">八十度</em>水沿碗边倒</span>
    </div>
    <button class="copy abs" type="button" data-beat="3" style="left:1150px;top:902px" data-copy="tea brew --green --temp 80">tea brew --green --temp 80</button>
    <div class="mascot guide" style="left:206px;top:878px"></div>`,
  notes: [
    { beat: 0, key: '三步', say: '东西备齐了，泡一杯绿茶其实只要三步，我们沿着这条小路走一遍。' },
    { beat: 1, key: '温杯', say: '第一步温杯：热水把盖碗里外烫一遍，倒掉。' },
    { beat: 2, key: '三克', say: '第二步投茶：三克茶叶放进去，铺满碗底就行。' },
    { beat: 3, key: '八十度', say: '第三步注水：八十度的水沿着碗边慢慢倒。懒得记的话，右下角这行命令点一下就能复制。' },
  ],
});

/* 绘本跨页（特写，招牌页）：一页摊开的绘本，上面三分之二是一幅大插画——草坡上一把刚烧开、冒着热气的水壶，
   右边一只等着冲茶的茶碗；下面一行绘本旁白「开水别急，晾到八十度再冲茶。」，一拍出半句。插画四边柔柔地淡出纸面。
   第 0 拍：插画只有铅笔线稿，一笔笔描出来（草坡、水壶、茶碗、云），朵朵坐在草坡上。
   第 1 拍：天空、太阳和水壶的颜色从水壶那里洇开，壶嘴的热气一圈圈描出来，旁白前半句「开水别急，」一个字一个字显出。
   第 2 拍：草坡和茶碗的颜色洇开，茶汤是嫩绿的，一道虚线从壶嘴弯到茶碗（等晾好了再倒），后半句显出；朵朵跑到句末。
   为什么是水彩：绘本就是「一幅画 + 一句话」，翻一页讲一件事；先有线稿、颜色一块块铺上去，正是水彩画画的顺序。
   可读性：画里没有字；旁白一行横排、68px 实色深褐墨，放在画外面的纸上；一拍出半句，最后整句都在；重点词一处（八十度）。
   抄过去改：插画（.wc-art.wc-book 里两层颜色、一层线稿，各写各的 data-beat）、旁白（一行 16 个字以内，分成两三个 span，各写 data-beat）；
   这页不画大标题（noTitle），title 照样写这句旁白，演讲者视图和阅读模式要用 */
Deck.add({
  id: 't-watercolor-book',
  chapter: '二、动手',
  topic: '特写：八十度',
  scene: 'watercolor',
  title: '开水别急，晾到八十度再冲茶',
  noTitle: true,
  html: `
    <div class="wc-art wc-book abs" style="left:120px;top:104px;width:1680px;height:640px">
      <svg class="wc-paint" viewBox="0 0 1680 640" data-beat="1" style="--bx:24%;--by:40%" aria-hidden="true">
        <path class="sky" d="M0 30C320 0 700 26 1020 14C1320 4 1560 24 1680 40L1680 380C1300 400 760 372 0 420Z" style="--o:.24"/>
        <circle class="sun" cx="1500" cy="96" r="62" style="--o:.5"/>
        <ellipse class="shade" cx="478" cy="384" rx="196" ry="16" style="--o:.18"/>
        <g transform="translate(90 4) scale(1.9)">
          <path class="peach" d="M128 196C108 156 126 108 200 104C274 108 292 156 272 196Z" style="--o:.52"/>
          <path class="pink" d="M244 116C270 128 284 156 270 194L236 196C254 168 256 140 244 116Z" style="--o:.34"/>
          <path class="peach st" d="M134 160C114 152 100 134 88 118" style="--w:9;--o:.45"/>
          <path class="wood st" d="M146 116C140 44 260 44 254 116" style="--w:6;--o:.4"/>
        </g>
      </svg>
      <svg class="wc-paint" viewBox="0 0 1680 640" data-beat="2" style="--bx:66%;--by:62%" aria-hidden="true">
        <path class="grass" d="M-10 432C260 382 540 362 820 382C1100 402 1380 368 1690 332L1690 650L-10 650Z" style="--o:.36"/>
        <path class="leaf" d="M-10 572C300 540 620 556 900 548C1200 540 1460 520 1690 506L1690 650L-10 650Z" style="--o:.12"/>
        <ellipse class="shade" cx="1138" cy="402" rx="152" ry="18" style="--o:.2"/>
        <ellipse class="white" cx="1130" cy="396" rx="140" ry="17" style="--o:.85"/>
        <path class="white" d="M1040 300C1046 360 1080 392 1130 392C1180 392 1214 360 1220 300Z" style="--o:.9"/>
        <path class="sky" d="M1046 326Q1130 346 1214 326L1210 340Q1130 360 1050 340Z" style="--o:.5"/>
        <path class="sky-d" d="M1180 306C1206 312 1216 318 1218 304C1214 344 1196 376 1160 388C1180 362 1186 334 1180 306Z" style="--o:.26"/>
        <ellipse class="tea" cx="1130" cy="302" rx="80" ry="12" style="--o:.82"/>
        <circle class="pink" cx="700" cy="414" r="9" style="--o:.6"/>
        <circle class="sun" cx="742" cy="436" r="8" style="--o:.7"/>
        <circle class="pink" cx="1420" cy="404" r="9" style="--o:.6"/>
        <circle class="sun" cx="1468" cy="428" r="8" style="--o:.7"/>
        <circle class="pink" cx="300" cy="470" r="8" style="--o:.55"/>
      </svg>
      <svg class="sketch" viewBox="0 0 1680 640" aria-hidden="true">
        <g data-beat="0">
          <path d="M0 432C260 382 540 362 820 382C1100 402 1380 368 1680 332"/>
          <g transform="translate(90 4) scale(1.9)">
            <path d="M128 196C108 156 126 108 200 104C274 108 292 156 272 196Z" stroke-width="1.3"/>
            <path d="M170 106C174 92 226 92 230 106" stroke-width="1.3"/>
            <ellipse cx="200" cy="90" rx="11" ry="5" stroke-width="1.2" data-roughness=".4"/>
            <path d="M146 116C140 44 260 44 254 116" stroke-width="1.3"/>
            <path d="M134 164C112 156 98 136 84 118L92 112C106 128 120 142 138 148" stroke-width="1.3"/>
            <path d="M156 130Q160 118 172 112" stroke-width="1" data-roughness=".4"/>
          </g>
          <path d="M1040 300C1046 360 1080 392 1130 392C1180 392 1214 360 1220 300"/>
          <ellipse cx="1130" cy="300" rx="90" ry="16"/>
          <ellipse cx="1130" cy="302" rx="74" ry="10" data-roughness=".5" stroke-width="1.6"/>
          <ellipse cx="1130" cy="396" rx="140" ry="18"/>
          <path d="M680 400q4 -16 8 0q4 -18 8 0q4 -14 8 0M1396 392q4 -14 8 0q4 -16 8 0M280 456q4 -16 8 0q4 -14 8 0M900 400q4 -14 8 0q4 -16 8 0q4 -12 8 0M1560 372q4 -14 8 0q4 -16 8 0" data-roughness=".4" stroke-width="1.6"/>
        </g>
        <g data-beat="1">
          <path d="M236 192q-34 -30 0 -62q34 -32 0 -64M276 182q-26 -24 0 -48q26 -24 0 -48M200 200q-22 -22 0 -44q22 -22 0 -44" data-roughness=".6"/>
        </g>
        <g data-beat="2">
          <path d="M300 226C500 82 860 96 1040 282" stroke-dasharray="14 16" data-arrow/>
          <path d="M1108 280q-12 -14 0 -28q12 -14 0 -28M1152 280q-12 -14 0 -28q12 -14 0 -28" data-roughness=".4" stroke-width="1.8"/>
        </g>
      </svg>
    </div>
    <p class="wc-tale abs" style="left:120px;top:772px;width:1680px"><span data-beat="1" data-mascot="1" data-mascot-side="left">开水别急，</span><span data-beat="2" data-mascot="2" data-mascot-side="right" data-mascot-pose="happy">晾到<em class="key">八十度</em>再冲茶。</span></p>
    <div class="mascot guide" data-face="left" style="left:1560px;top:350px"></div>`,
  notes: [
    { beat: 0, key: '八十度', say: '这一页只讲一件事，像绘本一样看一幅画。' },
    { beat: 1, key: '别急', say: '水刚烧开、还冒着大团热气的时候，先别急着冲。' },
    { beat: 2, key: '八十度', say: '开着盖晾一会儿，到八十度左右再冲。绿茶娇嫩，滚水一冲就烫熟了，汤色发黄，还发苦。' },
  ],
});

/* 调色盘（三个数）：一只白瓷调色盘（右边一个拇指孔，下面斜放一支画笔），盘里三个空格子；
   一拍一格：一滴颜料落进格子、往外洇开、溅起几点，大数字一个个写出来，下面是它管的是什么（水温、茶量、时间）。
   第 0 拍：调色盘和画笔的铅笔线稿描出来，瓷白和阴影洇开，三个格子是空的；朵朵站在盘子右下。
   第 1–3 拍：暖橙的 80℃、嫩绿的 3 克、天蓝的 1 分钟依次落进格子；朵朵站到刚填好的那一格的边上。
   为什么是水彩：调色盘是画水彩的人每天都摸的东西；「记住三个数」讲成「备好三格颜料」，颜色和数一起留在盘里。
   可读性：数字是 124px 实色深褐墨，写在很淡的一摊颜色上；名字横排；三格从左往右，填上就不擦。
   抄过去改：每格的颜色（t-peach、t-mint、t-blue…）、数字和单位（<small> 里的单位小一号）、名字（2–4 个字）；
   格子的位置要和第 0 拍小画里画的空格子对上（小画在 (170, 250)，空格子的圆心 = .wc-well 的中心 − (170, 250)） */
Deck.add({
  id: 't-watercolor-palette',
  chapter: '三、记住',
  topic: '三个数',
  scene: 'watercolor',
  title: '三件事，三个数',
  html: `
    <div class="wc-art abs" data-beat="0" style="left:170px;top:250px;width:1580px;height:660px">
      <svg class="wc-paint" viewBox="0 0 1580 660" aria-hidden="true">
        <ellipse class="shade" cx="820" cy="610" rx="640" ry="24" style="--o:.1"/>
        <path class="white" d="M120 330C110 180 300 74 760 70C1200 66 1470 130 1494 290C1506 372 1470 420 1424 432C1380 444 1360 470 1372 520C1384 572 1250 604 800 604C360 604 130 500 120 330Z" style="--o:.92"/>
        <path class="sky" d="M150 400C230 520 430 584 800 588C1180 590 1330 566 1352 524C1290 562 1140 576 800 574C430 570 230 510 150 400Z" style="--o:.16"/>
        <ellipse class="shade" cx="1420" cy="300" rx="40" ry="36" style="--o:.2"/>
        <ellipse class="shade" cx="322" cy="292" rx="124" ry="116" style="--o:.08"/>
        <ellipse class="shade" cx="782" cy="272" rx="124" ry="116" style="--o:.08"/>
        <ellipse class="shade" cx="1192" cy="302" rx="124" ry="116" style="--o:.08"/>
        <path class="wood st" d="M76 640L470 598" style="--w:14;--o:.5"/>
        <path class="shade st" d="M472 598L530 592" style="--w:15;--o:.32"/>
        <path class="sky-d" d="M532 585C560 582 594 590 614 600C592 608 560 608 534 599Z" style="--o:.55"/>
      </svg>
      <svg class="sketch" viewBox="0 0 1580 660" aria-hidden="true">
        <path d="M120 330C110 180 300 74 760 70C1200 66 1470 130 1494 290C1506 372 1470 420 1424 432C1380 444 1360 470 1372 520C1384 572 1250 604 800 604C360 604 130 500 120 330Z"/>
        <ellipse cx="1420" cy="300" rx="40" ry="36"/>
        <ellipse cx="330" cy="300" rx="140" ry="134"/>
        <ellipse cx="330" cy="300" rx="128" ry="122" data-roughness=".6" stroke-width="1.5"/>
        <ellipse cx="790" cy="280" rx="140" ry="134"/>
        <ellipse cx="790" cy="280" rx="128" ry="122" data-roughness=".6" stroke-width="1.5"/>
        <ellipse cx="1200" cy="310" rx="140" ry="134"/>
        <ellipse cx="1200" cy="310" rx="128" ry="122" data-roughness=".6" stroke-width="1.5"/>
        <path d="M68 633L470 591L472 605L72 647Z" data-roughness=".6"/>
        <path d="M470 591L532 585L534 599L472 605Z" data-roughness=".5"/>
        <path d="M532 585C560 582 594 590 614 600C592 608 560 608 534 599" data-roughness=".5"/>
      </svg>
    </div>
    <div class="wc-well t-peach abs" data-beat="1" data-mascot="1" data-mascot-side="top" data-mascot-x=".5" style="left:360px;top:410px;width:280px;height:280px"><b>80<small>℃</small></b><span>水温</span></div>
    <div class="wc-well t-mint abs" data-beat="2" data-mascot="2" data-mascot-side="top" data-mascot-x=".5" style="left:820px;top:390px;width:280px;height:280px"><b>3<small>克</small></b><span>茶量</span></div>
    <div class="wc-well t-blue abs" data-beat="3" data-mascot="3" data-mascot-side="top" data-mascot-x=".5" style="left:1230px;top:420px;width:280px;height:280px"><b>1<small>分钟</small></b><span>时间</span></div>
    <div class="mascot guide" data-face="left" style="left:1600px;top:796px"></div>`,
  notes: [
    { beat: 0, key: '三个数', say: '开头说的三件事，水温、茶量、时间，其实各是一个数，就像调色盘里备好的三格颜料。' },
    { beat: 1, key: '八十度', say: '水温：八十度，烧开后晾一晾。' },
    { beat: 2, key: '三克', say: '茶量：三克，铺满碗底薄薄一层。' },
    { beat: 3, key: '一分钟', say: '时间：一分钟。注水后大约一分钟就出汤，泡久了会苦。' },
  ],
});

/* 明信片（结尾）：一张从田园寄来的水彩明信片。左半边是一幅小画（夕阳下草坡上的一杯热茶、一枝茶叶），
   右半边写着收尾金句，右上角一枚齿孔邮票、一个铅笔盖的邮戳，下面两道写字的横线。
   第 0 拍：明信片轻轻落下来，小画先描线稿再上色，金句一个字一个字写出来。
   第 1 拍：横线上写出「谢谢大家，欢迎提问」，朵朵跑到句末说谢谢。署名由引擎自动加在最后一页底下。
   为什么是水彩：明信片是写生的人最常寄出去的东西，一面画、一面写字；用它收尾，像把今天这杯茶寄给大家。
   可读性：金句 96px、谢谢一行 48px，都写在明信片的白底上，横排实色；邮票、邮戳只在右上角，不压字；重点词一处（不苦）。
   抄过去改：金句（两行，一行 5 个字以内）、谢谢的字（一行 10 个字以内）、左边的小画；明信片底边别过 y 900（下面留给署名） */
Deck.add({
  id: 't-watercolor-end',
  chapter: '结尾',
  scene: 'watercolor',
  title: '谢谢',
  noTitle: true,
  html: `
    <div class="wc-paper wc-post abs" data-beat="0" style="left:250px;top:130px;width:1420px;height:740px;--r:-.8deg">
      <div class="wc-art abs" style="left:46px;top:46px;width:620px;height:648px">
        <svg class="wc-paint" viewBox="0 0 620 648" aria-hidden="true">
          <path class="sun" d="M8 8H612V420C480 400 300 440 8 410Z" style="--o:.3"/>
          <circle class="sun" cx="116" cy="112" r="58" style="--o:.6"/>
          <path class="peach" d="M8 250C200 230 420 270 612 240V430C470 420 300 470 8 480Z" style="--o:.24"/>
          <path class="grass" d="M8 470C180 430 380 440 612 410V640H8Z" style="--o:.38"/>
          <ellipse class="shade" cx="316" cy="526" rx="214" ry="28" style="--o:.2"/>
          <ellipse class="white" cx="310" cy="520" rx="210" ry="28" style="--o:.88"/>
          <path class="white" d="M170 360C176 450 230 510 310 510C390 510 444 450 450 360Z" style="--o:.92"/>
          <path class="sky" d="M178 392Q310 418 442 392L436 410Q310 436 184 410Z" style="--o:.5"/>
          <path class="sky-d" d="M400 368C432 372 446 376 448 362C442 430 418 486 370 504C396 470 408 420 400 368Z" style="--o:.26"/>
          <ellipse class="tea" cx="310" cy="362" rx="118" ry="17" style="--o:.82"/>
          <g transform="translate(522 548) rotate(-62)"><path class="leaf" d="M0 0C21 -23 50.4 -19 70 0C50.4 19 21 23 0 0Z" style="--o:.6"/></g>
          <g transform="translate(546 506) rotate(-104)"><path class="mint" d="M0 0C18 -18.4 43.2 -15.2 60 0C43.2 15.2 18 18.4 0 0Z" style="--o:.66"/></g>
        </svg>
        <svg class="sketch" viewBox="0 0 620 648" aria-hidden="true">
          <rect x="8" y="8" width="604" height="632" data-roughness=".5" stroke-width="1.6"/>
          <path d="M8 470C90 452 140 446 168 444M452 432C510 424 560 418 612 410"/>
          <path d="M170 360C176 450 230 510 310 510C390 510 444 450 450 360"/>
          <ellipse cx="310" cy="360" rx="140" ry="24"/>
          <ellipse cx="310" cy="362" rx="118" ry="17" data-roughness=".5" stroke-width="1.6"/>
          <ellipse cx="310" cy="520" rx="210" ry="28"/>
          <ellipse cx="310" cy="514" rx="150" ry="16" data-roughness=".5" stroke-width="1.5"/>
          <path d="M268 318q-24 -26 0 -52q24 -26 0 -52M318 300q-26 -30 0 -60q26 -30 0 -60M368 318q-22 -24 0 -48q22 -24 0 -48" data-roughness=".6"/>
          <path d="M478 600Q520 560 556 474"/>
          <g transform="translate(518 544) rotate(-62)"><path d="M0 0C21 -23 50.4 -19 70 0C50.4 19 21 23 0 0Z" data-roughness=".5"/></g>
          <g transform="translate(542 502) rotate(-104)"><path d="M0 0C18 -18.4 43.2 -15.2 60 0C43.2 15.2 18 18.4 0 0Z" data-roughness=".5"/></g>
        </svg>
      </div>
      <i class="wc-stamp abs" style="left:1196px;top:42px;width:154px;height:182px;--r:2deg"></i>
      <div class="wc-art abs" style="left:0;top:0;width:1420px;height:740px">
        <svg class="sketch" viewBox="0 0 1420 740" aria-hidden="true">
          <path d="M712 90L714 650" data-roughness=".6"/>
          <path d="M770 572L1340 570M770 676L1340 674" data-roughness=".5" stroke-width="1.6"/>
          <circle cx="1170" cy="146" r="64" data-roughness=".6" stroke-width="1.8"/>
          <circle cx="1170" cy="146" r="50" data-roughness=".5" stroke-width="1.4"/>
          <path d="M970 126q16 -8 32 0t32 0t32 0t32 0M970 146q16 -8 32 0t32 0t32 0t32 0M970 166q16 -8 32 0t32 0t32 0t32 0" data-roughness=".4" stroke-width="1.6"/>
        </svg>
      </div>
      <p class="wc-title abs t-wc-ed-quote" style="left:770px;top:262px">水温对了，<br>茶就<em class="key">不苦</em></p>
      <p class="wc-tale abs t-wc-ed-thanks" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="happy" data-mascot-say="谢谢！" style="left:770px;top:604px">谢谢大家，欢迎提问</p>
    </div>
    <div class="mascot guide" style="left:136px;top:800px"></div>`,
  notes: [
    { beat: 0, key: '不苦', say: '最后只记一句：水温对了，茶就不苦。' },
    { beat: 1, say: '谢谢大家，有问题现在可以问。' },
  ],
});
