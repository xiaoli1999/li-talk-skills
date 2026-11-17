/* 自检测试：可读性——三页各藏一类问题，每页另放一处不该报的对照
   rd1 字太淡（low-contrast）：一行浅灰字；对照是一行正常颜色的字
   rd2 竖排太长（vertical-long）：一句 20 个字的竖排；对照是 2 个字的竖排题签
   rd3 讲过的看不见了（gone）：对话框里前两句被后一句换掉；对照是标了 data-transient 的伤害数字，换掉了也不该报 */
Deck.add({
  id: 'rd1',
  chapter: '可读性',
  scene: 'paper',
  title: '字太淡',
  html: `
    <p class="abs rd-pale" data-beat="1">这行字颜色太淡，后排看不清</p>
    <p class="abs rd-ok" data-beat="1">这行字颜色正常，看得清</p>`,
  notes: [
    { beat: 0, say: '标题。' },
    { beat: 1, say: '一行太淡的字，一行正常的字。' },
  ],
});

Deck.add({
  id: 'rd2',
  chapter: '可读性',
  scene: 'paper',
  title: '竖排太长',
  html: `
    <p class="abs rd-vert" data-beat="1">这一句话竖着写了二十个字左右读起来很费劲</p>
    <p class="abs rd-tag" data-beat="1">题签</p>`,
  notes: [
    { beat: 0, say: '标题。' },
    { beat: 1, say: '一句很长的竖排，一个短题签。' },
  ],
});

Deck.add({
  id: 'rd3',
  chapter: '可读性',
  scene: 'paper',
  title: '对话框换掉',
  html: `
    <div class="abs rd-dlg">
      <p data-beat="1">第一句：先把盖碗烫一遍</p>
      <p data-beat="2">第二句：放三克茶叶</p>
      <p data-beat="3">第三句：八十度水沿碗边倒</p>
    </div>
    <div class="abs rd-hit">
      <b data-beat="1" data-transient>-30</b>
      <b data-beat="2">打倒了</b>
    </div>`,
  notes: [
    { beat: 0, say: '标题。' },
    { beat: 1, say: '第一句。' },
    { beat: 2, say: '第二句。' },
    { beat: 3, say: '第三句。' },
  ],
});
