// 不开浏览器的检查：id、标题、主题行、风格、文件、CSS 限定、transform、拍数、技术边界、讲词时长
// 章节文件在 deck.mjs 的假环境里执行，只收集 Deck.add 的参数；某章运行出错时明确报「这一章没查到」
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { readDeck, collectPages, readText, htmlTags, localRef, blankHtmlComments } from './deck.mjs';

const FAMILY = { hand: '手绘家', modern: '现代家', pixel: '像素家' };
// 引擎内置的朴素风格：页面写了也不算没引入
const BUILTIN_SCENES = { plain: { label: '朴素', family: 'modern' } };
// 计算拍数时看的属性
const BEAT_ATTRS = ['data-beat', 'data-mascot', 'data-kid', 'data-mark-beat', 'data-arrange'];
const MEDIA_ATTRS = ['src', 'data-src', 'poster'];
const BOUNDARY_FIX = '见 references/authoring.md 的「技术边界」一节：只用普通 script 标签和本地文件';

const isFile = p => existsSync(p) && statSync(p).isFile();
const text = v => (v == null || typeof v === 'object' || typeof v === 'function' ? '' : String(v).trim());
const toInt = v => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : 0; };

// 行号：先记下每个换行的位置，再二分查找
function lineIndex(src) {
  const nl = [];
  for (let i = src.indexOf('\n'); i >= 0; i = src.indexOf('\n', i + 1)) nl.push(i);
  return idx => {
    let lo = 0, hi = nl.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (nl[mid] < idx) lo = mid + 1; else hi = mid; }
    return lo + 1;
  };
}

/* ------------------------------------------------------------------
   JS：把注释（和字符串、正则的内容）换成空格，长度和换行不变
   strings=false 时只去注释，保留字符串（用来查字符串里的 <img src="http…"> 这类标签）
   ------------------------------------------------------------------ */
const KEYWORDS = new Set(['return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'throw', 'case', 'do', 'else', 'yield', 'await']);

export function maskJs(src, { strings = true } = {}) {
  const s = src;
  const n = s.length;
  const out = s.split('');
  const blank = (a, b) => { for (let k = a; k < b && k < n; k++) if (out[k] !== '\n' && out[k] !== '\r') out[k] = ' '; };
  const braces = []; // 模板字符串里 ${ } 的嵌套，每层记当前的花括号深度
  let valueEnd = false; // 上一个记号是不是一个值的结尾：是的话 / 是除号，不是的话 / 开始一个正则
  let i = 0;
  // 从模板字符串内容的起点往后扫，遇到 ` 结束、遇到 ${ 进入表达式；返回接下来的位置
  const template = j => {
    const st = j;
    while (j < n) {
      const c = s[j];
      if (c === '\\') { j += 2; continue; }
      if (c === '`') { if (strings) blank(st, j); return j + 1; }
      if (c === '$' && s[j + 1] === '{') { if (strings) blank(st, j); braces.push(0); valueEnd = false; return j + 2; }
      j++;
    }
    if (strings) blank(st, n);
    return n;
  };
  while (i < n) {
    const c = s[i];
    if (c === '/' && s[i + 1] === '/') { let e = s.indexOf('\n', i); if (e < 0) e = n; blank(i, e); i = e; continue; }
    if (c === '/' && s[i + 1] === '*') { let e = s.indexOf('*/', i + 2); e = e < 0 ? n : e + 2; blank(i, e); i = e; continue; }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && s[j] !== c && s[j] !== '\n') j += s[j] === '\\' ? 2 : 1;
      if (strings) blank(i + 1, j);
      i = j + 1; valueEnd = true; continue;
    }
    if (c === '`') { i = template(i + 1); valueEnd = true; continue; }
    if (c === '{') { if (braces.length) braces[braces.length - 1]++; valueEnd = false; i++; continue; }
    if (c === '}') {
      if (braces.length) {
        if (braces[braces.length - 1] === 0) { braces.pop(); i = template(i + 1); valueEnd = true; continue; }
        braces[braces.length - 1]--;
      }
      valueEnd = true; i++; continue;
    }
    if (c === '/') {
      if (valueEnd) { valueEnd = false; i++; continue; }
      let j = i + 1, cls = false;
      while (j < n && s[j] !== '\n') {
        const d = s[j];
        if (d === '\\') { j += 2; continue; }
        if (d === '[') cls = true; else if (d === ']') cls = false; else if (d === '/' && !cls) break;
        j++;
      }
      if (strings) blank(i + 1, j);
      i = j + 1;
      while (i < n && /[a-z]/i.test(s[i])) i++;
      valueEnd = true; continue;
    }
    if (/[\w$\u0080-￿]/.test(c)) {
      let j = i + 1;
      while (j < n && /[\w$\u0080-￿]/.test(s[j])) j++;
      valueEnd = !KEYWORDS.has(s.slice(i, j));
      i = j; continue;
    }
    if (!/\s/.test(c)) valueEnd = c === ')' || c === ']';
    i++;
  }
  return out.join('');
}

/* ------------------------------------------------------------------
   技术边界
   ------------------------------------------------------------------ */

// 代码里（字符串、注释已去掉）：import 语句、import(、fetch(
function scanJsCode(code, base = 0) {
  const hits = [];
  const add = (re, what) => { let m; while ((m = re.exec(code))) hits.push({ index: base + m.index, what }); };
  add(/(?<![\w$.])import\s*\(/g, 'import(');
  add(/(?<![\w$.])import(?=\s*[\w$*{'"`])/g, 'import 语句');
  add(/(?<![\w$])fetch\s*\(/g, 'fetch(');
  return hits;
}

// 原文里（注释已去掉）：src / href / url( 指向网络地址、type="module"；<a href> 外链不算
function scanRaw(raw) {
  const hits = [];
  const attrRe = /(?<![\w$:-])(src|href|poster|data-src|srcset)\s*=\s*\\?["']?\s*((?:https?:)?\/\/[^\s"'`<>)\\]*)/gi;
  let m;
  while ((m = attrRe.exec(raw))) {
    if (m[1].toLowerCase() === 'href') {
      const lt = raw.lastIndexOf('<', m.index);
      if (lt >= 0 && raw.indexOf('>', lt) >= m.index && /^<a\s/i.test(raw.slice(lt, lt + 3))) continue;
    }
    hits.push({ index: m.index, what: '外部地址 ' + m[2] });
  }
  const urlRe = /url\(\s*\\?["']?\s*((?:https?:)?\/\/[^\s"'`<>)\\]*)/gi;
  while ((m = urlRe.exec(raw))) hits.push({ index: m.index, what: '外部地址 ' + m[1] });
  const modRe = /\btype\s*=\s*\\?["']?module\b/gi;
  while ((m = modRe.exec(raw))) hits.push({ index: m.index, what: 'type="module"' });
  return hits;
}

function scanCssBoundary(css) {
  const hits = [];
  const re = /url\(\s*["']?\s*((?:https?:)?\/\/[^\s"')]*)|@import\s+["']\s*((?:https?:)?\/\/[^\s"']*)/gi;
  let m;
  while ((m = re.exec(css))) hits.push({ index: m.index, what: '外部地址 ' + (m[1] || m[2]) });
  return hits;
}

/* ------------------------------------------------------------------
   CSS：逐段读「选择器 {」；@media、@supports 等分组里的照样查，@keyframes、@font-face 等跳过；
   规则里嵌套的规则是相对写法，不单独查
   ------------------------------------------------------------------ */
const GROUP_AT = new Set(['media', 'supports', 'container', 'layer', 'document', 'scope']);

export function cssSelectors(css) {
  const s = css.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
  const lineOf = lineIndex(s);
  const out = [];
  const stack = []; // 'group' | 'rule' | 'skip'
  const n = s.length;
  let start = 0;
  let i = 0;
  const skipString = j => { const q = s[j]; j++; while (j < n && s[j] !== q && s[j] !== '\n') j += s[j] === '\\' ? 2 : 1; return j + 1; };
  const skipParens = j => {
    let depth = 0;
    while (j < n) {
      const c = s[j];
      if (c === '"' || c === "'") { j = skipString(j); continue; }
      if (c === '(') depth++;
      else if (c === ')' && --depth === 0) return j + 1;
      j++;
    }
    return n;
  };
  // 把一段选择器按最外层的逗号切开，记下每段的行号
  const split = (from, to) => {
    let depth = 0, seg = from, j = from;
    const push = end => {
      const raw = s.slice(seg, end);
      const lead = raw.search(/\S/);
      if (lead >= 0) out.push({ sel: raw.trim().replace(/\s+/g, ' '), line: lineOf(seg + lead) });
    };
    while (j < to) {
      const c = s[j];
      if (c === '"' || c === "'") { j = skipString(j); continue; }
      if (c === '(' || c === '[') depth++;
      else if (c === ')' || c === ']') depth--;
      else if (c === ',' && depth === 0) { push(j); seg = j + 1; }
      j++;
    }
    push(to);
  };
  while (i < n) {
    const c = s[i];
    if (c === '"' || c === "'") { i = skipString(i); continue; }
    if (c === '(') { i = skipParens(i); continue; }
    if (c === '{') {
      const top = stack[stack.length - 1];
      if (top === 'skip' || top === 'rule') stack.push(top);
      else {
        const prelude = s.slice(start, i).trim();
        if (prelude.startsWith('@')) {
          const at = (/^@([\w-]+)/.exec(prelude) || [])[1] || '';
          stack.push(GROUP_AT.has(at.toLowerCase()) ? 'group' : 'skip');
        } else {
          split(start, i);
          stack.push('rule');
        }
      }
      i++; start = i; continue;
    }
    if (c === '}') { stack.pop(); i++; start = i; continue; }
    if (c === ';') { i++; start = i; continue; }
    i++;
  }
  return out;
}

// 按最外层的逗号切开（括号、方括号、引号里的逗号不算）
function splitTop(s) {
  const parts = [];
  let depth = 0, seg = 0, q = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = ''; continue; }
    if (c === '"' || c === "'") q = c;
    else if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (c === ',' && depth === 0) { parts.push(s.slice(seg, i)); seg = i + 1; }
  }
  parts.push(s.slice(seg));
  return parts.map(x => x.trim());
}

// 选择器是不是限定到了页面：以 [data-id=…] 开头；或者第一个复合选择器（第一个空格、>、+、~ 之前）里
// 直接带着 [data-id=…]；或者第一个复合选择器是 :is() / :where()，里面每一项都限定了。
// [data-id] 只出现在 :not() 等别的括号里、或者出现在后代位置的，都不算。
export function isScoped(sel) {
  if (/^\[\s*data-id\s*=/.test(sel)) return true;
  const n = sel.length;
  let i = 0, depth = 0, q = '';
  for (; i < n; i++) {
    const c = sel[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = ''; continue; }
    if (c === '"' || c === "'") q = c;
    else if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (depth === 0 && /[\s>+~]/.test(c)) break;
  }
  const head = sel.slice(0, i);
  // 在第一个复合选择器的最外层找 [data-id=…] 和 :is( / :where(
  for (let j = 0; j < head.length; j++) {
    const c = head[j];
    if (c === '[') {
      const end = head.indexOf(']', j);
      if (/^\[\s*data-id\s*=/.test(head.slice(j, end + 1))) return true;
      j = end < 0 ? head.length : end;
    } else if (c === '(') {
      // 括号成对跳过；如果是 :is( / :where(，看里面每一项
      let d = 0, k = j;
      for (; k < head.length; k++) { if (head[k] === '(') d++; else if (head[k] === ')' && --d === 0) break; }
      if (/:(?:is|where)$/i.test(head.slice(0, j)) && splitTop(head.slice(j + 1, k)).every(isScoped)) return true;
      j = k;
    }
  }
  return false;
}

/* ------------------------------------------------------------------
   讲词字数和时长
   ------------------------------------------------------------------ */
// 汉字一个算一个字，英文单词、数字一串算一个字；标点不算
function countWords(s) {
  return (s.match(/[㐀-鿿豈-﫿]/g) || []).length
    + (s.match(/[A-Za-z0-9]+(?:['.-][A-Za-z0-9]+)*/g) || []).length;
}

function durationLine(chars) {
  if (!chars) return '讲词共 0 字，还没写讲词（notes 里的 say）';
  const lo = chars / 250, hi = chars / 220;
  // 10 分钟以内按半分钟取整，再长按整分钟
  const f = x => (x >= 10 ? String(Math.round(x)) : String(Math.round(x * 2) / 2));
  let span;
  if (hi < 1) span = '不到 1 分钟';
  else {
    const a = f(Math.max(lo, 0.5)), b = f(hi);
    span = a === b ? `大约讲 ${a} 分钟` : `大约讲 ${a}–${b} 分钟`;
  }
  return `讲词共 ${chars} 字，按每分钟 220–250 字估，${span}`;
}

/* ------------------------------------------------------------------
   主函数
   ------------------------------------------------------------------ */

/**
 * 检查一份课件，不开浏览器。
 * 返回 { text, errors, warnings, pages, issues }：text 是给人看的报告，pages 是页数，
 * issues 是 [{ level: 'error' | 'warn', msg, fix, page? }]，顺序和报告里一致。
 * 目录不存在或没有 index.html 时抛出带 userMessage 的错误。
 */
export async function checkStatic(dir) {
  const deck = readDeck(dir);
  const { pages, failures } = collectPages(deck);
  const issues = [];
  const error = (msg, fix, page = null) => issues.push({ level: 'error', msg, fix, page });
  const warn = (msg, fix, page = null) => issues.push({ level: 'warn', msg, fix, page });

  // 1. 章节运行出错
  for (const f of failures) error(`${f.file} 运行出错，这一章没查到：${f.message}`, '按错误信息改');

  // 2. index.html 引入的本地文件不存在（章节、风格、引擎、vendor 都查）
  const indexPlain = blankHtmlComments(deck.indexHtml);
  const indexTags = htmlTags(indexPlain);
  const refs = [];
  for (const t of indexTags) {
    const r = t.name === 'script' ? localRef(t.attrs.src) : t.name === 'link' ? localRef(t.attrs.href) : null;
    if (r && !refs.includes(r)) refs.push(r);
  }
  for (const r of refs) {
    if (!isFile(join(deck.dir, r))) error(`index.html 引入了 ${r}，但文件不存在`, '建这个文件，或删掉这行引入');
  }

  // 3. slides 里有、但没在 index.html 里引入的章节
  for (const f of deck.slidesOnDisk) {
    if (!deck.chapterJs.includes(f)) warn(`${f} 没有在 index.html 里引入，里面的页面不会显示`, '在 index.html 的章节区加一行引入');
  }

  // 4. 逐页
  const known = Object.assign({}, BUILTIN_SCENES, deck.scenes);
  const imported = Object.keys(deck.scenes);
  const sceneList = imported.length
    ? imported.map(k => `${k}（${deck.scenes[k].label}）`).join('、')
    : '（index.html 里还没有引入风格文件）';
  const firstById = new Map();
  const usedScenes = [];
  let sayChars = 0;
  pages.forEach(p => {
    const d = p.def;
    const n = p.no;
    const id = text(d.id);
    const at = id ? `第 ${n} 页 ${id}` : `第 ${n} 页`;
    const edge = n === 1 || n === pages.length;

    if (!id) error(`第 ${n} 页没写 id`, `加一个全稿唯一的 id，比如 p${n}`, n);
    else if (firstById.has(id)) error(`第 ${n} 页：id「${id}」和第 ${firstById.get(id)} 页重复`, '改成全稿唯一的 id', n);
    else firstById.set(id, n);

    if (!text(d.title)) error(`${at}：没写 title`, '加上标题，演讲者视图和阅读模式要用', n);
    if (!edge && !text(d.topic)) warn(`${at}：没写主题行 topic`, '加上「本页主题」', n);

    const scene = text(d.scene);
    if (!scene) error(`${at}：没写风格 scene`, `换成已引入的风格：${sceneList}`, n);
    else if (!known[scene]) error(`${at}：风格「${scene}」没有引入`, `换成已引入的风格：${sceneList}`, n);
    else if (!usedScenes.includes(scene)) usedScenes.push(scene);

    const html = typeof d.html === 'string' ? d.html : '';
    const tags = htmlTags(html);

    // 图片、视频等文件
    const missing = [];
    const checkRef = v => {
      const r = localRef(v);
      if (r && !missing.includes(r) && !isFile(join(deck.dir, r))) missing.push(r);
    };
    for (const t of tags) {
      for (const a of MEDIA_ATTRS) if (t.attrs[a]) checkRef(t.attrs[a]);
      if (t.attrs.style) {
        const re = /url\(\s*(['"]?)(.*?)\1\s*\)/g;
        let m;
        while ((m = re.exec(t.attrs.style))) checkRef(m[2]);
      }
    }
    for (const r of missing) error(`${at}：找不到文件 ${r}`, '检查文件名，文件要放在课件目录里', n);

    // 带拍的元素写了 transform（会和出场动画打架）
    if (tags.some(t => 'data-beat' in t.attrs && /(?:^|[;\s])transform\s*:/i.test(t.attrs.style || ''))) {
      error(`${at}：带拍的元素上写了 transform`, '位置用 left / top，倾斜用 --r', n);
    }

    // 拍数
    let total = 0;
    for (const t of tags) for (const a of BEAT_ATTRS) if (a in t.attrs) total = Math.max(total, toInt(t.attrs[a]));
    const notes = Array.isArray(d.notes) ? d.notes.filter(x => x && typeof x === 'object') : null;
    if (notes && notes.length) {
      const said = Math.max(...notes.map(x => toInt(x.beat)));
      if (said !== total) warn(`${at}：讲词写到第 ${said} 拍，页面有 ${total} 拍`, '让讲词和节拍一一对应', n);
    }
    const [min, max] = edge ? [1, 2] : [2, 4];
    if (total < min || total > max) warn(`${at}：有 ${total} 拍，建议 2 到 4 拍（封面结尾 1 到 2 拍）`, '拆页或合并节拍', n);

    // 讲词字数
    if (notes) for (const x of notes) sayChars += countWords(text(x.say));
    else if (typeof d.notes === 'string') sayChars += countWords(d.notes);
  });

  // 5. 跨家混用
  const fam = k => known[k].family;
  const famName = f => FAMILY[f] || f || '没写家';
  const name = k => known[k].label || k;
  const base = usedScenes.find(k => fam(k));
  if (base) {
    const seen = new Set([fam(base)]);
    for (const k of usedScenes) {
      const f = fam(k);
      if (!f || seen.has(f)) continue;
      seen.add(f);
      warn(`风格混用了不同的家：${name(base)}（${famName(fam(base))}）和 ${name(k)}（${famName(f)}）`, '同一份课件里只用同一家的风格');
    }
  }

  // 6. 页面 CSS 要以 [data-id="…"] 开头
  const cssFiles = deck.chapterCss.filter(f => isFile(join(deck.dir, f)));
  const cssText = {};
  for (const f of cssFiles) {
    cssText[f] = readText(join(deck.dir, f));
    for (const { sel, line } of cssSelectors(cssText[f])) {
      if (!isScoped(sel)) {
        error(`${f} 第 ${line} 行：选择器「${sel}」没以 [data-id="…"] 开头`, '在选择器前面加上 [data-id="页面id"]');
      }
    }
  }

  // 7. 越过技术边界：章节 js、章节 css、index.html 都查
  const boundary = [];
  const report = (file, src, hits) => {
    const lineOf = lineIndex(src);
    for (const h of hits.sort((a, b) => a.index - b.index)) {
      const msg = `${file} 第 ${lineOf(h.index)} 行：用了 ${h.what}，课件里不能用`;
      if (!boundary.includes(msg)) boundary.push(msg);
    }
  };
  for (const f of deck.chapterJs) {
    const p = join(deck.dir, f);
    if (!isFile(p)) continue;
    const src = readText(p);
    report(f, src, scanJsCode(maskJs(src)).concat(scanRaw(maskJs(src, { strings: false }))));
  }
  for (const f of cssFiles) {
    const plain = cssText[f].replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
    report(f, plain, scanCssBoundary(plain));
  }
  {
    const hits = scanRaw(indexPlain);
    const re = /<script\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/script\s*>/gi;
    let m;
    while ((m = re.exec(indexPlain))) {
      if (/\bsrc\s*=/i.test(m[1])) continue;
      const bodyAt = m.index + '<script'.length + m[1].length + 1;
      hits.push(...scanJsCode(maskJs(m[2]), bodyAt));
    }
    report('index.html', indexPlain, hits);
  }
  for (const msg of boundary) error(msg, BOUNDARY_FIX);

  // 排版
  const errs = issues.filter(x => x.level === 'error');
  const warns = issues.filter(x => x.level !== 'error');
  const block = (title, list) => (list.length ? `\n${title}\n` + list.map(x => `  ${x.msg}\n    → ${x.fix}`).join('\n') : '');
  const out = `检查：${pages.length} 页，${errs.length} 个错误、${warns.length} 个提醒\n`
    + block('错误', errs) + block('提醒', warns)
    + `\n信息\n  ${durationLine(sayChars)}`;
  return { text: out, errors: errs.length, warnings: warns.length, pages: pages.length, issues: errs.concat(warns) };
}
