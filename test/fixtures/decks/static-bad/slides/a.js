/* 测试课件：故意写错
   第 2 页和第 1 页同一个 id p1，带拍元素写了 transform，讲词写到第 3 拍、页面只有 2 拍
   第 3 页没写 title，用了没引入的风格 nope
   第 4 页引用了不存在的 img/none.png，onBeat 里用了 fetch
   第 5 页没写主题行，有 5 拍，用了另一家的风格 dark */
(function () {
  'use strict';

  const CH = '一、出错的样子';

  Deck.add({
    id: 'p1',
    chapter: CH,
    scene: 'paper',
    title: '封面',
    html: `<p class="abs" data-beat="1">副标题</p>`,
    notes: [{ beat: 0, say: '开场。' }, { beat: 1, say: '副标题。' }],
  });

  Deck.add({
    id: 'p1',
    chapter: CH,
    topic: '重复的 id',
    scene: 'paper',
    title: '重复的 id',
    html: `
      <div class="card abs" data-beat="1" style="left:100px;top:300px;transform:rotate(2deg)">歪着的卡片</div>
      <div class="card abs" data-beat="2">第二拍</div>
    `,
    notes: [
      { beat: 0, say: '这一页。' },
      { beat: 1, say: '第一拍。' },
      { beat: 2, say: '第二拍。' },
      { beat: 3, say: '页面上没有第三拍。' },
    ],
  });

  Deck.add({
    id: 'p3',
    chapter: CH,
    topic: '没写标题',
    scene: 'nope',
    html: `<p class="abs" data-beat="1">一</p><p class="abs" data-beat="2">二</p>`,
    notes: [{ beat: 0, say: '零。' }, { beat: 1, say: '一。' }, { beat: 2, say: '二。' }],
  });

  Deck.add({
    id: 'p4',
    chapter: CH,
    topic: '图片不存在',
    scene: 'paper',
    title: '图片不存在',
    html: `
      <img class="abs" data-beat="1" src="img/none.png" alt="">
      <p class="abs" data-beat="2">说明</p>
    `,
    notes: [{ beat: 0, say: '零。' }, { beat: 1, say: '一。' }, { beat: 2, say: '二。' }],
    onBeat(n) {
      if (n === 1) fetch('x');
    },
  });

  Deck.add({
    id: 'p5',
    chapter: CH,
    scene: 'dark',
    title: '拍太多',
    html: `
      <p class="abs" data-beat="1">一</p>
      <p class="abs" data-beat="2">二</p>
      <p class="abs" data-beat="3">三</p>
      <p class="abs" data-beat="4">四</p>
      <p class="abs" data-beat="5">五</p>
    `,
  });

  Deck.add({
    id: 'p6',
    chapter: CH,
    scene: 'paper',
    title: '结尾',
    html: `<p class="abs" data-beat="1">再见</p>`,
    notes: [{ beat: 0, say: '结尾。' }, { beat: 1, say: '再见。' }],
  });
})();
