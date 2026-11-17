// materials 命令：列素材清单，生成截图说明表
//   materials <素材目录>
// 文字（.md .txt 数字数；Word、PDF 这类提示导出成文字）、图片（宽高）、视频（大小），子目录也算。
// 有图片、目录里还没有 截图说明.md 时生成它：每张图一行，「这是什么」「放在讲哪块的时候用」两栏留空，
// 能看图的 AI 自己看图填，看不了图的请用户每张填一句——这样看不了图的模型也知道每张图该放哪。
// 截图说明.md 已经有了就不动它，只列出还没写进表里的图。
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { UserError } from './cli.mjs';
import { imageSize } from './imagesize.mjs';
import { cli, posix, quote, textCount } from './guide.mjs';

// 字数统计和 guide 共用一份（guide 也要数讲词的字数）
export { textCount };

export const NOTE_FILE = '截图说明.md';

const TEXT = new Set(['.md', '.markdown', '.txt']);
const OFFICE = new Set(['.docx', '.doc', '.pdf', '.pptx', '.ppt', '.xlsx', '.xls', '.rtf', '.wps', '.pages', '.key', '.numbers']);
const IMAGE = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp']);
const IMAGE_VECTOR = new Set(['.svg']);
const IMAGE_BAD = new Set(['.heic', '.heif', '.tif', '.tiff', '.bmp', '.psd']);   // 浏览器显示不了或不一定显示
const VIDEO = new Set(['.mp4', '.webm', '.m4v', '.ogv']);
const VIDEO_BAD = new Set(['.mov', '.avi', '.mkv', '.wmv', '.flv', '.3gp']);      // 浏览器不一定放得了
const JUNK = new Set(['thumbs.db', 'desktop.ini', 'node_modules']);

const size = n => (n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);

// 递归列出文件（相对路径、正斜杠），跳过 . 开头的、系统杂项和根目录下的截图说明.md；按名字排好
function listFiles(root) {
  const out = [];
  const visit = (abs, rel) => {
    let names;
    try { names = readdirSync(abs); } catch (e) { return; }
    for (const name of names) {
      if (name.startsWith('.') || JUNK.has(name.toLowerCase())) continue;
      if (!rel && name === NOTE_FILE) continue;
      const p = join(abs, name);
      const r = rel ? rel + '/' + name : name;
      let st;
      try { st = statSync(p); } catch (e) { continue; }
      if (st.isDirectory()) visit(p, r);
      else if (st.isFile()) out.push({ rel: r, abs: p, bytes: st.size });
    }
  };
  visit(root, '');
  return out.sort((a, b) => a.rel.localeCompare(b.rel, 'zh-CN'));
}

/**
 * 看一遍素材目录。返回 { texts, images, videos, others }，每项是 { rel, abs, bytes, note, ... }：
 *   texts:  { chars（数得出时）, readable（false 表示 AI 可能读不了）, note }
 *   images: { w, h（读得出时）, note }
 */
export function scanMaterials(dir) {
  const r = { texts: [], images: [], videos: [], others: [] };
  for (const f of listFiles(dir)) {
    const ext = extname(f.rel).toLowerCase();
    if (TEXT.has(ext)) {
      const buf = readFileSync(f.abs);
      const text = buf.toString('utf8').replace(/^﻿/, '');
      const chars = textCount(text);
      const bad = text.includes('�');
      r.texts.push({ ...f, chars, readable: !bad,
        note: `约 ${chars} 字` + (bad ? '；不是 UTF-8 编码（可能是 GBK），AI 读出来可能是乱码，请另存为 UTF-8' : '') });
    } else if (OFFICE.has(ext)) {
      r.texts.push({ ...f, readable: false, note: `${size(f.bytes)}；AI 可能读不了，请导出成文字（.md 或 .txt）放进来` });
    } else if (IMAGE.has(ext)) {
      const dim = imageSize(readFileSync(f.abs));
      r.images.push(dim
        ? { ...f, w: dim.w, h: dim.h, dim: `${dim.w}×${dim.h}`, note: `${dim.w}×${dim.h}，${size(f.bytes)}` }
        : { ...f, dim: '读不出', note: `读不出尺寸（文件可能坏了，或者扩展名和实际格式不符），${size(f.bytes)}` });
    } else if (IMAGE_VECTOR.has(ext)) {
      r.images.push({ ...f, dim: '矢量图', note: `矢量图，没有固定尺寸，${size(f.bytes)}` });
    } else if (IMAGE_BAD.has(ext)) {
      r.images.push({ ...f, dim: '要转格式', note: `${size(f.bytes)}；浏览器显示不了，请转成 PNG 或 JPG` });
    } else if (VIDEO.has(ext)) {
      r.videos.push({ ...f, note: size(f.bytes) });
    } else if (VIDEO_BAD.has(ext)) {
      r.videos.push({ ...f, note: `${size(f.bytes)}；浏览器不一定放得了，建议转成 mp4（H.264 编码）` });
    } else {
      r.others.push({ ...f, note: size(f.bytes) });
    }
  }
  return r;
}

const cell = s => String(s).replace(/\|/g, '\\|');

// 截图说明表的内容
function noteText(images) {
  return [
    '# 截图说明',
    '',
    '每张图写一句：这是什么、放在讲哪块的时候用。能看图的 AI 自己看图填；看不了图的，请讲者每张填一句。',
    '写讲稿时「画面」一段要用截图，就写这里的文件名。',
    '这张表是给写讲稿的 AI 看的，不投到屏幕上。截图下面要显示一行说明，在讲稿「屏幕」里写「图注：……」，页面上放进截图的 data-caption；不要把「截图说明：」写成屏幕上的一行字。',
    '',
    '注意：课件里的截图点开显示的是原图。页面上只露出一部分时，原图里的敏感信息（账号、手机号、内部地址等）也会被看到，用之前先打码或裁掉。',
    '',
    '| 文件 | 尺寸 | 这是什么 | 放在讲哪块的时候用 |',
    '|---|---|---|---|',
    ...images.map(i => `| ${cell(i.rel)} | ${cell(i.dim)} |  |  |`),
    '',
  ].join('\n');
}

// 已有的截图说明表里，「这是什么」一栏还空着的图
function unfilled(md, images) {
  const out = [];
  for (const line of md.split(/\r?\n/)) {
    const cells = line.split(/(?<!\\)\|/).map(s => s.trim());
    if (cells.length < 5) continue;
    const name = cells[1].replace(/\\\|/g, '|');
    if (images.some(i => i.rel === name) && !cells[3]) out.push(name);
  }
  return out;
}

// 素材目录是不是在课件目录里：叫 素材、或上一级有 讲稿.md / .li-talk.json
function deckOf(dir) {
  const parent = dirname(dir);
  if (parent === dir) return null;
  if (basename(dir) === '素材' || existsSync(join(parent, '讲稿.md')) || existsSync(join(parent, '.li-talk.json'))) return parent;
  return null;
}

export async function run(args = {}, opts = {}) {
  const log = opts.log || (s => console.log(s));
  const target = args._ && args._[0];
  if (!target) throw new UserError('materials 后面要写素材目录，比如：materials ./我的分享/素材');
  const dir = resolve(String(target));
  if (!existsSync(dir)) throw new UserError(`找不到素材目录：${dir}。请确认路径写对了。`);
  if (!statSync(dir).isDirectory()) throw new UserError(`${dir} 是一个文件，不是目录。materials 后面写放素材的目录。`);

  const r = scanMaterials(dir);
  const total = r.texts.length + r.images.length + r.videos.length + r.others.length;
  const deck = deckOf(dir);
  const out = [];
  out.push(`素材清单：${posix(dir)}（共 ${total} 个文件）`);
  if (!total) {
    out.push('', '这个目录里还没有素材。把笔记、截图、文档放进来，再运行一次 materials。');
    log(out.join('\n'));
    return 0;
  }
  const group = (name, list) => {
    if (!list.length) return;
    out.push('', `${name}（${list.length} 个）`);
    for (const f of list) out.push(`  ${f.rel}：${f.note}`);
  };
  group('文字', r.texts);
  const sum = r.texts.reduce((a, t) => a + (t.chars || 0), 0);
  if (r.texts.some(t => t.chars != null)) out.push(`  （能读的文字合计约 ${sum} 字）`);
  group('图片', r.images);
  group('视频', r.videos);
  group('其他', r.others);
  if (r.others.length) out.push('  （其他文件用不上可以不管）');

  // 截图说明表
  const shots = r.images;
  const note = join(dir, NOTE_FILE);
  if (shots.length) {
    out.push('');
    if (!existsSync(note)) {
      writeFileSync(note, noteText(shots));
      out.push(`已生成截图说明表：${posix(note)}`);
      out.push('  能看图的话自己逐张看图，在「这是什么」「放在讲哪块的时候用」两栏各写一句；看不了图就把这张表发给用户，请他每张填一句。');
    } else {
      const md = readFileSync(note, 'utf8');
      const missing = shots.filter(i => !md.includes(i.rel));
      const empty = unfilled(md, shots);
      out.push(`${NOTE_FILE} 已经有了，没有改动。`);
      if (missing.length) out.push(`  这些图还不在表里，照表里的格式各加一行：${missing.map(i => `${i.rel}（${i.dim}）`).join('、')}`);
      if (empty.length) out.push(`  这些图还没写「这是什么」：${empty.join('、')}`);
      if (!missing.length && !empty.length) out.push('  表里每张图都有说明了。');
    }
    out.push('提醒用户：课件里的截图点开显示的是原图。页面上只露出一部分时，原图里的敏感信息（账号、手机号、内部地址等）也会被看到，用之前先打码或裁掉。');
  }

  // 下一步
  out.push('', '下一步：');
  let n = 0;
  out.push(`  ${++n}. 读完上面的文字材料${r.texts.some(t => !t.readable) ? '；标了「AI 可能读不了」或「乱码」的，请用户导出或另存成 UTF-8 文字再放进来' : ''}。`);
  if (shots.length) out.push(`  ${++n}. 把截图说明表填好（见上面）。`);
  if (deck) {
    out.push(`  ${++n}. 运行 guide 看接下来做什么：`);
    out.push(`     ${cli('guide', quote(deck))}`);
  } else {
    out.push(`  ${++n}. 这些材料不在课件目录里：页面里要用的图，记得复制到课件目录的 素材/ 下。然后对课件目录运行 guide：`);
    out.push(`     ${cli('guide', '"〈课件目录〉"')}`);
  }
  log(out.join('\n'));
  return 0;
}
