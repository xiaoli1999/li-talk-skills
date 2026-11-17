// 读课件：index.html 里引入了什么、slides 下有哪些章节文件、最新修改时间；
// 以及在一个隔离的假环境里执行章节文件，只收集 Deck.add 的参数（不碰浏览器和网络）
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import vm from 'node:vm';

// 给用户看的错误：带 userMessage，入口只打印这句中文
function userError(message, exitCode = 1) {
  const e = new Error(message);
  e.userMessage = message;
  e.exitCode = exitCode;
  return e;
}

// 读文本文件，去掉开头的 BOM
export function readText(file) {
  return readFileSync(file, 'utf8').replace(/^﻿/, '');
}

// 把 HTML 注释换成等长的空白（换行保留），注释掉的引入不算数，行号也不变
export function blankHtmlComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, m => m.replace(/[^\n]/g, ' '));
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" };
const decodeEntities = s => s.replace(/&(amp|lt|gt|quot|apos|#39);/g, (m, k) => ENTITIES[k]);

// 找出 HTML 里的开始标签：[{ name, attrs: { 小写属性名: 值 }, index }]；属性值里的 > 不会截断标签
export function htmlTags(html) {
  const out = [];
  const tagRe = /<([a-zA-Z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
  let m;
  while ((m = tagRe.exec(html))) {
    const attrs = {};
    const attrRe = /([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
    let a;
    while ((a = attrRe.exec(m[2]))) {
      const name = a[1].toLowerCase();
      if (name in attrs) continue;
      const v = a[2] != null ? a[2] : a[3] != null ? a[3] : a[4] != null ? a[4] : '';
      attrs[name] = decodeEntities(v);
    }
    out.push({ name: m[1].toLowerCase(), attrs, index: m.index });
  }
  return out;
}

// 把引用地址换成课件目录下的相对路径（正斜杠）；网络地址、data:、锚点等不是本地文件的返回 null
export function localRef(ref) {
  let s = String(ref == null ? '' : ref).trim();
  if (!s || /^(?:[a-z][\w+.-]*:|\/\/|#)/i.test(s)) return null;
  s = s.replace(/[?#].*$/, '');
  try { s = decodeURI(s); } catch { /* 解不开就按原样 */ }
  s = s.replace(/\\/g, '/').replace(/^(?:\.\/)+/, '');
  return s || null;
}

const unique = list => [...new Set(list)];

// index.html 里两对「章节（开始）/（结束）」注释之间引入的 js 和 css；没有这两对注释时退回「引入的 slides/ 下的文件」
function chapterRefs(indexHtml) {
  const pick = (re, fallbackAll) => {
    const m = re.exec(indexHtml);
    const part = blankHtmlComments(m ? m[1] : fallbackAll);
    return htmlTags(part);
  };
  const plain = blankHtmlComments(indexHtml);
  const jsTags = pick(/<!--\s*章节[（(]开始[）)][\s\S]*?-->([\s\S]*?)<!--\s*章节[（(]结束[）)][\s\S]*?-->/, plain);
  const cssTags = pick(/<!--\s*章节样式[（(]开始[）)][\s\S]*?-->([\s\S]*?)<!--\s*章节样式[（(]结束[）)][\s\S]*?-->/, plain);
  const hasJsMarks = /<!--\s*章节[（(]开始[）)]/.test(indexHtml);
  const hasCssMarks = /<!--\s*章节样式[（(]开始[）)]/.test(indexHtml);
  let js = jsTags.filter(t => t.name === 'script' && t.attrs.src).map(t => localRef(t.attrs.src)).filter(Boolean);
  let css = cssTags.filter(t => t.name === 'link' && t.attrs.href).map(t => localRef(t.attrs.href)).filter(Boolean);
  if (!hasJsMarks) js = js.filter(f => f.startsWith('slides/'));
  if (!hasCssMarks) css = css.filter(f => f.startsWith('slides/'));
  return { js, css };
}

// 从风格文件里用正则读 Deck.scene('key', { label, family })
function parseScenes(text) {
  const out = {};
  const re = /Deck\.scene\(\s*(['"`])([\w-]+)\1/g;
  const hits = [];
  let m;
  while ((m = re.exec(text))) hits.push({ key: m[2], at: m.index });
  hits.forEach((h, i) => {
    const seg = text.slice(h.at, i + 1 < hits.length ? hits[i + 1].at : text.length);
    const label = /\blabel\s*:\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1/.exec(seg);
    const family = /\bfamily\s*:\s*(['"`])([\w-]+)\1/.exec(seg);
    out[h.key] = { label: label ? label[2] : h.key, family: family ? family[2] : null };
  });
  return out;
}

// 递归列出目录下的文件（相对路径、正斜杠），并找出最新的修改时间（文件和子目录都算）
function walk(root) {
  const files = [];
  let mtime = 0;
  if (!existsSync(root)) return { files, mtime };
  const visit = (abs, rel) => {
    const st = statSync(abs);
    mtime = Math.max(mtime, st.mtimeMs);
    if (!st.isDirectory()) { files.push(rel); return; }
    for (const name of readdirSync(abs)) visit(join(abs, name), rel ? rel + '/' + name : name);
  };
  visit(root, '');
  return { files: files.filter(Boolean), mtime: Math.round(mtime) };
}

/**
 * 读课件目录。
 * 返回 { dir, indexHtml, chapterJs, chapterCss, sceneFiles, scenes, slidesOnDisk, slidesMtime }
 */
export function readDeck(dir) {
  const abs = resolve(dir);
  if (!existsSync(abs) || !statSync(abs).isDirectory()) throw userError(`找不到课件目录：${abs}`);
  const indexFile = join(abs, 'index.html');
  if (!existsSync(indexFile)) throw userError(`${abs} 里没有 index.html，不像是一份课件。还没搭骨架的话先运行 new。`);
  const indexHtml = readText(indexFile);
  const { js, css } = chapterRefs(indexHtml);

  const scripts = htmlTags(blankHtmlComments(indexHtml))
    .filter(t => t.name === 'script' && t.attrs.src).map(t => localRef(t.attrs.src)).filter(Boolean);
  const sceneFiles = unique(scripts.filter(f => /^scenes\/[^/]+\.js$/.test(f)));
  const scenes = {};
  for (const f of sceneFiles) {
    const p = join(abs, f);
    if (existsSync(p)) Object.assign(scenes, parseScenes(readText(p)));
  }

  const { files, mtime } = walk(join(abs, 'slides'));
  return {
    dir: abs,
    indexHtml,
    chapterJs: unique(js),
    chapterCss: unique(css),
    sceneFiles,
    scenes,
    slidesOnDisk: files.filter(f => f.endsWith('.js')).map(f => 'slides/' + f).sort(),
    slidesMtime: mtime,
  };
}

/* ------------------------------------------------------------------
   假环境：Deck 只收集 add 的参数；gsap、document、window 等都是「什么都能点、什么都不做」
   这些对象都在 vm 里面建，不把 Node 这边的任何对象传进去，章节代码顺着 constructor 也摸不到 process。
   （node:vm 不是安全沙箱，这里防的是章节代码误碰 Node，不是防恶意代码。）
   ------------------------------------------------------------------ */

// 这个函数不在本模块里直接调用：取它的源码放进假环境里执行，所以里面不能引用外面的任何变量
function fakeEnv(names) {
  'use strict';
  const g = globalThis;
  // 什么都能点、能调用、能 new，结果还是它自己；转成数字是 0，转成文字是空串，遍历时是空的
  let any;
  any = new Proxy(function () {}, {
    get(t, k) {
      if (k === Symbol.toPrimitive) return hint => (hint === 'number' ? 0 : '');
      if (k === Symbol.iterator) return function* () {};
      if (typeof k === 'symbol') return undefined;
      if (k === 'length') return 0;
      return any;
    },
    set: () => true,
    has: () => true,
    apply: () => any,
    construct: () => any,
  });

  const pages = [];
  let file = null;
  const api = {
    add(def) {
      if (!def || typeof def !== 'object') return;
      // 在章节代码运行期间就把参数读出来（受超时保护），之后只碰普通对象
      const d = Object.assign({}, def);
      if (Array.isArray(d.notes)) d.notes = Array.from(d.notes, n => (n && typeof n === 'object' ? Object.assign({}, n) : n));
      pages.push({ file, def: d });
    },
  };
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  g.Deck = new Proxy(api, {
    get: (t, k) => (typeof k === 'symbol' ? t[k] : own(t, k) ? t[k] : any),
    set: () => true,
    has: () => true,
  });
  for (const k of names) g[k] = any;

  // window：已有的全局（含章节自己定义的）照实给，没有的给假的；往 window 上挂的东西别的章也能用
  const win = new Proxy(Object.create(null), {
    get: (t, k) => (typeof k === 'symbol' ? undefined : k in g ? g[k] : any),
    set: (t, k, v) => { g[k] = v; return true; },
    has: () => true,
    deleteProperty: (t, k) => { delete g[k]; return true; },
  });
  for (const k of ['window', 'self', 'top', 'parent', 'frames']) g[k] = win;

  return { pages, setFile(f) { file = f; } };
}

// 章节文件在加载时可能顺手用到的浏览器全局，一律给假的
const BROWSER_GLOBALS = [
  'document', 'gsap', 'rough', 'console', 'navigator', 'location', 'history', 'screen', 'visualViewport',
  'localStorage', 'sessionStorage', 'indexedDB', 'crypto', 'performance', 'customElements', 'speechSynthesis',
  'requestAnimationFrame', 'cancelAnimationFrame', 'requestIdleCallback', 'cancelIdleCallback',
  'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'queueMicrotask',
  'getComputedStyle', 'matchMedia', 'getSelection', 'addEventListener', 'removeEventListener', 'dispatchEvent',
  'alert', 'confirm', 'prompt', 'open', 'close', 'print', 'scrollTo', 'scrollBy', 'focus', 'blur',
  'innerWidth', 'innerHeight', 'outerWidth', 'outerHeight', 'devicePixelRatio', 'scrollX', 'scrollY',
  'fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'Worker', 'AbortController',
  'Image', 'Audio', 'Option', 'FontFace', 'Blob', 'File', 'FileReader', 'FormData', 'DOMParser', 'XMLSerializer',
  'HTMLElement', 'Element', 'SVGElement', 'Node', 'NodeList', 'Text', 'DocumentFragment', 'DOMRect', 'Path2D',
  'Event', 'CustomEvent', 'KeyboardEvent', 'MouseEvent', 'PointerEvent', 'TouchEvent', 'WheelEvent',
  'IntersectionObserver', 'ResizeObserver', 'MutationObserver', 'CSS',
  'URL', 'URLSearchParams', 'TextEncoder', 'TextDecoder', 'atob', 'btoa', 'structuredClone',
];

const CHAPTER_TIMEOUT = 2000;

// 运行出错时的说明：超时翻成中文；其余给「错误类型: 信息（第 n 行）」
function describeError(e, file, timeout) {
  if (e && e.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT') {
    return { message: `运行超过 ${Math.round(timeout / 1000)} 秒还没结束，可能有死循环`, line: null };
  }
  const isErr = e && (typeof e === 'object' || typeof e === 'function') && typeof e.message === 'string';
  const text = isErr ? `${typeof e.name === 'string' ? e.name : 'Error'}: ${e.message}` : String(e);
  const stack = isErr && typeof e.stack === 'string' ? e.stack : '';
  const esc = file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // 编译错误的 stack 第一行是「文件名:行号」，运行错误是「at 文件名:行号:列号」
  const m = new RegExp('^' + esc + ':(\\d+)').exec(stack) || new RegExp(esc + ':(\\d+):\\d+').exec(stack);
  const line = m ? Number(m[1]) : null;
  return { message: text + (line ? `（第 ${line} 行）` : ''), line };
}

/**
 * 按 index.html 的引入顺序，在同一个假环境里依次执行章节文件（和浏览器一样，各章共用全局）。
 * 返回 { pages: [{ no, file, def }], failures: [{ file, message, line }] }
 * - def 是 Deck.add 参数的浅拷贝，notes 也拷成普通数组；
 * - 某章出错时，出错之前加上的页照样算（浏览器里也是这样），后面的章照样跑；
 * - 文件不存在的章跳过，由检查另外报。
 */
export function collectPages(deck, { timeout = CHAPTER_TIMEOUT } = {}) {
  const failures = [];
  // 沙箱对象不能用普通的 {}：它的原型是 Node 这边的 Object.prototype，globalThis.constructor 会漏出去
  const ctx = vm.createContext(Object.create(null));
  const env = vm.runInContext(`(${fakeEnv.toString()})(${JSON.stringify(BROWSER_GLOBALS)})`, ctx);

  for (const rel of deck.chapterJs) {
    const file = join(deck.dir, rel);
    if (!existsSync(file) || !statSync(file).isFile()) continue;
    env.setFile(rel);
    try {
      new vm.Script(readText(file), { filename: rel }).runInContext(ctx, { timeout });
    } catch (e) {
      failures.push(Object.assign({ file: rel }, describeError(e, rel, timeout)));
    }
  }
  const pages = Array.from(env.pages, (p, i) => ({ no: i + 1, file: p.file, def: p.def }));
  return { pages, failures };
}
