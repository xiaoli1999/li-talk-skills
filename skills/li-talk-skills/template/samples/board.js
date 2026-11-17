/* =====================================================================
   黑板 board 自己的样板页（虚构主题：怎么泡好一杯茶）：
   封面 t-board-cover、看图识物 t-board-list、主副板书 t-board-steps、知识框图 t-board-map、小结框 t-board-end
   - 内容和通用样板（samples.js）大致对应，版式、结构、每拍的节奏全按上课写板书来：
     老师拿粉笔一行行写、随手画简笔画、画框、划下划线、在要讲的那行前面点一下；讲过的板书留在板上不擦
   - 招牌页两页：主副板书（第 3 页，左边编号板书一拍写一行、右边「例：」写数字）、知识框图（第 4 页，中间「好茶」画三根分支）
   - 用到的黑板自有组件（.bd-*，写法见 scenes/board.css 末尾）：板书块 .bd-note、粉笔框 .bd-box（round 椭圆、after 后画框）、
     板书一行 .bd-line（写完在行首点一个粉笔点，正在讲的那行是黄的）、圈号 .bd-no、白粉笔下划线 .bd-ul；
     简笔画、分支、分隔线用通用的 svg.sketch（引擎换成粉笔线，一笔笔画出来）。这些组件只在黑板里有样子，所以这些页只给黑板用
   - 可读性（翻到最后一拍整页要一眼读清）：
     · 板书不擦、不调灰：讲过的只由引擎退到 .8；正在讲哪一行靠黄粉笔点交代，不靠把别的行弄淡
     · 黄粉笔只给重点：一页的重点词、黄点加起来不超过 3 处；圈号、框、下划线、简笔画都是白粉笔
     · 字横排、不歪；名字和数字用白粉笔（--ink），说明用浅灰绿（--ink-2），不用更淡的 --ink-3
     · 一页一条阅读路径：从左到右（看图识物）、从上到下（板书）、或者靠圈号 ①②③ 串起来（知识框图）
     · 底部 y 1000 以下是粉笔槽（右边还立着一块板擦），内容到 y 960 为止
   - 抄一页过去：整段 Deck.add 抄进章节文件，id 换成讲稿页号，samples/board.css 里同一页的 [data-id="t-board-…"] 一起换；
     字照讲稿改；简笔画照着 svg.sketch 的写法换成自己的形状（舞台坐标），改完跑 check --browser
   ===================================================================== */

/* 封面：上课前老师在黑板上写下的课题。左边大字课题（粉笔一笔笔写出来），底下两道白粉笔横线，
   再下面一行副题；右边一幅粉笔简笔画（冒热气的盖碗）。
   第 0 拍：先画盖碗，课题从左往右写出来、双横线划上（重点词「泡好」黄粉笔描一遍），副题写出来；
   第 1 拍：讲者和日期写在副题下面，沙沙跳到字尾高兴一下。
   为什么是黑板：课题 + 双横线 + 随手的简笔画，是老师开讲前板书的样子；不用封面图，用粉笔画。
   可读性：左边一列从上往下读（课题 → 副题 → 讲者）；强调只有「泡好」一处；简笔画在右边空处，不压字。
   抄过去改：课题（140px 一行最多 7 个字，再多就把 .cv-title 的字号调小）、副题、讲者；
   双横线的长度跟着课题的宽度改（d 里的 x 终点）；简笔画换成自己的主题（右边 x 1260–1720、y 300–720 这块空地） */
Deck.add({
  id: 't-board-cover',
  chapter: '开场',
  scene: 'board',
  title: '怎么泡好一杯茶',
  noTitle: true,
  html: `
    <svg class="sketch">
      <g data-beat="0" data-delay=".5" data-roughness=".5">
        <ellipse cx="1490" cy="702" rx="220" ry="28"/>
        <path d="M1442 668 L1448 690 L1532 690 L1538 668"/>
        <path d="M1322 548 C1332 628 1404 672 1490 672 C1576 672 1648 628 1658 548"/>
        <ellipse cx="1490" cy="546" rx="168" ry="22"/>
        <path d="M1346 544 C1362 494 1422 474 1490 474 C1558 474 1618 494 1634 544"/>
        <path d="M1478 474 L1474 460 M1502 474 L1506 460"/>
        <ellipse cx="1490" cy="456" rx="26" ry="9"/>
        <path class="c-ink2" d="M1450 420 C1430 395 1470 375 1450 345 M1490 412 C1470 384 1510 362 1490 330 M1530 420 C1510 395 1550 375 1530 345"/>
      </g>
      <path data-beat="0" data-delay=".35" d="M150 476 C460 468 800 480 1130 470"/>
      <path data-beat="0" data-delay=".45" d="M196 498 C500 492 820 502 1096 494"/>
    </svg>
    <p class="abs cv-title" data-beat="0">怎么<em class="key">泡好</em>一杯茶</p>
    <p class="bd-note abs cv-sub" data-beat="0">水温、茶量、时间，三件事讲清楚</p>
    <p class="bd-note abs cv-sign" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="happy">讲者：〈你的名字〉　·　〈日期〉</p>
    <div class="mascot guide" data-face="left" style="left:1214px;top:742px"></div>`,
  notes: [
    { beat: 0, key: '泡好', say: '大家好，今天这节课就讲一件小事：怎么泡好一杯茶。' },
    { beat: 1, say: '我是〈你的名字〉，平时爱喝茶，也踩过不少坑。' },
  ],
});

/* 看图识物：老师边画边讲，三样东西各画一幅粉笔简笔画（盖碗、茶叶、水壶），从左到右排开，每幅底下写名字和一句说明。
   第 0 拍：一句话解释「盖碗」写出来；
   第 1–3 拍：每拍一样——（第 2、3 拍先在两幅画之间画一个「+」）粉笔把这样东西一笔笔画出来 → 圈号画圈、名字写出来 → 说明写出来，
   重点词黄粉笔描一遍。沙沙每拍走到刚写好的那样东西底下。
   为什么是黑板：简笔画 + 圈号 + 名字，是老师在黑板上「看图识物」的板书；三幅画用「+」连起来，读起来就是「盖碗 + 茶叶 + 热水」。
   可读性：从左到右一条路，圈号 1、2、3 就是顺序；说明横排一行；强调 3 处（盖碗、三克、八十度），圈号和画都是白粉笔。
   抄过去改：三幅简笔画（各自在 x 中心 400、960、1520 左右、y 270–580 之间）、名字和说明（说明 40px，一行 12 个字以内）；
   东西多一样就把三列改成四列：列宽 420、中心往里收，说明再短一点 */
Deck.add({
  id: 't-board-list',
  chapter: '一、准备',
  topic: '要备的三样东西',
  scene: 'board',
  title: '泡茶之前，备好三样东西',
  html: `
    <p class="explain" data-beat="0"><b>盖碗</b>：带盖的小茶碗，泡茶、闻香、出汤都用它</p>
    <svg class="sketch">
      <g data-beat="1" data-roughness=".5">
        <ellipse cx="400" cy="566" rx="168" ry="22"/>
        <path d="M364 538 L368 554 L432 554 L436 538"/>
        <path d="M272 442 C280 506 336 542 400 542 C464 542 520 506 528 442"/>
        <ellipse cx="400" cy="440" rx="128" ry="17"/>
        <path d="M290 438 C302 398 348 382 400 382 C452 382 498 398 510 438"/>
        <path d="M391 382 L388 371 M409 382 L412 371"/>
        <ellipse cx="400" cy="367" rx="20" ry="7"/>
        <path class="c-ink2" d="M368 340 C352 320 384 304 368 280 M400 332 C384 310 416 294 400 270 M432 340 C416 320 448 304 432 280"/>
      </g>
      <path data-beat="2" class="c-ink2" d="M650 466 L710 464 M680 436 L681 494"/>
      <g data-beat="2" data-roughness=".5">
        <ellipse cx="960" cy="545" rx="150" ry="26"/>
        <path d="M840 500 C870 455 935 450 975 480 C935 515 870 520 840 500 Z M846 498 C890 485 930 480 968 481"/>
        <path d="M950 495 C985 448 1050 446 1085 478 C1048 514 985 520 950 495 Z M958 494 C1000 480 1040 476 1078 478"/>
        <path d="M880 430 C905 380 965 365 1005 390 C975 430 920 445 880 430 Z M888 428 C925 412 960 400 998 392"/>
      </g>
      <path data-beat="3" class="c-ink2" d="M1210 466 L1270 464 M1240 436 L1241 494"/>
      <g data-beat="3" data-roughness=".5">
        <path d="M1430 560 C1405 505 1415 445 1462 420 L1578 420 C1625 445 1635 505 1610 560 Z M1416 560 L1624 560"/>
        <path d="M1462 420 C1474 398 1566 398 1578 420"/>
        <ellipse cx="1520" cy="394" rx="16" ry="8"/>
        <path d="M1452 424 C1440 340 1600 340 1588 424"/>
        <path d="M1424 500 C1392 488 1376 466 1366 440 L1382 432 C1394 456 1410 472 1432 478"/>
        <path class="c-ink2" d="M1356 410 C1342 390 1370 376 1356 350 M1334 420 C1320 400 1348 386 1334 360"/>
      </g>
    </svg>
    <div class="bd-note abs ls-it" data-beat="1" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".5" style="left:150px">
      <p class="ls-name"><i class="bd-no">1</i>一只<em class="key">盖碗</em></p>
      <p class="ls-say">白瓷的最好，看得清茶色</p>
    </div>
    <div class="bd-note abs ls-it" data-beat="2" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".5" style="left:710px">
      <p class="ls-name"><i class="bd-no">2</i><em class="key">三克</em>绿茶</p>
      <p class="ls-say">大约铺满碗底薄薄一层</p>
    </div>
    <div class="bd-note abs ls-it" data-beat="3" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".5" style="left:1270px">
      <p class="ls-name"><i class="bd-no">3</i>一壶热水</p>
      <p class="ls-say">烧开后晾到<em class="key">八十度</em></p>
    </div>
    <div class="mascot guide" data-face="left" style="left:1640px;top:800px"></div>`,
  notes: [
    { beat: 0, key: '盖碗', say: '动手之前先备齐东西。盖碗就是带盖的小茶碗，泡、闻、倒都用它。' },
    { beat: 1, key: '盖碗', say: '第一样是盖碗，白瓷的最好，茶汤什么颜色一眼就看清。' },
    { beat: 2, key: '三克', say: '第二样是茶叶，三克就够，大约铺满碗底薄薄一层。' },
    { beat: 3, key: '八十度', say: '第三样是热水。水烧开后别急，晾到八十度左右再用。' },
  ],
});

/* 主副板书（招牌页）：一块标准的上课板书。一道竖线把黑板分成两块：左边主板书，编号板书一拍写一行
   （一、温杯：……　二、投茶：……　三、注水：……，步骤名底下划一道白粉笔线）；右边副板书写「例：」，
   放这一步要记的数字（3 克、80℃），和左边那一行对齐；第 3 拍最后在主板书底下写一行可复制的命令（点一下复制）。
   第 0 拍：竖线从上往下画出来，右边写「例：」；
   第 1–3 拍：左边写出一行 → 步骤名划下划线 → 行首点一个黄粉笔点（上一行的点变回白的，字留着不擦）；第 2、3 拍右边跟着写出数字，黄粉笔描一遍。
   沙沙每拍站到刚写完的那一行字尾，像刚写完放下的粉笔。
   为什么是黑板：主板书 + 副板书、编号、下划线、行首点，就是老师一节课写下来的板书；讲过的不擦，讲完整块板就是笔记。
   可读性：左边从上往下一条路，右边的数字和左边的行对齐；强调 3 处（3 克、80℃、正在讲的那一行的黄点），步骤名的下划线是白的。
   抄过去改：每行的步骤名和说明（步骤名 64px、说明 46px，一行合起来 13 个字左右，字尾到 x 900 以内，右边要给沙沙留出站的地方）、
   右边的例子（一行 6 个字以内）；行长了就把竖线（x 1130）和右边整列一起往右挪；
   多一步就再写一行，四行时把行距（top 每行差 160）改成 130 */
Deck.add({
  id: 't-board-steps',
  chapter: '二、动手',
  topic: '泡茶三步',
  scene: 'board',
  title: '泡一杯绿茶，只要三步',
  html: `
    <svg class="sketch">
      <path data-beat="0" class="c-ink2" d="M1130 276 C1126 480 1133 700 1128 920"/>
    </svg>
    <p class="bd-line abs st-line" data-beat="1" data-mascot="1" data-mascot-side="right" style="left:150px;top:296px"><b>一、</b><b class="bd-ul">温杯</b>：热水把盖碗烫一遍</p>
    <p class="bd-line abs st-line" data-beat="2" data-mascot="2" data-mascot-side="right" style="left:150px;top:456px"><b>二、</b><b class="bd-ul">投茶</b>：三克茶叶铺满碗底</p>
    <p class="bd-line abs st-line" data-beat="3" data-mascot="3" data-mascot-side="right" style="left:150px;top:616px"><b>三、</b><b class="bd-ul">注水</b>：八十度水沿碗边倒</p>
    <p class="bd-note abs st-eg-h" data-beat="0">例：</p>
    <p class="bd-note abs st-eg" data-beat="2" style="top:446px">茶量　<em class="key">3 克</em></p>
    <p class="bd-note abs st-eg" data-beat="3" style="top:606px">水温　<em class="key">80℃</em></p>
    <button class="copy abs" type="button" data-beat="3" style="left:194px;top:808px" data-copy="tea brew --green --temp 80">tea brew --green --temp 80</button>
    <div class="mascot guide" data-face="left" style="left:930px;top:792px"></div>`,
  notes: [
    { beat: 0, key: '三步', say: '东西备齐了，泡一杯绿茶其实只要三步。左边写步骤，右边写要记的数。' },
    { beat: 1, key: '温杯', say: '第一步温杯：热水把盖碗里外烫一遍，倒掉。' },
    { beat: 2, key: '3 克', say: '第二步投茶：三克茶叶放进去，铺满碗底就行。右边记一笔：三克。' },
    { beat: 3, key: '80℃', say: '第三步注水：八十度的水沿着碗边慢慢倒。懒得记的话，底下这行命令点一下就能复制。' },
  ],
});

/* 知识框图（招牌页）：老师把要记的三个数画成一张框图。中间一个椭圆框写「好茶」，
   粉笔从框边画出三根分支，一拍画一枝：左上「① 水温 80℃」、右上「② 茶量 3 克」、下面「③ 时间 1 分钟」。
   第 0 拍：椭圆框画出来，「好茶」写进去；
   第 1–3 拍：从椭圆框画出一根分支 → 分支尽头画一个方框 → 圈号画圈、写出「水温」这类名字 → 写出大数字，黄粉笔描一遍。
   沙沙每拍走到刚画好的那个框旁边。
   为什么是黑板：中心词 + 分支 + 方框是老师在黑板上画知识框图（思维导图）的样子；分支一拍画一枝，跟着讲的顺序长出来。
   可读性：圈号 1、2、3 就是顺序（左上 → 右上 → 下面，顺时针）；三个数是这页仅有的强调（3 处）；分支、框、圈号都是白粉笔。
   抄过去改：中心词（2–4 个字）、三个框的名字和数字（数字 88px，一个框 5 个字符以内）；
   框挪了位置，分支的起止点跟着改（起点在椭圆边上，终点落在框边上），四个分支时把下面那个框拆成左下、右下两个 */
Deck.add({
  id: 't-board-map',
  chapter: '三、记住',
  topic: '三个数',
  scene: 'board',
  title: '三件事，三个数',
  html: `
    <svg class="sketch">
      <path data-beat="1" d="M836 506 C780 470 714 412 646 390"/>
      <path data-beat="2" d="M1084 506 C1140 470 1206 412 1274 390"/>
      <path data-beat="3" d="M960 644 C951 676 969 712 960 746"/>
    </svg>
    <div class="bd-box round abs mp-core" data-beat="0" style="left:770px;top:470px;width:380px"><p>好茶</p></div>
    <div class="bd-box abs mp-node" data-beat="1" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".5" style="left:250px;top:262px">
      <p class="mp-k"><i class="bd-no">1</i>水温</p><p class="mp-v"><em class="key">80℃</em></p>
    </div>
    <div class="bd-box abs mp-node" data-beat="2" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".5" style="left:1270px;top:262px">
      <p class="mp-k"><i class="bd-no">2</i>茶量</p><p class="mp-v"><em class="key">3 克</em></p>
    </div>
    <div class="bd-box abs mp-node" data-beat="3" data-mascot="3" data-mascot-side="right" style="left:760px;top:742px">
      <p class="mp-k"><i class="bd-no">3</i>时间</p><p class="mp-v"><em class="key">1 分钟</em></p>
    </div>
    <div class="mascot guide" data-face="left" style="left:1500px;top:770px"></div>`,
  notes: [
    { beat: 0, key: '三个数', say: '开头说的三件事，水温、茶量、时间，其实各是一个数，记住就能泡出好茶。' },
    { beat: 1, key: '80℃', say: '水温：八十度，烧开后晾一晾。' },
    { beat: 2, key: '3 克', say: '茶量：三克，铺满碗底薄薄一层。' },
    { beat: 3, key: '1 分钟', say: '时间：一分钟。注水后大约一分钟就出汤，泡久了会苦。' },
  ],
});

/* 小结框（结尾）：下课前老师把这节课的结论写在黑板中间，再用粉笔把它框起来。
   左边两行大字结论，写完粉笔绕一圈把它框住（.bd-box.after：先写字、后画框），重点词「不苦」黄粉笔描一遍；
   右边一幅笑脸茶杯的简笔画。第 1 拍：结论下面写「谢谢大家，欢迎提问」，沙沙跳到字尾说谢谢。署名由引擎自动加在右下角。
   第 0 拍：结论一行行写出来 → 框圈上去；茶杯一笔笔画出来；第 1 拍：致谢写出来。
   为什么是黑板：「框起来的结论」是黑板上最常见的收尾；先写后框，正是老师强调一句话时的手势。
   可读性：左边从上往下（结论 → 致谢），强调只有「不苦」一处，框是白粉笔；简笔画在右边空处，不压字。
   抄过去改：结论两行以内（120px 一行最多 6 个字）、致谢的字；y 990 以下留给署名，别放东西 */
Deck.add({
  id: 't-board-end',
  chapter: '结尾',
  scene: 'board',
  title: '谢谢',
  noTitle: true,
  html: `
    <svg class="sketch">
      <g data-beat="0" data-delay=".6" data-roughness=".5">
        <ellipse cx="1500" cy="664" rx="196" ry="26"/>
        <path d="M1360 424 C1366 524 1400 630 1500 634 C1600 630 1634 524 1640 424"/>
        <ellipse cx="1500" cy="422" rx="140" ry="22"/>
        <path d="M1632 470 C1700 466 1708 562 1618 582"/>
        <circle cx="1458" cy="508" r="7"/>
        <circle cx="1542" cy="508" r="7"/>
        <path d="M1452 548 C1476 576 1524 576 1548 548"/>
        <path class="c-ink2" d="M1460 390 C1444 366 1476 350 1460 322 M1500 384 C1484 358 1516 342 1500 312 M1540 390 C1524 366 1556 350 1540 322"/>
      </g>
    </svg>
    <div class="bd-box after abs ed-box" data-beat="0" style="left:200px;top:220px;width:880px">
      <p class="ed-q">水温对了，</p>
      <p class="ed-q">茶就<em class="key">不苦</em></p>
    </div>
    <p class="bd-note abs ed-thanks" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="happy" data-mascot-say="谢谢！">谢谢大家，欢迎提问</p>
    <div class="mascot guide" data-face="left" style="left:1150px;top:760px"></div>`,
  notes: [
    { beat: 0, key: '不苦', say: '最后只记一句：水温对了，茶就不苦。' },
    { beat: 1, say: '谢谢大家，有问题现在可以问。' },
  ],
});
