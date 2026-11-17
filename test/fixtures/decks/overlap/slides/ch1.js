/* 自检测试：文字互相压——两段字摆得叠在一起，只该报 overlap */
Deck.add({
  id: 'ol1',
  chapter: '重叠',
  scene: 'paper',
  title: '文字互相压',
  html: `
    <p class="abs t-lg ol-a">这一段文字放在下面</p>
    <p class="abs t-lg ol-b" data-beat="1">另一段文字压在上面</p>`,
  notes: [
    { beat: 0, say: '一段字。' },
    { beat: 1, say: '又一段字压上来。' },
  ],
});
