/* 测试用的小风格 probe（只在测试课件里，不进模板）：
   风格作者只写了必填的 label、family，加上 intro 和 ripple 两个钩子，没有 CSS、没有别的钩子。
   用 ?scene=probe 打开时所有页面临时都用它。每次钩子调用都记进 window.__probe，给浏览器验证读：
   - intro：ctx 里有哪些字段、tl 是不是 gsap 时间线、page 是哪一页、page.el 是不是 .slide、返回的时长
   - ripple：x、y（舞台坐标）、layer 是不是这一页最前面的 .ripple-layer、它的层级和指针
   - mount / unmount：测试工具另外包的一层（不是风格写的），用来确认引擎第一次显示时也调了 mount */
(function () {
  'use strict';
  const log = window.__probe = { intro: [], ripple: [], mount: [], unmount: [] };
  const clear = e => gsap.set(e, { clearProps: 'opacity,visibility,transform' });

  Deck.scene('probe', {
    label: '探针',
    family: 'hand',
    // 开场：大标题从上面落下，第 0 拍的块依次淡入；返回总时长 1 秒
    intro(ctx) {
      const page = ctx && ctx.page, el = page && page.el;
      const rec = { keys: Object.keys(ctx || {}), tl: !!(ctx && ctx.tl && typeof ctx.tl.fromTo === 'function' && typeof ctx.tl.duration === 'function'),
        page: page && page.id, slide: !!(el && el.classList.contains('slide')), at: performance.now() };
      log.intro.push(rec);
      if (!rec.tl || !rec.slide) return 0;
      const title = el.querySelector(':scope > .s-title');
      if (title) ctx.tl.fromTo(title, { autoAlpha: 0, y: -40 }, { autoAlpha: 1, y: 0, duration: .6, ease: 'power2.out', immediateRender: true, onComplete: () => clear(title) }, 0);
      [...el.querySelectorAll('[data-beat="0"]')].filter(b => !b.matches('.mascot, .kid')).forEach((b, i) => {
        ctx.tl.fromTo(b, { autoAlpha: 0 }, { autoAlpha: 1, duration: .4, immediateRender: true, onComplete: () => clear(b) }, .3 + i * .1);
      });
      return 1;
    },
    // 涟漪：点击处一个淡橙色的圈，0.8 秒散开
    ripple(x, y, layer) {
      const sl = layer && layer.parentElement, cs = layer && getComputedStyle(layer);
      log.ripple.push({ x, y, layer: !!(layer && layer.classList.contains('ripple-layer')), first: !!(sl && sl.querySelector(':scope > .ripple-layer') === layer),
        z: cs && cs.zIndex, pe: cs && cs.pointerEvents, page: sl && sl.dataset.id });
      const d = document.createElement('i');
      d.className = 'probe-ripple';
      d.style.cssText = `position:absolute;left:${x - 60}px;top:${y - 60}px;width:120px;height:120px;border-radius:50%;border:5px solid rgba(232,89,12,.55)`;
      layer.appendChild(d);
      gsap.fromTo(d, { scale: .2, opacity: 1 }, { scale: 1, opacity: 0, duration: .8, ease: 'power2.out', onComplete: () => d.remove() });
    },
  });

  // 测试工具：给 probe 和 paper 的 mount / unmount 包一层记录（boot 之前包好，风格自己写了的照常调用）
  ['probe', 'paper'].forEach(k => {
    const s = Deck._.SCENES[k];
    if (!s) return;
    ['mount', 'unmount'].forEach(h => {
      const orig = s[h];
      s[h] = function (stage) { log[h].push({ scene: k, stage: stage && stage.id, at: performance.now() }); if (orig) return orig.apply(this, arguments); };
    });
  });
})();
