/* 第一章：开场（2 页） */
Deck.add({
  id: 'p01', chapter: '开场', scene: 'paper', title: '一周学会做饭', noTitle: true,
  html: `
    <div class="abs col" style="left:150px;top:340px;width:1100px;align-items:flex-start;--gap:30px">
      <span class="tag" data-beat="0" style="--r:-2deg">新人生活分享</span>
      <p class="cover-title b" data-beat="0">一周学会做饭</p>
      <p class="lead muted" data-beat="0">七天七道菜，从煮面到炒菜</p>
      <p class="muted" data-beat="1" data-mascot="1" data-mascot-side="stay" data-mascot-pose="happy">讲者：〈名字〉　·　〈日期〉</p>
    </div>
    <div class="mascot guide" style="left:1320px;top:440px"></div>`,
  notes: [
    { beat: 0, key: '做饭', say: '大家好，今天聊一件很生活的事：一周学会做饭。' },
    { beat: 1, say: '我是〈名字〉，一年前连鸡蛋都煎不好，现在能做一桌菜。' },
  ],
});

Deck.add({
  id: 'p02', chapter: '一、准备', topic: '要备的三样东西', scene: 'paper', title: '开火之前，备好三样东西',
  html: `
    <p class="explain" data-beat="0"><b>不粘锅</b>：锅底有涂层，煎东西不容易粘</p>
    <div class="abs grid" style="left:120px;top:360px;width:1680px;--cols:3;--gap:60px">
      <div class="card t-yellow" data-beat="1" data-mascot="1" data-mascot-side="bottom"><span class="lab">锅</span><h3>一口<em class="key">不粘锅</em></h3><p>二十八厘米最顺手</p></div>
      <div class="card t-mint" data-beat="2" data-mascot="2" data-mascot-side="bottom"><span class="lab">刀</span><h3>一把<em class="key">菜刀</em></h3><p>别太重，切得稳就行</p></div>
      <div class="card t-blue" data-beat="3" data-mascot="3" data-mascot-side="bottom"><span class="lab">调料</span><h3>盐、油、<em class="key">生抽</em></h3><p>先备这三样就够</p></div>
    </div>
    <div class="mascot guide" style="left:150px;top:840px"></div>`,
  notes: [
    { beat: 0, key: '不粘锅', say: '开火之前先备齐东西。不粘锅就是锅底有涂层的锅，煎蛋不容易粘。' },
    { beat: 1, key: '不粘锅', say: '第一样是锅，二十八厘米的不粘锅最顺手，炒菜煎蛋都行。' },
    { beat: 2, key: '菜刀', say: '第二样是刀，别买太重的，切得稳就够。' },
    { beat: 3, key: '生抽', say: '第三样是调料，盐、油、生抽，先备这三样就能做大部分家常菜。' },
  ],
});
