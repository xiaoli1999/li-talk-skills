/* 测试课件：干净的 3 页（封面、一页正文、结尾）
   故意放了几样「看着像、其实合规」的写法，确认检查不误报：
   代码示例里的 import 文字、讲词里的 fetch(…) 字样、<a href> 外链、带引号的正则、顶层用到 window / document */
(function () {
  'use strict';

  const CH = '一、开始';
  const wide = window.innerWidth > 1000 || document.body.clientWidth > 1000;
  const quote = /['"`]/g;
  const clean = s => String(s).replace(quote, '');

  Deck.add({
    id: 'p1',
    chapter: CH,
    scene: 'paper',
    title: clean('一份干净的课件'),
    html: `
      <p class="abs p1-sub" data-beat="1" style="left:200px;top:700px;--r:-2deg">副标题</p>
    `,
    notes: [
      { beat: 0, key: '开场', show: '标题', say: '大家好，今天讲一份干净的课件。' },
      { beat: 1, key: '副标题', show: '副标题', say: '这是副标题。' },
    ],
  });

  Deck.add({
    id: 'p2',
    chapter: CH,
    topic: '三步做完',
    scene: 'paper',
    title: '一份课件，三步做完',
    html: `
      <div class="card abs" data-beat="1">第一步：写讲稿</div>
      <pre class="code abs" data-beat="2">import x from 'y'
const r = await fetch('z')</pre>
      <figure class="shot abs" data-beat="3" data-src="img/ok.svg" data-caption="示意图"></figure>
      <p class="abs" data-beat="3">原文见 <a href="https://example.com/doc">这里</a></p>
    `,
    notes: [
      { beat: 0, key: '三步', say: '一份课件三步做完。' },
      { beat: 1, key: '讲稿', say: '第一步写讲稿。' },
      { beat: 2, key: '代码', say: '页面里不能写 fetch(…)，也不能用 import。' },
      { beat: 3, key: '示意图', say: '最后看一张示意图。' },
    ],
    onBeat(n, el, dir) {
      if (!wide || dir !== 1) return;
      return gsap.timeline().from(el.querySelector('.card'), { y: 20, duration: .3 });
    },
  });

  Deck.add({
    id: 'p3',
    chapter: CH,
    scene: 'paper',
    title: '谢谢',
    html: `<p class="abs p3-bye" data-beat="1">下次见</p>`,
    notes: [
      { beat: 0, say: '今天就讲到这里。' },
      { beat: 1, say: '谢谢大家。' },
    ],
  });
})();
