/* 自检测试：字太小——一行 28px 的正文（错误），一行标了 data-small 的 20px 注释（提醒），只该报 font-small */
Deck.add({
  id: 'sf1',
  chapter: '字号',
  scene: 'paper',
  title: '字太小',
  html: `
    <p class="abs sf-body">这一行正文只有 28px，台下看不清</p>
    <p class="abs sf-note" data-small data-beat="1">这行注释标了 data-small，可也只有 20px</p>`,
  notes: [
    { beat: 0, say: '一行小字。' },
    { beat: 1, say: '一行更小的注释。' },
  ],
});
