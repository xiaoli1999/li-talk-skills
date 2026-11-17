/* 测试章节：形象的走位、打盹、深色底描边。第 1 页新写法，第 2 页旧写法（data-kid），效果应当相同 */
Deck.add({
  id: 'n1',
  chapter: '一、形象',
  topic: '新写法',
  scene: 'paper',
  title: '三秒不动，形象就打盹',
  html: `
    <p class="explain abs"><b>打盹</b>：很久没人操作才睡，按任意键就醒</p>
    <div class="mascot guide" style="left:1560px;top:250px"></div>
    <div class="card abs t-yellow" data-beat="1" data-mascot="1" data-mascot-x=".7" style="left:160px;top:440px;width:720px">
      <h3>第 1 拍</h3>
      <p>形象站到这张便签的上沿</p>
    </div>
    <div class="card abs t-mint" data-beat="2" data-mascot="2" data-mascot-side="left" data-mascot-say="这里" style="left:1100px;top:660px;width:660px">
      <h3>第 2 拍</h3>
      <p>形象站到左边，说「这里」</p>
    </div>`,
  notes: [
    { beat: 0, say: '形象先在右上角。' },
    { beat: 1, say: '走到便签上。' },
    { beat: 2, say: '走到第二张便签左边。' },
  ],
});

Deck.add({
  id: 'n2',
  chapter: '一、形象',
  topic: '旧写法',
  scene: 'board',
  title: '旧写法照样认',
  html: `
    <div class="kid guide" data-face="left" style="left:1560px;top:250px"></div>
    <p class="abs" data-beat="1" data-kid="1" data-kid-side="right" data-kid-pose="happy" data-kid-say="旧写法" style="left:160px;top:460px">第 1 拍：data-kid 写法，形象站到右边</p>
    <p class="abs" data-beat="2" data-kid="2" data-kid-pose="lie" data-kid-x=".5" style="left:160px;top:700px">第 2 拍：旧姿势名 lie 当作 rest</p>`,
  notes: [
    { beat: 0, say: '黑板上的形象有浅色描边。' },
    { beat: 1, say: '旧写法的目标。' },
    { beat: 2, say: '旧姿势名。' },
  ],
});
