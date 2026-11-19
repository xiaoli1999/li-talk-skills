// 在线编辑的修改记录 .li-talk/edits.json：读写、摘要格式，以及 edits 命令
//   edits <课件目录>          打印用户在浏览器里做的、还没合并进源码的修改清单（每条一行，末尾是合并规则）
//   edits <课件目录> --done   合并完以后运行：清空 items，记下 merged 时间
//
// 文件格式（version 1）：
//   { version, updated, notified, merged, items: [{ page, no, path, hint, kind, position?, origin?, before, after }] }
//   - page 是页面 id（p05），no 是第几页；path 是从 .slide 往下的选择器，hint 是元素开头最多 20 个字
//   - kind：text 改文字（before/after 是 { text, html? }）、box 挪位置改大小（{ left, top, width, height }，舞台坐标）、
//     hide 隐藏（{ hidden }）
//   - position：box 的元素原来的定位方式，absolute 或 flow（在排版流里）；origin：absolute 元素的定位容器不是页面本身时，
//     容器在舞台上的左上角 { left, top }，CSS 里的 left/top 要减去它
// 浏览器那边（engine/edit.js）有一份同样格式的摘要（复制修改给 AI 时用），两边每条的写法要一致。
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { UserError } from './cli.mjs';
import { SKILL_DIR } from './paths.mjs';

export const EDITS_FILE = join('.li-talk', 'edits.json');
export const KINDS = ['text', 'box', 'hide'];
const BOX_KEYS = ['left', 'top', 'width', 'height'];

export const editsPath = dir => join(dir, EDITS_FILE);
const blank = () => ({ version: 1, updated: null, notified: null, merged: null, items: [] });

// 命令里的路径：正斜杠、加引号（和 guide 的写法一样，这里单写一份，免得引入 guide 一大串模块）
const fwd = p => String(p).replace(/\\/g, '/');
const q = p => `"${fwd(p)}"`;
export const cliLine = (...parts) => [`node ${q(join(SKILL_DIR, 'scripts', 'li-talk.mjs'))}`, ...parts].join(' ');

/** 读修改记录；没有文件或写坏了都当成空的（坏文件不抛错：浏览器下次保存时会整个重写） */
export function readEdits(dir) {
  let d = null;
  try { d = JSON.parse(readFileSync(editsPath(dir), 'utf8').replace(/^﻿/, '')); } catch { d = null; }
  if (!d || typeof d !== 'object' || Array.isArray(d)) return blank();
  return {
    version: 1,
    updated: typeof d.updated === 'string' ? d.updated : null,
    notified: typeof d.notified === 'string' ? d.notified : null,
    merged: typeof d.merged === 'string' ? d.merged : null,
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
const int = v => (Number.isFinite(+v) ? Math.round(+v) : null);

// 整理一条修改：只留认得的字段、类型对的值（浏览器发来的东西不全信）
export function cleanItem(it) {
  if (!it || typeof it !== 'object') return null;
  const kind = KINDS.includes(it.kind) ? it.kind : null;
  const page = str(it.page, 80), path = str(it.path, 600);
  if (!kind || !page || !path) return null;
  const out = { page, no: int(it.no), path, hint: str(it.hint, 80), kind };
  const side = v => {
    const o = v && typeof v === 'object' ? v : {};
    if (kind === 'text') {
      const r = { text: str(o.text, 5000) };
      if (typeof o.html === 'string') r.html = o.html.slice(0, 20000);
      return r;
    }
    if (kind === 'box') { const r = {}; for (const k of BOX_KEYS) r[k] = int(o[k]); return r; }
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
  if (out.no === null) delete out.no;
  return out;
}

/** 有没有一次没处理的通知：点过通知、通知之后没合并过、还有修改 */
export function pendingNotify(d) {
  if (!d.notified || !d.items.length) return false;
  return !d.merged || Date.parse(d.notified) > Date.parse(d.merged);
}

/* ------------------------------------------------------------------
   摘要：每条一行。engine/edit.js 的 itemLine 和这里写法一致
   ------------------------------------------------------------------ */
const tagsOf = html => (String(html || '').match(/<\s*([a-zA-Z][\w-]*)/g) || []).map(t => t.replace(/[<\s]/g, '').toLowerCase()).join(',');
const short = (t, n = 60) => { const s = String(t == null ? '' : t).replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n) + '…' : s; };

/** 一条修改写成一行（不带序号） */
export function itemLine(it) {
  const where = `第 ${it.no || '?'} 页（${it.page}）${it.path}${it.hint ? `「${short(it.hint, 40)}」` : ''}`;
  if (it.kind === 'text') {
    let s = `${where}：文字「${short(it.before.text, 80)}」→「${short(it.after.text, 80)}」`;
    if (it.after.html != null && tagsOf(it.before.html) !== tagsOf(it.after.html)) s += `；行内标签变了，改后的 HTML：${it.after.html}`;
    return s;
  }
  if (it.kind === 'hide') return `${where}：隐藏（删掉这个元素）`;
  const b = it.before, a = it.after;
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
  '- 文字：在 slides/ 的章节文件里按「」里的原文找到这一处，换成新文字（页面大标题在 Deck.add 的 title 里，截图说明在 data-caption 里）；讲稿.md 里同一句也改掉。',
  '- 位置、大小：数值是舞台坐标（1920×1080，px，含内边距）。元素本来有行内 style="left:…;top:…;width:…" 的，直接改这几个值；' +
    '没有的，在对应章节的 chN.css 里加一条 [data-id="页号"] <能定位到它的选择器>{left:…;top:…;width:…}（必要时加 position:absolute）。' +
    '在排版流里的元素，用 position:relative 加 left/top 偏移，或改所在容器的排法。文字块一般只改 width，height 只在本来就写了固定高度、或者是图片和截图时才写。不要在 JS 里加一堆行内 transform。',
  '- 隐藏：删掉这个元素，后面的拍号顺移，notes 里对应的讲词一起调整。',
  '- 自检报了溢出、被挡住：先自己调，调不了就告诉用户。',
];

/** 整份清单；opts.dir 有值时末尾写上接下来要运行的命令 */
export function formatEdits(d, opts = {}) {
  if (!d.items.length) return '没有待合并的修改。';
  const out = [`用户在浏览器里改了 ${d.items.length} 处（${perPage(d.items)}）：`];
  d.items.forEach((it, i) => out.push(`  ${i + 1}. ${itemLine(it)}`));
  out.push(...RULES);
  if (opts.dir) {
    out.push('改完以后：', `  ${cliLine('check', q(opts.dir), '--browser')}    （清零为止）`,
      `  ${cliLine('edits', q(opts.dir), '--done')}    （清掉这份清单；浏览器会自动刷新）`,
      '  在线编辑还开着的话，再后台运行一次 wait，等用户下一次点「通知 AI 修改」：',
      `  ${cliLine('wait', q(opts.dir))}`);
  }
  return out.join('\n');
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

// edits 命令
export async function run(args = {}, opts = {}) {
  const log = opts.log || (s => console.log(s));
  const dir = deckDir(args._ && args._[0], 'edits');
  const d = readEdits(dir);
  if (args.done) {
    if (!d.items.length && !existsSync(editsPath(dir))) { log('没有待合并的修改。'); return 0; }
    const n = d.items.length;
    const now = new Date().toISOString();
    writeEdits(dir, { ...d, updated: now, merged: now, items: [] });
    log(n ? `已清空 ${n} 处修改，记下合并时间 ${fmtTime(now)}。浏览器开着的话会自动刷新。` : '没有待合并的修改，记下了合并时间。');
    return 0;
  }
  if (!d.items.length) { log('没有待合并的修改。'); return 0; }
  log(statusLine(d));
  log(formatEdits(d, { dir }));
  return 0;
}
