// 在线编辑的修改记录 .li-talk/edits.json：读写、摘要格式，以及 edits 命令
//   edits <课件目录>                 打印用户在浏览器里做的、还没合并进源码的修改清单（每条一行，末尾是合并规则），
//                                    并把这份清单记成一个批次（批次号印在清单开头）
//   edits <课件目录> --done [批次号]  合并完以后运行：只清掉打印过的那一批（不写批次号就是最近打印的一批）；
//                                    打印之后用户又新加、又改过的修改留着，下次再合并
//
// 文件格式（version 1）：
//   { version, updated, notified, merged, batch, done, items: [{ id, at, page, no, path, hint, kind, …, before, after }] }
//   - id 是浏览器给每条修改起的编号，at 是这条最后一次改动的时刻（毫秒）；page 是页面 id（p05），no 是第几页；
//     path 是从 .slide 往下的选择器，hint 是元素开头的字
//   - kind：
//       text  改文字、设重点词：{ text, html? }
//       box   挪位置改大小：{ left, top, width, height }（舞台坐标）；position：absolute 或 flow（在排版流里）；
//             origin：absolute 元素的定位容器不是页面本身时，容器在舞台上的左上角 { left, top }
//       hide  隐藏：{ hidden }
//       style 字号、颜色、粗细、对齐：{ fontSize, color, fontWeight, textAlign }，字号是风格变量（var(--fs-lg)）或 px（64px），颜色写风格变量（var(--accent)）
//       scale 整块等比缩放：{ scale, origin }，scale 是倍数（1.2），origin 是 center 或 top left
//       beat  改拍号：{ beat }；own：元素本来写了 data-beat（false 是跟着外层的拍）；mascot：元素上还有 data-mascot
//       notes 改讲词（演讲者视图里改的）：{ text }；beat 写第几拍，path 固定是 notes
//   - batch：最近一次打印的清单 { id, at, items }（items 是打印时那些修改的副本）
//   - done：最近一次 --done 清掉的修改 [{ id, at, after }]。浏览器在 AI 合并期间又把旧清单存回来时，
//     服务按它把已经合并的条目去掉、合并之后又改过的条目把 before 换成已经合并的值（applyDone）
// 浏览器那边（engine/edit.js）有一份同样格式的摘要（复制修改给 AI 时用），两边每条的写法要一致。
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { UserError } from './cli.mjs';
import { SKILL_DIR } from './paths.mjs';

export const EDITS_FILE = join('.li-talk', 'edits.json');
export const KINDS = ['text', 'box', 'hide', 'style', 'beat', 'notes', 'scale'];
/* 合并方式：用户点「通知 AI 修改」（或复制修改）时选的，写在 edits.json 的 mode 里；没选过按 exact。engine/edit.js 的 MODES 是同一套 */
export const MODES = {
  exact: '① 照我改的（原样）：位置、大小、文字、样式一律照清单原样落进源码，不对齐、不取整、不重排、不顺手美化；' +
    '自检报了重叠、越界、溢出，只告诉用户是哪处、为什么，不擅自挪（写错代码报的错照常修）；用户说要调再调。合并后 check --browser 会核对位置，对不上的照提示改到对上为止。',
  polish: '② 照我改的，AI 帮着润色：先照清单原样落位（同①），再做小幅调整：对齐、留边、修重叠、统一间距；' +
    '每一处调整都写给用户：哪一块、用户改的是多少、改成了多少、为什么。用户改过的文字照原样（文案只给建议），不整页重排。',
  ai: '③ 交给 AI 重新优化：用户的改动当作方向参考（想放大哪块、挪到哪边、强调什么），可以按风格的版式规则重新排这一页；' +
    '改完告诉用户做了哪些调整、和他改的哪里不一样。用户改过的文字照样原样合并，再给建议。',
};
export const MODE_KEYS = Object.keys(MODES);
export const modeOf = d => (d && MODE_KEYS.includes(d.mode) ? d.mode : 'exact');
const BOX_KEYS = ['left', 'top', 'width', 'height'];
const STYLE_KEYS = ['fontSize', 'color', 'fontWeight', 'textAlign'];

export const editsPath = dir => join(dir, EDITS_FILE);
const blank = () => ({ version: 1, updated: null, notified: null, merged: null, mode: null, batch: null, done: [], items: [] });

// 命令里的路径：正斜杠、加引号（和 guide 的写法一样，这里单写一份，免得引入 guide 一大串模块）
const fwd = p => String(p).replace(/\\/g, '/');
const q = p => `"${fwd(p)}"`;
export const cliLine = (...parts) => [`node ${q(join(SKILL_DIR, 'scripts', 'li-talk.mjs'))}`, ...parts].join(' ');

/** 读修改记录；没有文件或写坏了都当成空的（坏文件不抛错：浏览器下次保存时会整个重写） */
export function readEdits(dir) {
  let d = null;
  try { d = JSON.parse(readFileSync(editsPath(dir), 'utf8').replace(/^﻿/, '')); } catch { d = null; }
  if (!d || typeof d !== 'object' || Array.isArray(d)) return blank();
  const b = d.batch && typeof d.batch === 'object' && typeof d.batch.id === 'string' ? d.batch : null;
  return {
    version: 1,
    updated: typeof d.updated === 'string' ? d.updated : null,
    notified: typeof d.notified === 'string' ? d.notified : null,
    merged: typeof d.merged === 'string' ? d.merged : null,
    mode: MODE_KEYS.includes(d.mode) ? d.mode : null,
    batch: b ? { id: b.id, at: typeof b.at === 'string' ? b.at : null, items: Array.isArray(b.items) ? b.items.map(cleanItem).filter(Boolean) : [] } : null,
    done: Array.isArray(d.done) ? d.done.filter(x => x && typeof x.id === 'string').slice(-500) : [],
    items: Array.isArray(d.items) ? d.items.map(cleanItem).filter(Boolean) : [],
  };
}

/** 写修改记录：先写临时文件再改名，读的一方不会读到写了一半的文件 */
export function writeEdits(dir, data) {
  const file = editsPath(dir);
  mkdirSync(join(dir, '.li-talk'), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n');
  // Windows 上目标文件正被别的进程读着时改名会失败（EPERM），稍等再试几次
  for (let i = 0; ; i++) {
    try { renameSync(tmp, file); return data; } catch (e) {
      if (i >= 8) { try { unlinkSync(tmp); } catch { /* 删不掉不要紧 */ } throw e; }
      const until = Date.now() + 30 * (i + 1);
      while (Date.now() < until) { /* 短暂等一下 */ }
    }
  }
}

const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
const int = v => (v !== null && v !== '' && Number.isFinite(+v) ? Math.round(+v) : null);

// 整理一条修改：只留认得的字段、类型对的值（浏览器发来的东西不全信）
export function cleanItem(it) {
  if (!it || typeof it !== 'object') return null;
  const kind = KINDS.includes(it.kind) ? it.kind : null;
  const page = str(it.page, 80), path = str(it.path, 600);
  if (!kind || !page || !path) return null;
  const out = {};
  if (typeof it.id === 'string' && it.id) out.id = it.id.slice(0, 40);
  if (int(it.at) !== null) out.at = int(it.at);
  Object.assign(out, { page, no: int(it.no), path, hint: str(it.hint, 80), kind });
  const side = v => {
    const o = v && typeof v === 'object' ? v : {};
    if (kind === 'text') {
      const r = { text: str(o.text, 5000) };
      if (typeof o.html === 'string') r.html = o.html.slice(0, 20000);
      return r;
    }
    if (kind === 'box') { const r = {}; for (const k of BOX_KEYS) r[k] = int(o[k]); return r; }
    if (kind === 'style') { const r = {}; for (const k of STYLE_KEYS) r[k] = str(String(o[k] == null ? '' : o[k]), 80); return r; }
    if (kind === 'beat') return { beat: Math.max(0, int(o.beat) || 0) };
    if (kind === 'notes') return { text: str(o.text, 5000) };
    if (kind === 'scale') {
      const v = Number(o.scale);
      return { scale: Number.isFinite(v) && v > 0 ? Math.round(v * 100) / 100 : 1, origin: o.origin === 'top left' ? 'top left' : 'center' };
    }
    return { hidden: o.hidden === true };
  };
  out.before = side(it.before);
  out.after = side(it.after);
  if (kind === 'box') {
    if (it.position === 'absolute' || it.position === 'flow') out.position = it.position;
    if (it.origin && typeof it.origin === 'object' && int(it.origin.left) !== null && int(it.origin.top) !== null) {
      out.origin = { left: int(it.origin.left), top: int(it.origin.top) };
    }
  }
  // keep：排版流里的块改了字号、宽高以后，预览时给它加的 margin-bottom（px），后面的内容才没被推开
  if ((kind === 'style' || kind === 'box') && int(it.keep) !== null) out.keep = int(it.keep);
  // css：浏览器换算好的「照写」CSS（元素自己的坐标），挪位置、改大小、整块缩放才有
  if ((kind === 'box' || kind === 'scale') && typeof it.css === 'string' && it.css.trim()) out.css = it.css.replace(/[{}<>]/g, '').slice(0, 300);
  if (kind === 'beat') { out.own = it.own !== false; if (it.mascot === true) out.mascot = true; }
  if (kind === 'notes') out.beat = Math.max(0, int(it.beat) || 0);
  if (out.no === null) delete out.no;
  return out;
}

/** 有没有一次没处理的通知：点过通知、通知之后没合并过、还有修改 */
export function pendingNotify(d) {
  if (!d.notified || !d.items.length) return false;
  return !d.merged || Date.parse(d.notified) > Date.parse(d.merged);
}

/**
 * 去掉已经合并的修改：done 里有同一个 id、同一个 at 的，已经合并，去掉；
 * id 相同但 at 更新的（合并之后用户又改过），留着，before 换成已经合并的值；改回到已经合并的值的，也去掉
 */
export function applyDone(items, done) {
  if (!done || !done.length) return items;
  const m = new Map(done.map(x => [x.id, x]));
  const out = [];
  for (const it of items) {
    const d = it.id && m.get(it.id);
    if (!d) { out.push(it); continue; }
    if (it.at != null && d.at != null && it.at <= d.at) continue;
    const next = { ...it, before: d.after ? JSON.parse(JSON.stringify(d.after)) : it.before };
    if (JSON.stringify(next.before) === JSON.stringify(next.after)) continue;
    out.push(next);
  }
  return out;
}

/**
 * 把别处来的修改（双击打开的页面离线时做的，切到在线编辑时带过来）并进现有的：
 * 同一个元素的同一种修改（同页、同路径、同类，讲词再加同一拍）只留一条，留最后改的（at 大的，一样大留现有的）
 */
const itemKey = it => [it.page, it.path, it.kind, it.kind === 'notes' ? it.beat : ''].join('\n');
export function mergeItems(cur, incoming) {
  const out = cur.slice(), at = new Map(out.map((it, i) => [itemKey(it), i]));
  for (const it of incoming) {
    const k = itemKey(it), i = at.get(k);
    if (i === undefined) { at.set(k, out.length); out.push(it); } else if ((it.at || 0) > (out[i].at || 0)) out[i] = it;
  }
  return out.sort((a, b) => (a.no || 0) - (b.no || 0));
}

/* ------------------------------------------------------------------
   摘要：每条一行。engine/edit.js 的 itemLine 和这里写法一致
   ------------------------------------------------------------------ */
const tagsOf = html => (String(html || '').match(/<\s*([a-zA-Z][\w-]*)/g) || []).map(t => t.replace(/[<\s]/g, '').toLowerCase()).join(',');
const norm = t => String(t == null ? '' : t).replace(/\s+/g, ' ').trim();
const short = (t, n = 60) => { const s = norm(t); return s.length > n ? s.slice(0, n) + '…' : s; };
const STYLE_NAMES = { fontSize: '字号', color: '颜色', fontWeight: '粗细', textAlign: '对齐' };

/** 一条修改写成一行（不带序号） */
export function itemLine(it) {
  if (it.kind === 'notes') {
    return `第 ${it.no || '?'} 页（${it.page}）第 ${it.beat} 拍的讲词：「${short(it.before.text, 40)}」→「${norm(it.after.text)}」`;
  }
  const where = `第 ${it.no || '?'} 页（${it.page}）${it.path}${it.hint ? `「${short(it.hint, 40)}」` : ''}`;
  if (it.kind === 'text') {
    let s = `${where}：文字「${short(it.before.text, 60)}」→「${norm(it.after.text)}」`;
    if (it.after.html != null && tagsOf(it.before.html) !== tagsOf(it.after.html)) s += `；行内标签变了，改后的 HTML：${it.after.html}`;
    return s;
  }
  if (it.kind === 'hide') return `${where}：隐藏（删掉这个元素）`;
  const b = it.before, a = it.after;
  if (it.kind === 'scale') return `${where}：整块缩放 ${Math.round(b.scale * 100)}%→${Math.round(a.scale * 100)}%（原点 ${a.origin === 'top left' ? '左上角 top left' : '中心 center'}）${cssNote(it)}`;
  if (it.kind === 'style') {
    const parts = STYLE_KEYS.filter(k => b[k] !== a[k]).map(k => `${STYLE_NAMES[k]} ${b[k]}→${a[k]}`);
    return `${where}：样式 ${parts.join('、') || '没有变化'}${keepNote(it)}`;
  }
  if (it.kind === 'beat') {
    let s = `${where}：拍号 第 ${b.beat} 拍→第 ${a.beat} 拍出现`;
    const notes = [];
    if (!it.own) notes.push(`它本来没写 data-beat，跟着外层第 ${b.beat} 拍出现`);
    if (it.mascot) notes.push('元素上还有 data-mascot，拍号一起改');
    return s + (notes.length ? `（${notes.join('；')}）` : '');
  }
  const diff = keys => keys.filter(k => b[k] !== a[k]).map(k => `${k} ${b[k]}→${a[k]}`).join('、');
  const parts = [];
  const pos = diff(['left', 'top']), size = diff(['width', 'height']);
  if (pos) parts.push('位置 ' + pos);
  if (size) parts.push('大小 ' + size);
  let s = `${where}：${parts.join('，') || '没有变化'}`;
  if (it.position === 'flow') {
    const dx = a.left - b.left, dy = a.top - b.top;
    const mv = [dx ? (dx > 0 ? `右移 ${dx}` : `左移 ${-dx}`) : '', dy ? (dy > 0 ? `下移 ${dy}` : `上移 ${-dy}`) : ''].filter(Boolean).join('、');
    s += `（元素在排版流里，不是 absolute${mv ? `；相对原位${mv}` : ''}）`;
  } else if (it.origin) {
    s += `（定位容器在舞台 (${it.origin.left}, ${it.origin.top})，CSS 里的 left/top 要减去它）`;
  }
  return s + keepNote(it) + cssNote(it);
}

// 浏览器换算好的 CSS：照抄进章节 css（engine/edit.js 的 cssNote 同一句）
export const cssNote = it => (it.css ? `；照写：${it.css}` : '');

// 排版流里的块变高变矮时，浏览器里是用 margin-bottom 抵掉的（后面的内容没动），合并时照写
export const keepNote = it => (Number.isInteger(it.keep) ? `（后面的内容保持原位：给它写 margin-bottom:${it.keep}px）` : '');

// 按页数一数：「第 2 页 2 处、第 5 页 1 处」
function perPage(items) {
  const m = new Map();
  for (const it of items) { const k = it.no || it.page; m.set(k, (m.get(k) || 0) + 1); }
  return [...m].map(([k, n]) => (typeof k === 'number' ? `第 ${k} 页 ${n} 处` : `${k} ${n} 处`)).join('、');
}

/** 合并规则（edits、wait 的末尾，SKILL.md 的「在线编辑」一节写的是同一套）；位置一条和最后一条按合并方式不同 */
export function rulesFor(mode) {
  return BASE_RULES.map(r => (r === '@POS' ? POS_RULE : r === '@CHECK' ? CHECK_RULE[mode] || CHECK_RULE.exact : r));
}
const POS_RULE = '- 位置、大小：每条都写了「照写：…」，是浏览器换算好的 CSS（已经是元素自己的坐标：减掉了定位容器、排版流里的元素是相对原位的偏移、宽高按盒模型算好），' +
  '照抄进对应章节 chN.css 里这个元素的那条规则（[data-id="页号"] <能定位到它的类名>{…}）；元素本来有行内 style="left:…;top:…;width:…" 的，直接改成照写的值。' +
  '原来用 right / bottom 定位的，改成照写的 left / top 并去掉 right / bottom。用户改过的宽和高都照写，不要只写宽度、丢掉高度，也不要为了合并去改容器的排法。不要在 JS 里加一堆行内 transform。';
const CHECK_RULE = {
  exact: '- 自检报了重叠、越界、溢出：用户亲手摆的位置不擅自挪，只告诉用户哪处、为什么，问他要不要调；报「合并后位置和用户拖的不一样」的，照提示改到对上为止。',
  polish: '- 自检报了重叠、越界、溢出：可以小幅调整，调了的每一处都告诉用户（原来、改成、为什么）。',
  ai: '- 自检报了重叠、越界、溢出：照版式规则调好，告诉用户调了哪些。',
};
const BASE_RULES = [
  '合并规则：',
  '- 找元素：路径从页面根往下写，:nth-of-type(n) 按 Deck.add 的 html 里的兄弟数，用来在源码里找到它，「」里是它开头的字。写 CSS 时不要照抄 nth-of-type（页面上引擎会多加元素，数出来对不上），给元素加一个类名（比如 p05-tip）再用它定位。',
  '- 文字：在 slides/ 的章节文件里按「」里的原文找到这一处，换成新文字（页面大标题在 Deck.add 的 title 里，截图说明在 data-caption 里）；讲稿.md 里同一句也改掉。' +
    '写了「改后的 HTML」的照那段换：<em class="key">…</em> 是用户设的重点词（标题里的重点词写进 titleHtml，title 照样写纯文字）。',
  '@POS',
  '- 隐藏：删掉这个元素，后面的拍号顺移，notes 里对应的讲词一起调整。',
  '- 整块缩放：文字、图片、间距一起等比放大缩小。在源码里给这一块加个类名（比如 p05-shot），在章节 chN.css 里写 [data-id="页号"] .p05-shot{scale:1.2;transform-origin:center}' +
    '（原点是左上角的写 top left），不改原来的宽高和字号，也不要写 transform（会和出场动画打架）。',
  '- 样式：优先换成已有的类名——字号 var(--fs-xl) 用 t-xl、var(--fs-lg) 用 t-lg、var(--fs-md) 用 t-md、var(--fs-min) 用 t-sm，粗细 700 用 b，' +
    '居中用 center，颜色 var(--ink-2) 用 muted；没有对应类名的，在章节 chN.css 里加 [data-id="页号"] 选择器{font-size:…;color:var(--…)}，颜色写变量不写死。' +
    '字号是 px 数字（64px）的：能对上风格档位变量的写变量（engine.css 默认 --fs-xl 84、--fs-title 68、--fs-lg 50、--fs-md 42、--fs-body 36、--fs-min 34，风格改过的以风格 css 为准），对不上的照写 px。不要堆行内 style。' +
    '这段字里面自己写了字号的行内小字（<small>、带类名的 <span>），按同样的比例改，或者改成 em 跟着外面走。' +
    '写了「后面的内容保持原位：给它写 margin-bottom:Npx」的，把这个 margin-bottom 一起写进同一条 CSS（浏览器里就是这样预览的，不写的话后面的行会被推开）。',
  '- 拍号：改这个元素的 data-beat（本来没写的就加上）；同一个元素上的 data-mascot 拍号一起改；notes 里对应拍的讲词跟着挪。改完拍数超出范围的话，check 会提醒，照提醒调。',
  '- 讲词：页面 notes 里对应拍的 say 和 讲稿.md 里这一页对应拍的讲词一起改成新的。',
  '@CHECK',
];
export const RULES = rulesFor('exact');

/** 清单末尾的提醒：文案先原样合并，再给建议（engine/edit.js 的 COPY_TIP 同一句） */
export const COPY_TIP = '这一批里有文字或讲词改动的：先照用户改的原样合并；跑完自检、清掉批次以后，再逐条看这些文案，给用户优化建议（原文、用户改的、建议改成什么、为什么：更口语、更短、后排看得清、像误输入、和讲词对不上……），问用户采纳哪几条，用户没说就不动。';

/** 整份清单；opts.dir 有值时末尾写上接下来要运行的命令；opts.batch 是批次号 */
export function formatEdits(d, opts = {}) {
  if (!d.items.length) return '没有待合并的修改。';
  const mode = modeOf(d);
  const out = [`用户在浏览器里改了 ${d.items.length} 处（${perPage(d.items)}）${opts.batch ? `，批次 ${opts.batch}` : ''}：`];
  d.items.forEach((it, i) => out.push(`  ${i + 1}. ${itemLine(it)}`));
  out.push('合并方式（用户选的，照它来）：' + MODES[mode]);
  out.push(...rulesFor(mode));
  if (d.items.some(it => it.kind === 'text' || it.kind === 'notes')) out.push(COPY_TIP);
  if (opts.dir) {
    out.push('改完以后：', `  ${cliLine('check', q(opts.dir), '--browser')}    （清零为止）`,
      `  ${cliLine('edits', q(opts.dir), '--done', ...(opts.batch ? [opts.batch] : []))}    （只清掉这一批；合并期间用户新改的留着，浏览器会自动刷新）`,
      '  在线编辑还开着的话，再后台运行一次 wait，等用户下一次点「通知 AI 修改」：',
      `  ${cliLine('wait', q(opts.dir))}`);
  }
  return out.join('\n');
}

/** 把现在的修改记成一个批次（edits、wait 打印清单时调用），返回批次号 */
export function recordBatch(dir) {
  const d = readEdits(dir);
  if (!d.items.length) return null;
  const now = new Date();
  const id = 'b' + now.getTime().toString(36);
  writeEdits(dir, { ...d, batch: { id, at: now.toISOString(), items: d.items } });
  return { id, data: d };
}

const fmtTime = iso => {
  const t = new Date(iso);
  if (isNaN(t)) return String(iso);
  const p = n => String(n).padStart(2, '0');
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())} ${p(t.getHours())}:${p(t.getMinutes())}:${p(t.getSeconds())}`;
};

/** 课件目录：要存在、要是个目录 */
export function deckDir(target, cmd) {
  if (!target) throw new UserError(`${cmd} 后面要写课件目录，比如：${cmd} ./我的分享`);
  const dir = resolve(String(target));
  if (!existsSync(dir) || !statSync(dir).isDirectory()) throw new UserError(`找不到课件目录：${dir}`);
  return dir;
}

/** 状态行：用户点没点通知 */
export function statusLine(d) {
  if (pendingNotify(d)) return `用户在 ${fmtTime(d.notified)} 点了「通知 AI 修改」。`;
  return '用户还没点「通知 AI 修改」：这些是自动保存的修改，用户可能还在改；照样可以先合并。';
}

/** 打印清单并记成一个批次（edits 和 wait 共用） */
export function printBatch(dir, log) {
  const r = recordBatch(dir);
  if (!r) { log('没有待合并的修改。'); return null; }
  log(statusLine(r.data));
  log(formatEdits(r.data, { dir, batch: r.id }));
  return r.id;
}

/** --done：清掉一个批次。返回 { cleared, kept } */
export function finishBatch(dir, id) {
  const d = readEdits(dir);
  const now = new Date().toISOString();
  if (!d.batch) {
    // 没打印过清单（旧做法）：全部清掉
    const n = d.items.length;
    const done = d.done.concat(d.items.filter(it => it.id).map(it => ({ id: it.id, at: it.at == null ? null : it.at, after: it.after }))).slice(-500);
    writeEdits(dir, { ...d, updated: now, merged: now, done, items: [] });
    return { cleared: n, kept: 0, legacy: true };
  }
  if (id && id !== d.batch.id) {
    throw new UserError(`批次号对不上：最近打印的清单是 ${d.batch.id}，这里写的是 ${id}。先运行 edits 看最新的清单。`);
  }
  const printed = d.batch.items;
  const doneNow = printed.map(it => ({ id: it.id || null, at: it.at == null ? null : it.at, after: it.after }));
  // 没有 id 的旧条目：按内容比对，一模一样的算合并了
  const sameAs = JSON.stringify;
  const plain = new Set(printed.filter(it => !it.id).map(sameAs));
  const left = applyDone(d.items.filter(it => it.id || !plain.has(sameAs(it))), doneNow.filter(x => x.id));
  const done = d.done.filter(x => !doneNow.some(y => y.id === x.id)).concat(doneNow.filter(x => x.id)).slice(-500);
  writeEdits(dir, { ...d, updated: now, merged: now, batch: null, done, items: left });
  return { cleared: d.items.length - left.length, kept: left.length };
}

// edits 命令
export async function run(args = {}, opts = {}) {
  const log = opts.log || (s => console.log(s));
  const dir = deckDir(args._ && args._[0], 'edits');
  if (args.done) {
    if (!existsSync(editsPath(dir))) { log('没有待合并的修改。'); return 0; }
    const id = args._ && args._[1] ? String(args._[1]) : (typeof args.done === 'string' ? args.done : null);
    const r = finishBatch(dir, id);
    const when = fmtTime(new Date().toISOString());
    if (r.legacy) log(r.cleared ? `已清空 ${r.cleared} 处修改，记下合并时间 ${when}。浏览器开着的话会自动刷新。` : '没有待合并的修改，记下了合并时间。');
    else log(`已清掉这一批的 ${r.cleared} 处修改，记下合并时间 ${when}。` + (r.kept ? `打印清单之后用户又改了 ${r.kept} 处，留着，运行 edits 看。` : '') + '浏览器开着的话会自动刷新。');
    return 0;
  }
  printBatch(dir, log);
  return 0;
}
