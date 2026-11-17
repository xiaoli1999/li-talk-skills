/* 第二章：动手（4 页） */
Deck.add({
  id: 'p03', chapter: '二、动手', topic: '第一天：煮面', scene: 'paper', title: '第一天，先煮一碗面',
  html: `
    <ol class="abs steps h" style="left:120px;top:420px;width:1680px;--gap:140px">
      <li data-beat="1" data-mascot="1" data-mascot-side="bottom"><b><em class="key">烧水</em></b><span>水开了再下面</span></li>
      <li data-beat="2" data-mascot="2" data-mascot-side="bottom"><b><em class="key">下面</em></b><span>筷子搅一搅防粘</span></li>
      <li data-beat="3" data-mascot="3" data-mascot-side="bottom"><b><em class="key">调味</em></b><span>一勺生抽一点油</span></li>
    </ol>
    <svg class="sketch">
      <path data-beat="2" data-arrow d="M604 470 C634 450 676 450 708 470"/>
      <path data-beat="3" data-arrow d="M1210 470 C1240 450 1282 450 1314 470"/>
    </svg>
    <div class="mascot guide" style="left:150px;top:840px"></div>`,
  notes: [
    { beat: 0, key: '煮面', say: '第一天从最简单的开始，煮一碗面。' },
    { beat: 1, key: '烧水', say: '先烧水，一定等水完全开了再下面，不然面会糊。' },
    { beat: 2, key: '下面', say: '面下锅以后用筷子搅几下，防止粘在一起。' },
    { beat: 3, key: '调味', say: '捞出来加一勺生抽、几滴油，拌一拌就能吃。' },
  ],
});

Deck.add({
  id: 'p04', chapter: '二、动手', topic: '第二天：煎蛋', scene: 'paper', title: '煎蛋的两个关键',
  html: `
    <div class="abs grid" style="left:120px;top:340px;width:1680px;--cols:2;--gap:80px">
      <div class="card t-yellow" data-beat="1" data-mascot="1" data-mascot-side="bottom"><span class="lab">火候</span><h3>先<em class="key">热锅</em>再放油</h3><p>锅热了蛋才不粘</p></div>
      <div class="card t-mint" data-beat="2" data-mascot="2" data-mascot-side="bottom"><span class="lab">时间</span><h3>边缘<em class="key">焦黄</em>再翻面</h3><p>别急着翻，等底定型</p></div>
    </div>
    <div class="mascot guide" style="left:150px;top:840px"></div>`,
  notes: [
    { beat: 0, say: '第二天学煎蛋，看着简单，其实有两个关键。' },
    { beat: 1, key: '热锅', say: '第一是火候：先把锅烧热再放油，锅热了蛋才不会粘。' },
    { beat: 2, key: '焦黄', say: '第二是时间：等边缘焦黄、底部定型了再翻面，别急。' },
  ],
});

Deck.add({
  id: 'p05', chapter: '二、动手', topic: '一句话记住', scene: 'paper', title: '做饭的第一条规矩',
  html: `
    <div class="abs col" style="left:160px;right:160px;top:380px;align-items:center;--gap:110px">
      <p class="quote" data-beat="1" data-mascot="1" data-mascot-side="right">火候比<em class="key">调料</em>重要</p>
      <p class="lead muted" data-beat="2">同样的菜，火大火小是两种味道</p>
    </div>
    <div class="mascot guide" style="left:150px;top:840px"></div>`,
  notes: [
    { beat: 0, say: '学了两天，我总结出第一条规矩。' },
    { beat: 1, key: '调料', say: '火候比调料重要。调料可以慢慢加，火候错了就救不回来。' },
    { beat: 2, say: '同样一道菜，大火快炒和小火慢炖，是完全不同的两种味道。' },
  ],
});

Deck.add({
  id: 'p06', chapter: '二、动手', topic: '第三天：炒青菜', scene: 'paper', title: '炒青菜要快',
  html: `
    <div class="abs grid" style="left:120px;top:340px;width:1680px;--cols:2;--gap:80px">
      <div class="card t-blue" data-beat="1" data-mascot="1" data-mascot-side="bottom"><span class="lab">准备</span><h3>菜要<em class="key">沥干</em></h3><p>带水下锅会溅油</p></div>
      <div class="card t-yellow" data-beat="2" data-mascot="2" data-mascot-side="bottom"><span class="lab">下锅</span><h3><em class="key">大火</em>一分钟</h3><p>菜叶变软就出锅</p></div>
    </div>
    <div class="mascot guide" style="left:150px;top:840px"></div>`,
  notes: [
    { beat: 0, say: '第三天炒青菜，诀窍就一个字：快。' },
    { beat: 1, key: '沥干', say: '洗完的菜一定要沥干，带水下锅油会溅得到处都是。' },
    { beat: 2, key: '大火', say: '大火炒一分钟左右，叶子一变软就出锅，炒久了会发黄。' },
  ],
});
