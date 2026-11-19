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
const BOX_KEYS = ['left', 'top', 'width', 'height'];
const STYLE_KEYS = ['fontSize', 'color', 'fontWeight', 'textAlign'];

export const editsPath = dir => join(dir, EDITS_FILE);
const blank = () => ({ version: 1, updated: null, notified: null, merged: null, batch: null, done: [], items: [] });

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
  if (it.kind === 'scale') return `${where}：整块缩放 ${Math.round(b.scale * 100)}%→${Math.round(a.scale * 100)}%（原点 ${a.origin === 'top left' ? '左上角 top left' : '中心 center'}）`;
  if (it.kind === 'style') {
    const parts = STYLE_KEYS.filter(k => b[k] !== a[k]).map(k => `${STYLE_NAMES[k]} ${b[k]}→${a[k]}`);
    return `${where}：样式 ${parts.join('、') || '没有变化'}`;
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
  return s;
}

// 按页数一数：「第 2 页 2 处、第 5 页 1 处」
function perPage(items) {
  const m = new Map();
  for (const it of items) { const k = it.no || it.page; m.set(k, (m.get(k) || 0) + 1); }
  return [...m].map(([k, n]) => (typeof k === 'number' ? `第 ${k} 页 ${n} 处` : `${k} ${n} 处`)).join('、');
}

/** 合并规则（edits、wait 的末尾，SKILL.md 的「在线编辑」一节写的是同一套） */
export const RULES = [
  '合并规则：',
  '- 找元素：路径从页面根往下写，:nth-of-type(n) 按 Deck.add 的 html 里的兄弟数，用来在源码里找到它，「」里是它开头的字。写 CSS 时不要照抄 nth-of-type（页面上引擎会多加元素，数出来对不上），给元素加一个类名（比如 p05-tip）再用它定位。',
  '- 文字：在 slides/ 的章节文件里按「」里的原文找到这一处，换成新文字（页面大标题在 Deck.add 的 title 里，截图说明在 data-caption 里）；讲稿.md 里同一句也改掉。' +
    '写了「改后的 HTML」的照那段换：<em class="key">…</em> 是用户设的重点词（标题里的重点词写进 titleHtml，title 照样写纯文字）。',
  '- 位置、大小：数值是舞台坐标（1920×1080，px，含内边距）。元素本来有行内 style="left:…;top:…;width:…" 的，直接改这几个值；' +
    '没有的，在对应章节的 chN.css 里加一条 [data-id="页号"] <能定位到它的选择器>{left:…;top:…;width:…}（必要时加 position:absolute）。' +
    '在排版流里的元素，用 position:relative 加 left/top 偏移，或改所在容器的排法。文字块一般只改 width，height 只在本来就写了固定高度、或者是图片和截图时才写。不要在 JS 里加一堆行内 transform。',
  '- 隐藏：删掉这个元素，后面的拍号顺移，notes 里对应的讲词一起调整。',
  '- 整块缩放：文字、图片、间距一起等比放大缩小。在源码里给这一块加个类名（比如 p05-shot），在章节 chN.css 里写 [data-id="页号"] .p05-shot{scale:1.2;transform-origin:center}' +
    '（原点是左上角的写 top left），不改原来的宽高和字号，也不要写 transform（会和出场动画打架）。',
  '- 样式：优先换成已有的类名——字号 var(--fs-xl) 用 t-xl、var(--fs-lg) 用 t-lg、var(--fs-md) 用 t-md、var(--fs-min) 用 t-sm，粗细 700 用 b，' +
    '居中用 center，颜色 var(--ink-2) 用 muted；没有对应类名的，在章节 chN.css 里加 [data-id="页号"] 选择器{font-size:…;color:var(--…)}，颜色写变量不写死。' +
    '字号是 px 数字（64px）的：能对上风格档位变量的写变量（engine.css 默认 --fs-xl 84、--fs-title 68、--fs-lg 50、--fs-md 42、--fs-body 36、--fs-min 34，风格改过的以风格 css 为准），对不上的照写 px。不要堆行内 style。',
  '- 拍号：改这个元素的 data-beat（本来没写的就加上）；同一个元素上的 data-mascot 拍号一起改；notes 里对应拍的讲词跟着挪。改完拍数超出范围的话，check 会提醒，照提醒调。',
  '- 讲词：页面 notes 里对应拍的 say 和 讲稿.md 里这一页对应拍的讲词一起改成新的。',
  '- 自检报了溢出、被挡住：先自己调，调不了就告诉用户。',
];

/** 清单末尾的提醒：文案先原样合并，再给建议（engine/edit.js 的 COPY_TIP 同一句） */
export const COPY_TIP = '这一批里有文字或讲词改动的：先照用户改的原样合并；跑完自检、清掉批次以后，再逐条看这些文案，给用户优化建议（原文、用户改的、建议改成什么、为什么：更口语、更短、后排看得清、像误输入、和讲词对不上……），问用户采纳哪几条，用户没说就不动。';

/** 整份清单；opts.dir 有值时末尾写上接下来要运行的命令；opts.batch 是批次号 */
export function formatEdits(d, opts = {}) {
  if (!d.items.length) return '没有待合并的修改。';
  const out = [`用户在浏览器里改了 ${d.items.length} 处（${perPage(d.items)}）${opts.batch ? `，批次 ${opts.batch}` : ''}：`];
  d.items.forEach((it, i) => out.push(`  ${i + 1}. ${itemLine(it)}`));
  out.push(...RULES);
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
