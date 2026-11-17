/* 自检测试：退回第 0 拍没收干净——前进到第 1 拍时 onBeat 给块加了一直显示的类，退拍时没去掉；第 2 拍的块正常。只该报 not-cleared */
Deck.add({
  id: 'nc1',
  chapter: '收回',
  scene: 'paper',
  title: '退回第 0 拍没收干净',
  html: `
    <p class="abs nc-a" data-beat="1">第 1 拍出现，退回第 0 拍后应该收起来</p>
    <p class="abs nc-b" data-beat="2">第 2 拍出现，退拍时正常收回</p>`,
  // 错误示范：前进到第 1 拍时加上 .stay（一直看得见），退回第 0 拍时没有去掉
  onBeat(n, el) {
    if (n >= 1) el.querySelector('.nc-a').classList.add('stay');
  },
  notes: [
    { beat: 0, say: '空的。' },
    { beat: 1, say: '第一块。' },
    { beat: 2, say: '第二块。' },
  ],
});
