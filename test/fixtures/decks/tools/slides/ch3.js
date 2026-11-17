/* 第三章：坚持（4 页） */
Deck.add({
  id: 'p07', chapter: '三、坚持', topic: '一周的菜单', scene: 'paper', title: '后四天，照这个菜单做',
  html: `
    <div class="abs grid" style="left:120px;top:340px;width:1680px;--cols:3;--gap:60px">
      <div class="card t-yellow" data-beat="1" data-mascot="1" data-mascot-side="bottom"><span class="lab">第四天</span><h3><em class="key">番茄炒蛋</em></h3><p>前两天的组合</p></div>
      <div class="card t-mint" data-beat="2" data-mascot="2" data-mascot-side="bottom"><span class="lab">第五天</span><h3><em class="key">土豆丝</em></h3><p>练刀工</p></div>
      <div class="card t-blue" data-beat="3" data-mascot="3" data-mascot-side="bottom"><span class="lab">第六、七天</span><h3><em class="key">红烧肉</em></h3><p>周末慢慢炖</p></div>
    </div>
    <div class="mascot guide" style="left:150px;top:840px"></div>`,
  notes: [
    { beat: 0, say: '前三天打基础，后四天照这个菜单来。' },
    { beat: 1, key: '番茄炒蛋', say: '第四天番茄炒蛋，其实就是煎蛋加炒菜的组合。' },
    { beat: 2, key: '土豆丝', say: '第五天土豆丝，主要练刀工，切细一点口感更好。' },
    { beat: 3, key: '红烧肉', say: '最后两天做红烧肉，周末有时间，可以慢慢炖。' },
  ],
});

Deck.add({
  id: 'p08', chapter: '三、坚持', topic: '怎么坚持下来', scene: 'paper', title: '坚持下来，靠两件事',
  html: `
    <ol class="abs steps h" style="left:220px;top:420px;width:1480px;--gap:200px">
      <li data-beat="1" data-mascot="1" data-mascot-side="bottom"><b><em class="key">拍照</em></b><span>每天做完拍一张</span></li>
      <li data-beat="2" data-mascot="2" data-mascot-side="bottom"><b><em class="key">分享</em></b><span>发给家人朋友看</span></li>
    </ol>
    <svg class="sketch"><path data-beat="2" data-arrow d="M860 470 C890 450 932 450 964 470"/></svg>
    <div class="mascot guide" style="left:150px;top:840px"></div>`,
  notes: [
    { beat: 0, say: '最难的不是学，是坚持。我靠的是两件小事。' },
    { beat: 1, key: '拍照', say: '每天做完拍一张照片，一周下来能看到自己的进步。' },
    { beat: 2, key: '分享', say: '把照片发给家人朋友，他们的夸奖是最好的动力。' },
  ],
});

Deck.add({
  id: 'p09', chapter: '三、坚持', topic: '常见的坑', scene: 'paper', title: '新手最容易踩的两个坑',
  html: `
    <div class="abs grid" style="left:120px;top:340px;width:1680px;--cols:2;--gap:80px">
      <div class="card t-yellow" data-beat="1" data-mascot="1" data-mascot-side="bottom"><span class="lab">坑一</span><h3>盐<em class="key">一次放多</em></h3><p>少量多次，尝了再加</p></div>
      <div class="card t-blue" data-beat="2" data-mascot="2" data-mascot-side="bottom"><span class="lab">坑二</span><h3>油没<em class="key">烧热</em>就下菜</h3><p>筷子放进去冒小泡再下</p></div>
    </div>
    <div class="mascot guide" style="left:150px;top:840px"></div>`,
  notes: [
    { beat: 0, say: '最后说两个新手最容易踩的坑。' },
    { beat: 1, key: '一次放多', say: '第一个坑是盐一次放多了，咸了就没法补救，要少量多次。' },
    { beat: 2, key: '烧热', say: '第二个坑是油没烧热就下菜，筷子放进去冒小泡了再下。' },
  ],
});

Deck.add({
  id: 'p10', chapter: '结尾', scene: 'paper', title: '谢谢', noTitle: true,
  html: `
    <div class="abs col" style="left:160px;right:160px;top:360px;align-items:center;--gap:130px">
      <p class="quote" data-beat="0" data-mascot="0" data-mascot-side="right">今晚就试<em class="key">一道</em></p>
      <p class="lead muted" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="happy" data-mascot-say="开饭啦！">谢谢大家，欢迎交流</p>
    </div>
    <div class="mascot guide"></div>`,
  notes: [
    { beat: 0, key: '一道', say: '别等周末，今晚就试一道最简单的。' },
    { beat: 1, say: '谢谢大家，有问题欢迎交流。' },
  ],
});
