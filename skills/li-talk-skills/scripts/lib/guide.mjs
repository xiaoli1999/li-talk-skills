// guide 命令：看课件目录的实际状态，告诉 AI 现在在哪一步、下一步做什么、该问用户什么
//   guide [课件目录]        不写目录就看当前目录
//
// 进度全部从文件推断（讲稿.md、.li-talk.json、engine/、slides/、.li-talk/selftest.json），
// 所以中途换对话、换模型也能接着做。阶段按顺序找第一个没完成的：
//   ① 起点     目录不存在，或者既没有 讲稿.md 也没有 .li-talk.json
//   ② 提纲     confirmed.outline 不为 true
//   ③ 讲稿     confirmed.script 不为 true
//   ④ 风格     confirmed.style 不为 true
//   ⑤ 搭骨架   没有 engine/ 或没有 index.html
//   ⑥ 先做 3 页 confirmed.trial 不为 true（页数不够 3 → 写；自检没跑、过期或有错 → 跑 check --browser；都好了 → 给用户看）
//   ⑦ 写全稿   章节运行出错、页数少于讲稿里「## 第 N 页」的个数，或者自检没跑、过期、有错
//   ⑧ 过稿     confirmed.review 不为 true
//   ⑨ 完成
//
// 输出固定四块：【现在在哪一步】【下一步做什么】【问用户】【可以这样对 AI 说】。
// 较弱的模型会照着一步步做，所以：命令写全（skill 和课件都用绝对路径、正斜杠，各种终端都认），
// 问题带编号选项、推荐项放第一个并标（推荐…），每个问题最多 4 个选项（Claude Code 的提问卡片最多放 4 个）。
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { UserError } from './cli.mjs';
import { SKILL_DIR, TPL_DIR, VERSION } from './paths.mjs';
import { metaPath, readMeta, STEPS, STEP_NAMES } from './meta.mjs';
import { collectPages, readDeck, scriptPageHeads } from './deck.mjs';
import { mascotList, sceneIndex } from './new.mjs';
import { cacheDir, loadManifest } from './fonts.mjs';

/* ------------------------------------------------------------------
   公用的小工具（materials、styles 也用）
   ------------------------------------------------------------------ */

/** 路径换成正斜杠：Windows 的 PowerShell、cmd、Git Bash 和 macOS、Linux 的终端都认 */
export function posix(p) { return String(p).replace(/\\/g, '/'); }
/** 加双引号的路径，放进命令里 */
export function quote(p) { return `"${posix(p)}"`; }
/** 一条完整的命令：node "<skill 目录>/scripts/li-talk.mjs" 参数… */
export function cli(...parts) { return [`node ${quote(join(SKILL_DIR, 'scripts', 'li-talk.mjs'))}`, ...parts].join(' '); }
/** 字数：中文按字、英文和数字按词（和常见的字数统计一样，标点不算） */
export function textCount(s) {
  const han = (String(s).match(/[㐀-䶿一-鿿豈-﫿]/g) || []).length;
  const words = (String(s).match(/[A-Za-z0-9]+(?:['’.-][A-Za-z0-9]+)*/g) || []).length;
  return han + words;
}

const refDoc = name => posix(join(SKILL_DIR, 'references', name));

export const STAGES = ['起点', '提纲', '讲稿', '风格', '搭骨架', '先做 3 页', '写全稿', '过稿', '完成'];
const MARK = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'];
const SCRIPT = '讲稿.md';
const NOTE = '截图说明.md';
// 搭骨架前课件目录里允许已有的东西，和 new 的规矩一致（. 开头的一律放过）
const ALLOWED = new Set([SCRIPT, '素材', '.li-talk.json', '.li-talk']);
const OS_JUNK = new Set(['thumbs.db', 'desktop.ini']);
const IMG_RE = /\.(png|jpe?g|gif|webp|svg|heic|heif|bmp|tiff?)$/i;

/* ------------------------------------------------------------------
   读状态
   ------------------------------------------------------------------ */

/**
 * 读讲稿：{ title（第一个一级标题）, pages: [{ no, title }], sayChars（讲词字数）, hasOutline, talk, planned }；没有讲稿.md 返回 null
 * 页数靠「## 第 N 页 页标题」这样的二级标题来数。
 * talk：「## 给组织方」里写的讲多久 { lo, hi }（分钟），读不出是 null；planned：那一节「合计：约 N 页」的 N，没写是 null
 */
export function readScript(dir) {
  const file = join(dir, SCRIPT);
  if (!existsSync(file)) return null;
  let text;
  try { text = readFileSync(file, 'utf8').replace(/^﻿/, ''); } catch (e) { return null; }
  const h1 = /^#[ \t]+(.+?)[ \t#]*$/m.exec(text);
  const heads = scriptPageHeads(text);
  const pages = heads.map(h => ({ no: h.no, title: h.title }));
  let sayChars = 0;
  heads.forEach((h, i) => {
    const body = text.slice(h.index, i + 1 < heads.length ? heads[i + 1].index : text.length);
    const k = body.indexOf('**讲词**');
    if (k >= 0) sayChars += textCount(body.slice(k + 6).replace(/【第\s*\d+\s*拍】/g, ''));
  });
  const hasOutline = /^#{1,3}[ \t]*(给组织方|提纲|大纲)/m.test(text) || /^[-*]?[ \t]*大纲[:：]/m.test(text);
  const total = /合计[：:][ \t]*约?[ \t]*(\d+)[ \t]*页/.exec(organizerSection(text));
  return { title: h1 ? h1[1].trim() : '', pages, sayChars, hasOutline, talk: talkMinutes(text), planned: total ? Number(total[1]) : null };
}

// 讲稿开头「## 给组织方」这一节的正文（到下一个一级、二级标题为止）；没有这一节返回空串
export function organizerSection(text) {
  const m = /^##[ \t]*给组织方[^\n]*\n([\s\S]*?)(?=^#{1,2}[ \t]|(?![\s\S]))/m.exec(String(text));
  return m ? m[1] : '';
}

// 一到九十九的中文数字（「五分钟」「二十分钟」「两小时」）；认不出返回 NaN
function cnNumber(s) {
  const d = { 零: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  const m = /^([一二两三四五六七八九])?(十)?([一二三四五六七八九])?$/.exec(s);
  if (!m || !s) return NaN;
  if (!m[2]) return m[3] ? NaN : d[m[1]];
  return (m[1] ? d[m[1]] : 1) * 10 + (m[3] ? d[m[3]] : 0);
}

/**
 * 从「## 给组织方」里读讲多久，返回 { lo, hi }（分钟），读不出返回 null。
 * 先看写着「时长」的那一行，没有就看写着「时间」的，再没有就看整节。
 * 「40 分钟（讲 35 分钟）」取讲的那个数；「15～20 分钟」是一个范围；「1 小时」「半小时」也认。
 */
export function talkMinutes(text) {
  const sec = organizerSection(text);
  if (!sec) return null;
  const lines = sec.split('\n');
  const line = lines.find(l => /时长/.test(l)) || lines.find(l => /时间/.test(l)) || sec;
  const num = '(\\d+(?:\\.\\d+)?|[一二两三四五六七八九十]{1,3})';
  const re = new RegExp(`${num}(?:\\s*[~～\\-–—到至]\\s*${num})?\\s*(?:个)?\\s*(分钟|小时)`, 'g');
  const toNum = s => (/\d/.test(s) ? Number(s) : cnNumber(s));
  const found = [];
  let m;
  while ((m = re.exec(line))) {
    const k = m[3] === '小时' ? 60 : 1;
    const lo = toNum(m[1]) * k;
    const hi = (m[2] ? toNum(m[2]) : toNum(m[1])) * k;
    // 前面紧挨着「讲」（可以隔「约」「大约」这类一两个字）的，就是讲的时长
    const said = /讲[^\d\n，,；;。）)]{0,3}$/.test(line.slice(Math.max(0, m.index - 4), m.index));
    if (lo > 0 && hi >= lo) found.push({ lo, hi, said });
  }
  if (!found.length && /半(?:个)?小时/.test(line)) return { lo: 30, hi: 30 };
  const pick = found.find(f => f.said) || found[0];
  return pick ? { lo: pick.lo, hi: pick.hi } : null;
}

// 按讲多久算讲词的目标字数（每分钟 220–250 字）
export function targetChars(talk) {
  return talk ? { lo: Math.round(talk.lo * 220), hi: Math.round(talk.hi * 250) } : null;
}

// 目录里 new 不允许的东西（搭骨架前只能有 讲稿.md、素材/）
function foreignFiles(dir) {
  try {
    return readdirSync(dir).filter(n => {
      const k = n.normalize('NFC');
      return !k.startsWith('.') && !ALLOWED.has(k) && !OS_JUNK.has(k.toLowerCase());
    });
  } catch (e) { return []; }
}

// 素材/ 里有几个文件、几张图，有没有截图说明表
function materialsOf(dir) {
  const root = join(dir, '素材');
  const r = { files: 0, images: 0, note: existsSync(join(root, NOTE)) };
  const visit = abs => {
    let names;
    try { names = readdirSync(abs); } catch (e) { return; }
    for (const n of names) {
      if (n.startsWith('.') || OS_JUNK.has(n.toLowerCase()) || (abs === root && n === NOTE)) continue;
      const p = join(abs, n);
      let st;
      try { st = statSync(p); } catch (e) { continue; }
      if (st.isDirectory()) visit(p);
      else { r.files++; if (IMG_RE.test(n)) r.images++; }
    }
  };
  visit(root);
  return r;
}

// 下一级目录里已有的课件（有 .li-talk.json 的）
function decksUnder(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter(e => e.isDirectory() && !e.name.startsWith('.') && existsSync(join(dir, e.name, '.li-talk.json')))
      .map(e => join(dir, e.name)).sort().slice(0, 5);
  } catch (e) { return []; }
}

const pad2 = n => String(n).padStart(2, '0');
function fmtTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '时间不明';
  return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/**
 * 上次自检的情况：{ kind: 'none' | 'stale' | 'errors' | 'ok', text }
 * 过期：slides 下最新的修改时间比自检时记的新，或者 index.html 在自检之后改过（比如加了一章）。
 */
function selftestState(dir, deck) {
  let rec = null;
  try { rec = JSON.parse(readFileSync(join(dir, '.li-talk', 'selftest.json'), 'utf8')); } catch (e) { rec = null; }
  if (!rec || typeof rec.slidesMtime !== 'number' || typeof rec.errors !== 'number') {
    return { kind: 'none', text: '还没跑过后台自检' };
  }
  const when = fmtTime(rec.at);
  const atMs = Date.parse(rec.at);
  let indexMs = 0;
  try { indexMs = statSync(join(dir, 'index.html')).mtimeMs; } catch (e) { indexMs = 0; }
  // 自检记录的时间是跑完时记的，给 1 秒余量，免得同一时刻写的文件被误判
  if (deck.slidesMtime > rec.slidesMtime || (atMs && indexMs - atMs > 1000)) {
    return { kind: 'stale', text: `上次自检（${when}）之后页面又改过了` };
  }
  const warn = Number(rec.warnings) || 0;
  if (rec.errors > 0) return { kind: 'errors', text: `上次自检（${when}）还有 ${rec.errors} 个错误${warn ? `、${warn} 个提醒` : ''}` };
  return { kind: 'ok', text: `上次自检（${when}）0 个错误${warn ? `，${warn} 个提醒` : ''}` };
}

/**
 * 看课件目录做到哪一步。返回状态对象，stage 是 1–9（见文件开头）。
 * 目录是个文件、进度文件写坏了时抛 UserError。
 */
export function inspect(target) {
  const dir = resolve(String(target || '.'));
  const s = { dir, given: !!target, stage: 1 };
  s.exists = existsSync(dir);
  if (s.exists && !statSync(dir).isDirectory()) {
    throw new UserError(`${dir} 是一个文件，不是目录。guide 后面写课件目录（放 讲稿.md 的那个目录）。`);
  }
  s.hasMeta = s.exists && existsSync(metaPath(dir));
  s.meta = readMeta(dir);
  s.script = s.exists ? readScript(dir) : null;
  s.materials = s.exists ? materialsOf(dir) : { files: 0, images: 0, note: false };
  s.engine = s.exists && existsSync(join(dir, 'engine'));
  s.index = s.exists && existsSync(join(dir, 'index.html'));
  if (!s.exists || (!s.script && !s.hasMeta)) return s;

  const c = s.meta.confirmed;
  if (!c.outline) return { ...s, stage: 2 };
  if (!c.script) return { ...s, stage: 3 };
  if (!c.style) return { ...s, stage: 4 };
  if (!s.engine || !s.index) return { ...s, stage: 5 };

  // 搭好骨架以后：数页面、看自检
  try {
    const deck = readDeck(dir);
    const r = collectPages(deck);
    s.pages = r.pages;
    s.failures = r.failures;
    s.st = selftestState(dir, deck);
  } catch (e) {
    s.pages = [];
    s.failures = [{ file: 'index.html', message: (e && (e.userMessage || e.message)) || String(e) }];
    s.st = { kind: 'none', text: '还没跑过后台自检' };
  }
  if (!c.trial) return { ...s, stage: 6 };
  const want = s.script ? s.script.pages.length : 0;
  if (s.failures.length || s.pages.length < want || s.st.kind !== 'ok') return { ...s, stage: 7 };
  if (!c.review) return { ...s, stage: 8 };
  return { ...s, stage: 9 };
}

/* ------------------------------------------------------------------
   排版
   ------------------------------------------------------------------ */

const ASK_HOW = '有选项卡片（比如 Claude Code 的提问卡片）就用卡片，一次问一个，推荐项放第一个；' +
  '没有卡片就把问题和编号选项原样发给用户，请用户回一个数字或直接说。';

/**
 * body: { where: [行], steps: [文字 | [文字, 接着的行…]], asks: [{ q, opts: [], when }], noAsk, say }
 * 接着的行（命令、格式样例）单独成行、缩进对齐，方便原样复制。
 */
function render(stage, body) {
  const out = [`【现在在哪一步】${MARK[stage - 1]} ${STAGES[stage - 1]}（共 9 步）`];
  for (const l of body.where) out.push('  ' + l);
  out.push('【下一步做什么】');
  body.steps.forEach((st, i) => {
    const [first, ...rest] = Array.isArray(st) ? st : [st];
    out.push(`  ${i + 1}. ${first}`);
    for (const l of rest) out.push('     ' + l);
  });
  const asks = body.asks || [];
  out.push('【问用户】' + (asks.length ? ASK_HOW : body.noAsk || '这一步不用问用户，直接做。'));
  asks.forEach((a, i) => {
    if (a.when) out.push(`  （${a.when}）`);
    out.push(`  问题 ${i + 1}：${a.q}`);
    a.opts.forEach((o, j) => out.push(`    ${j + 1}. ${o}`));
  });
  out.push(`【可以这样对 AI 说】「${body.say}」`);
  return out.join('\n');
}

// 已确认 / 还没确认的环节
function progress(meta) {
  const yes = STEPS.filter(k => meta.confirmed[k]).map(k => STEP_NAMES[k]);
  const no = STEPS.filter(k => !meta.confirmed[k]).map(k => STEP_NAMES[k]);
  return `已确认：${yes.join('、') || '还没有'}；还没确认：${no.join('、') || '没有了'}`;
}

const guideStep = dir => ['做完这一步，再运行 guide 看下一步：', cli('guide', quote(dir))];

// 讲词字数换算成时长（每分钟 220–250 字）；10 分钟以内按半分钟取整，再长按整分钟（和 check 一样）
function minutes(chars) {
  const hi = chars / 220;
  if (hi < 1) return '不到 1 分钟';
  const f = x => (x >= 10 ? String(Math.round(x)) : String(Math.round(x * 2) / 2));
  const a = f(Math.max(chars / 250, 0.5));
  const b = f(hi);
  return a === b ? `${a} 分钟` : `${a}～${b} 分钟`;
}

// 深色底的风格：风格说明 index.json 里写了 dark: true，或风格文件 Deck.scene 里写了 dark: true；
// 黑板（board）、蓝图（blueprint）、现代家的科技暗黑（dark）、像素家的像素游戏（pixel）就算文件读不到也当深色
function isDarkScene(s) {
  if (s.dark === true || s.key === 'board' || s.key === 'blueprint' || (s.key === 'dark' && s.family === 'modern') || (s.key === 'pixel' && s.family === 'pixel')) return true;
  try { return /\bdark\s*:\s*true\b/.test(readFileSync(join(TPL_DIR, 'scenes', s.key + '.js'), 'utf8')); } catch (e) { return false; }
}

// 机器读到的风格、形象说明（读不到时给空的，不让 guide 因为模板问题整个报错）
function sceneInfo() {
  let index = [];
  let mascots = [];
  try { index = sceneIndex(TPL_DIR); } catch (e) { index = []; }
  try { mascots = mascotList(TPL_DIR); } catch (e) { mascots = []; }
  const ready = index.filter(s => existsSync(join(TPL_DIR, 'scenes', s.key + '.js')))
    .map(s => ({ ...s, dark: isDarkScene(s) }));
  const label = k => { const x = index.find(s => s.key === k); return x ? `${x.label}（${k}）` : k; };
  const mascot = k => { const x = mascots.find(m => m.key === k); return x ? `${x.label}（${k}）` : k; };
  return { index, ready, label, mascot };
}

// 本机的字体缓存是否齐全（只看文件在不在，不校验，很快）
function fontState() {
  try {
    const m = loadManifest();
    const dir = cacheDir(m);
    const missing = m.files.filter(f => !existsSync(join(dir, f.path.split('/').pop()))).length;
    const mb = (m.files.reduce((a, f) => a + f.size, 0) / 1024 / 1024).toFixed(1);
    return missing
      ? { ok: false, mb, text: `本机还没有霞鹜文楷完整字体（约 ${mb} MB），搭骨架时会自动下载，下载不了先用自带的常用字小字库` }
      : { ok: true, mb, text: '霞鹜文楷完整字体已在本机' };
  } catch (e) {
    return { ok: false, mb: '?', text: '读不到字体清单，搭骨架时先用自带的常用字小字库' };
  }
}

function envLine() {
  const parts = [`Node ${process.versions.node} 可以用`];
  parts.push(VERSION ? `li-talk-skills ${VERSION}` : 'skill 没装完整（缺 version.txt），请先重新安装');
  parts.push(fontState().text);
  return '环境：' + parts.join('；');
}

/* ------------------------------------------------------------------
   各阶段
   ------------------------------------------------------------------ */

// ① 起点
function stageStart(s) {
  const foreign = s.exists ? foreignFiles(s.dir) : [];
  const decks = s.exists ? decksUnder(s.dir) : [];
  // 目录里已经有别的文件：课件要单独一个目录，在里面另起一个没被占用的名字
  let dir = s.dir;
  if (foreign.length) {
    const names = ['我的分享', '我的分享-2', '我的分享-3', '我的分享-4', '我的分享-5'];
    dir = join(s.dir, names.find(n => !existsSync(join(s.dir, n))) || '我的分享-' + Date.now());
  }
  const mat = dir === s.dir ? s.materials : { files: 0, images: 0, note: false };
  const shown = list => list.slice(0, 5).join('、') + (list.length > 5 ? ` 等 ${list.length} 项` : '');

  const where = [`课件目录：${posix(dir)}${existsSync(dir) ? '（已经有了，里面还没有 讲稿.md）' : '（还没建）'}`];
  if (foreign.length) where.push(`${posix(s.dir)} 里已经有别的东西（${shown(foreign.map(n => n.normalize('NFC')))}），课件要单独放一个目录，所以用上面这个子目录（名字可以换成主题）`);
  if (decks.length) where.push(`这里已经有课件：${decks.map(d => basename(d)).join('、')}`);
  if (mat.files) where.push(`素材/ 里已经有 ${mat.files} 个文件`);
  where.push(envLine());

  const steps = [];
  if (decks.length) {
    steps.push(['用户要接着做以前的课件，就对那个目录运行 guide，不用从头来：', ...decks.map(d => cli('guide', quote(d)))]);
  }
  const askDir = !s.given || foreign.length > 0;
  steps.push(`先问用户手上有什么（问题 1）${askDir ? '，再确认课件放在哪（问题 2）' : ''}。`);
  steps.push([`建好课件目录和里面的 素材 子目录，再写讲稿文件（第一行写「# 〈主题〉」，主题用用户的话；还不清楚就先写「# 我的分享」）：`,
    `${posix(dir)}/讲稿.md`]);
  steps.push(['按用户的回答做：',
    '选「只有一个主题」：讲稿.md 先只写标题，下一步一问一答问场合、起提纲。',
    `选「有想法、笔记或截图」：问清材料在哪，复制进 ${posix(dir)}/素材/（原文件别动、别删），然后运行：`,
    `  ${cli('materials', quote(join(dir, '素材')))}`,
    '  读完它列出的文字材料。在线文档、链接也算素材；AI 读不了的格式（Word、PDF 等），请用户导出成文字。',
    `选「已经有讲稿了」：把讲稿内容放进 ${posix(dir)}/讲稿.md（原文件别动）；Word、PDF 读不了的，请用户导出成文字或直接贴过来。`]);
  steps.push(['做完上面这些，运行 guide 进入 ② 提纲：', cli('guide', quote(dir))]);

  const have = ['只有一个主题，不知道怎么做', '有想法、笔记或截图', '已经有讲稿了'];
  const opts = mat.files
    ? [`${have[1]}（推荐：素材/ 里已经有文件了）`, have[0], have[2]]
    : [`${have[0]}（推荐：拿不准就选这个，一问一答带着做）`, have[1], have[2]];
  const asks = [{ q: '你手上现在有什么？', opts }];
  if (askDir) asks.push({ q: '课件放在哪个目录？', opts: [`${posix(dir)}（推荐）`, '换个位置或名字：直接告诉我'] });

  return render(1, {
    where, steps, asks,
    say: mat.files ? '材料都放进素材文件夹了，你先看看，缺什么再问我' : '我想做一个 20 分钟的分享，讲……；笔记和截图在桌面的「分享素材」文件夹里',
  });
}

const OUTLINE_TPL = [
  '# 〈课件标题〉',
  '## 给组织方',
  '- 一句话简介：……',
  '- 适合谁听：……',
  '- 时间与时长：……（讲多久，在什么场合、什么屏幕上讲）',
  '- 听完能带走什么：……',
  '- 大纲：',
  '  1. 〈第一部分〉（约 N 页）：这部分讲什么',
  '  2. 〈第二部分〉（约 N 页）：……',
  '- 合计：约 N 页',
];

// 讲稿、素材里能粗略认出来的场合信息（② 用）：讲多久、在哪讲。只是提示，最后由 AI 判断。
// 讲多久只认带「大概」「约」「讲」「左右」这类字的「N 分钟」：光秃秃的「25 分钟」多半是内容里的数（比如一个番茄 25 分钟）
const TALK_LEN = /(?:(?:大概|大约|约|讲|分享|时长[:：]?)[ \t]*)?\d+(?:\.\d+)?(?:[ \t]*[~～\-–到至][ \t]*\d+(?:\.\d+)?)?[ \t]*分钟(?:左右)?/g;
const VENUE = /[^，,。；;！!？?、\s（）()「」【】]{0,8}(?:投影|投屏|电视|大屏|幕布|会议室)[^，,。；;！!？?、\s（）()「」【】]{0,6}/g;
const TEXT_RE = /\.(md|txt|markdown)$/i;

function clueOf(text) {
  const uniq = list => [...new Set(list.map(x => x.trim()).filter(Boolean))].slice(0, 2);
  const len = uniq((String(text).match(TALK_LEN) || []).filter(x => /大概|大约|约|讲|分享|时长|左右/.test(x)));
  const venue = uniq(String(text).match(VENUE) || []);
  return { len, venue };
}

// [{ src: '讲稿' | '素材 文件名', len: [], venue: [] }]，只列认出了东西的
function outlineClues(s) {
  const out = [];
  const add = (src, text) => { const c = clueOf(text); if (c.len.length || c.venue.length) out.push({ src, ...c }); };
  try { add('讲稿', readFileSync(join(s.dir, SCRIPT), 'utf8')); } catch (e) { /* 没有讲稿 */ }
  const root = join(s.dir, '素材');
  let names = [];
  try { names = readdirSync(root).filter(n => TEXT_RE.test(n) && n !== NOTE).sort().slice(0, 5); } catch (e) { names = []; }
  for (const n of names) {
    try { if (statSync(join(root, n)).size < 300 * 1024) add(`素材 ${n}`, readFileSync(join(root, n), 'utf8')); } catch (e) { /* 读不了就跳过 */ }
  }
  return out;
}

// ② 提纲
function stageOutline(s) {
  const sc = s.script;
  const n = sc ? sc.pages.length : 0;
  const where = [`课件目录：${posix(s.dir)}`, progress(s.meta)];
  if (!sc) where.push('还没有 讲稿.md');
  else if (n) where.push(`讲稿.md 里已经有 ${n} 页讲稿`);
  else where.push(sc.hasOutline ? '讲稿.md 里好像已经写了提纲，还没给用户确认' : '讲稿.md 里还没有提纲');
  if (s.materials.files) where.push(`素材/ 里有 ${s.materials.files} 个文件`);
  const clues = outlineClues(s);
  for (const c of clues) where.push(`${c.src}里已写：${[...c.len, ...c.venue].join('；')}（guide 粗略认出来的，你再核对）`);
  const lenAt = clues.find(c => c.len.length);
  const venueAt = clues.find(c => c.venue.length);

  const steps = [];
  if (s.materials.files) {
    steps.push([`先读素材：运行 materials 列清单${s.materials.images && !s.materials.note ? '、生成截图说明表' : '（跑过就不用再跑）'}，读完文字材料：`,
      cli('materials', quote(join(s.dir, '素材')))]);
  }
  steps.push('问题 1～4 哪些要问，由你（AI）先判断：对照素材和讲稿（包括讲稿开头那几行），已经写了答案的问题不再问，' +
    '直接用用户的原话写进提纲，并告诉用户「从你的讲稿里看到：……」；只把没写的问题放进【问用户】，一次问一个。' +
    (clues.length ? '上面「已写」那几条是 guide 粗略认出来的，核对一下是不是讲多久、在哪讲；guide 认不出的（讲给谁、想让听众带走什么），你自己读了判断。' : ''));
  if (n) steps.push(`讲稿.md 里已经有 ${n} 页讲稿：从中整理出提纲（分几部分、每部分几页、每部分讲什么）。原来的讲稿别删，提纲写在它前面。`);
  else if (sc && sc.hasOutline) steps.push('讲稿.md 里好像已经写了提纲：对照问题 1～4 看还缺什么，缺的再问，补齐后给用户确认。');
  steps.push([`把提纲写在 ${posix(s.dir)}/${SCRIPT} 的最前面（第一行是「# 课件标题」，已经写了就别重复），照这个格式：`, ...OUTLINE_TPL]);
  steps.push('页数按时长估：大约每分钟 1 页（20 分钟约 20 页），第一页封面、最后一页结尾。不写没有依据的数字和案例。');
  steps.push(['提纲写好后给用户看（问题 5），必须等用户明确说可以；要改就改完再问。用户没确认，不要往下写讲稿。用户确认后运行：',
    cli('confirm', quote(s.dir), 'outline')]);
  steps.push(guideStep(s.dir));

  const skip = (c, what) => `${c.src}里已写「${(what === 'len' ? c.len : c.venue)[0]}」：确认说的就是这个，就不问，直接写进提纲`;
  const asks = [
    { when: '先问这 4 个里还没有答案的；素材或讲稿里已经写了的，由你跳过，不要再问', q: '这次讲给谁听？', opts: [
      '技术和非技术的同事都有（推荐：拿不准就选这个）', '技术同事（开发、测试、运维等）', '非技术同事（产品、运营、业务等）', '外部的人（客户、社区、学生等）'] },
    { when: lenAt ? skip(lenAt, 'len') : '', q: '讲多久？', opts: ['15～20 分钟（推荐：最常见的长度）', '10 分钟以内', '30 分钟左右', '45 分钟以上'] },
    { when: venueAt ? skip(venueAt, 'venue') : '', q: '在什么场合、什么屏幕上讲？', opts: ['会议室投影或大屏（推荐）', '线上会议共享屏幕', '大会场，台下人很多', '笔记本或平板，当面给几个人看'] },
    { q: '最想让听众听完带走什么？', opts: [
      '直接用一句话告诉我（推荐：越具体越好，比如「学会用某个工具自动生成周报」）', '学会一件具体的事，回去能照着做', '知道一个新东西是什么、值不值得用', '认同一个想法或做法'] },
    { when: '提纲写好以后问', q: '提纲这样可以吗？', opts: ['可以，就按这个写讲稿（推荐）', '要改：说改哪里'] },
  ];
  return render(2, { where, steps, asks, say: '讲给组里的后端同事，20 分钟，会议室投影，想让大家学会用新工具排查线上问题' });
}

const SCRIPT_TPL = [
  '## 第 N 页 页标题',
  '章节标记：……　风格：……（④ 选完风格再填）',
  '主题：章节短名 › 本页主题',
  '**屏幕**（投出来的字，原样使用）',
  '- 主题行：章节短名 › 本页主题',
  '- 标题：……',
  '- 图注：……（有截图、截图下面要一行说明时才写；不要写成「截图说明：」）',
  '**节拍**（拍数 = 翻到这页后要点几下，第 0 拍不算）',
  '- 第 0 拍：翻到这页就在的内容，不用点｜重点词：……',
  '- 第 1 拍：出现什么｜重点词：……',
  '- 第 2 拍：出现什么｜重点词：……（普通页写到第 2～4 拍，封面、结尾写到第 1～2 拍）',
  '**画面**（怎么画、怎么动、形象做什么；要用截图的写明用哪张）',
  '**讲词**（照着讲，不投出来；按拍分段，重点词加粗）',
  '【第 0 拍】……',
  '【第 1 拍】……',
  '【第 2 拍】……',
];

// 讲词够讲几分钟（按每分钟约 235 字取中间值）：10 分钟以内按半分钟取整，最少半分钟
function canTalk(chars) {
  const x = Math.max(chars / 235, 0.5);
  return x >= 10 ? String(Math.round(x)) : String(Math.round(x * 2) / 2);
}

// 不凑字数的规矩（③ 每次都写）
const NO_FILLER = '不要为了凑字数加空话：补的每一句都要有具体内容（例子、步骤、数字），具体内容来自用户或素材；没有就问用户，不能编。' +
  '换个说法重复上一句、「这一步很重要」这类没有新东西的话，不算补。';

// ③ 讲稿
function stageScript(s) {
  const sc = s.script || { pages: [], sayChars: 0, talk: null };
  const n = sc.pages.length;
  const z = sc.sayChars;
  // 目标字数：「给组织方」里写的讲多久 × 每分钟 220–250 字；低于下限的 90% 问用户怎么补（不让 AI 自己凑字），超过上限要删
  const goal = targetChars(sc.talk);
  const floor = goal ? Math.ceil(goal.lo * 0.9) : 0;
  const talk = sc.talk ? (sc.talk.lo === sc.talk.hi ? `${sc.talk.lo} 分钟` : `${sc.talk.lo}～${sc.talk.hi} 分钟`) : '';
  const short = !!goal && n > 0 && z < floor;
  const long = !!goal && z > goal.hi;
  const where = [`课件目录：${posix(s.dir)}`, progress(s.meta)];
  if (n) {
    const a = sc.pages[0];
    const b = sc.pages[n - 1];
    where.push(`讲稿.md 现在有 ${n} 页（第 ${a.no} 页「${a.title}」到第 ${b.no} 页「${b.title}」），讲词约 ${z} 字，按每分钟 220～250 字算约 ${minutes(z)}`);
  } else {
    where.push('讲稿.md 现在有 0 页，还没开始写');
  }
  if (goal) {
    const state = z < goal.lo ? `还差约 ${goal.lo - z} 字${z >= floor ? '（差得不多，可以不补）' : ''}`
      : z > goal.hi ? `超出约 ${z - goal.hi} 字` : '在目标范围内';
    where.push(`讲 ${talk}（讲稿开头「给组织方」里写的）：目标约 ${goal.lo}–${goal.hi} 字，现在 ${z} 字，${state}`);
  }

  // 提纲「合计：约 N 页」写了、讲稿也写到这么多页了：页都写了，不用再往后接
  const allWritten = !!sc.planned && n >= sc.planned;
  const steps = [];
  steps.push(['先读讲稿格式说明（格式、规则、两页完整示例都在里面）：', refDoc('script-format.md')]);
  const writeLead = allWritten ? `提纲里的页都写了（合计约 ${sc.planned} 页，讲稿.md 现在 ${n} 页）：对照格式说明逐页查一遍，不对的改过来。`
    : n ? `接着往下写：照提纲一页一页写进讲稿.md，接在第 ${n} 页后面${sc.planned ? `（提纲合计约 ${sc.planned} 页）` : ''}。`
      : '照提纲一页一页写进 讲稿.md，接在提纲后面。';
  steps.push([writeLead + '每页的标题行必须写成「## 第 N 页 页标题」（guide 靠它数页数），下面四段：', ...SCRIPT_TPL]);
  steps.push('最容易错的几条：每页 2～4 拍（拍数 = 翻到这页后要点几下，第 0 拍不算：第 0 拍 + 第 1、2 拍 = 2 拍；封面、结尾 1～2 拍），' +
    '讲词从【第 0 拍】写到最后一拍，和节拍一一对上；每拍一个重点词，讲词里加粗；' +
    '新概念第一次出现的那页，第 0 拍先用一句大白话解释；不写没有依据的数字、百分比、案例和用户反馈；讲词用第一人称、短句，每拍三四句以内；' +
    '截图的说明写成「图注：……」，不写「截图说明：」。');
  if (goal) {
    steps.push(`用总字数控制时长：这份讲 ${talk}，讲词目标约 ${goal.lo}–${goal.hi} 字（每分钟 220～250 字）。` +
      `超过 ${goal.hi} 字要删；低于 ${floor} 字（目标下限的 90%）先问用户怎么补。${NO_FILLER}`);
  } else {
    steps.push('用总字数控制时长：按每分钟 220～250 字估，比如 20 分钟约 4400～5000 字；超过上限要删，低于目标下限的 90% 先问用户怎么补。' + NO_FILLER +
      '讲稿开头「给组织方」里没读到讲多久：写成「- 时间与时长：20 分钟，会议室投影」这样，guide 就能算出目标字数。');
  }
  const can = canTalk(z);
  if (short) {
    const first = allWritten ? '提纲里的页都写了还不够，'
      : sc.planned ? `提纲里还有约 ${sc.planned - n} 页没写，先照提纲写完；写完还不够，`
        : '提纲里还有没写的页，先照提纲写完；页都写了还不够，';
    steps.push([`讲词现在 ${z} 字，不到目标下限的 90%（${floor} 字），只够讲约 ${can} 分钟。${first}` +
      '问用户怎么办（问题 1），照用户选的做，不要自己往讲词里凑字：',
    '选「讲细」：对照提纲和素材，列出哪几页可以展开、每页要用户补什么（具体的例子、步骤、数字），用户给了再写进讲词。',
    '选「加页」：列出提纲里还能加的方向，请用户给要点，照要点加页；「给组织方」的大纲和合计页数跟着改。',
    `选「就讲这么短」：把「给组织方」里的时长改成约 ${can} 分钟；再按约每分钟 1 页看一下提纲的页数，内容少的页可以合并，` +
      '但不要为了对上页数删掉用户原稿里的内容；页数怎么调也要给用户看。改完再运行 guide。']);
  }
  if (long) {
    steps.push(`讲词现在 ${z} 字，超过目标上限（${goal.hi} 字）约 ${z - goal.hi} 字：问用户之前，先删到 ${goal.hi} 字以内（删重复的话、合并页）。` +
      '用户明确说可以讲长一点，才可以不删。');
  }
  if (s.materials.images) {
    steps.push(s.materials.note
      ? '「画面」一段要用截图时，写 素材/截图说明.md 里的文件名。'
      : ['「画面」一段要用截图时写文件名。素材里有图但还没有截图说明表，先运行：', cli('materials', quote(join(s.dir, '素材')))]);
  }
  steps.push('页数多（超过 15 页）时，可以先写完第一部分给用户看一眼语气对不对，再接着写。');
  steps.push([`写完给用户看（问题 ${short ? '2：先问完问题 1、照用户选的改好，再问这个' : '1'}），必须等用户明确说可以；要改就改完再问。用户确认后运行：`,
    cli('confirm', quote(s.dir), 'script')]);
  steps.push(guideStep(s.dir));

  const asks = [];
  if (short) {
    asks.push({
      when: `讲稿照提纲写完后，讲词还不到 ${floor} 字就先问这个；不要自己凑字`,
      q: `讲稿现在约 ${z} 字，只够讲约 ${can} 分钟（目标 ${talk}）。怎么办？`,
      opts: [
        '把现有的页讲细：我列出哪几页可以展开、需要你补哪些具体内容（例子、步骤、数字）（推荐）',
        '加几页新内容：我列出提纲里还能加的方向，请你给要点',
        `就讲这么短：把时长改成约 ${can} 分钟`,
      ],
    });
  }
  asks.push({ when: short ? '问题 1 处理完、讲稿改好以后问' : '讲稿写完以后问', q: '讲稿写好了，你看一遍，可以吗？', opts: [
    '可以，就按这个做课件（推荐）', '要改：说哪页改什么', '太长或太短：说要加还是要减'] });
  return render(3, { where, steps, asks, say: short ? '第 4 页可以讲细一点，我补两个我们组的真实例子给你' : '第 3 页的讲词太书面了，改口语一点；第 5、6 页合成一页' });
}

// 按讲稿里的词粗估推荐哪种风格（只是起点，AI 读过讲稿可以换）。
// 不放「开场」「收尾」「总结」这类几乎每份提纲都有的词，免得什么讲稿都推同一种。
// 每种风格 5–10 个最能代表它的词；同一个词只归一种风格，也不让一个词是另一种风格的词的一部分
// （「技术」不数「非技术」里的，「命令」不数「命令行」里的），免得一句话同时给两种风格加分
export const HINTS = {
  // 手绘家
  paper: /总览|愿景|规划|展望|全景|路线图/g,
  board: /安装|命令(?!行)|教程|教学|培训|步骤|配置|课程/g,
  journal: /原理|角色|示意图|机制|主线/g,
  desk: /经历|故事|协作|团队|踩坑/g,
  watercolor: /新手|入门|上手|非技术|小白|温和/g,
  ink: /人文|方法论|传统|文化|历史|哲学|修身|东方|国风/g,
  blueprint: /搭建|组成|结构|模块|零件|部件|组件|系统|框架|蓝图/g,
  comic: /漫画|吐槽|反转|转折|对比|情绪|剧情|搞笑|段子|笑点/g,
  // 现代家
  dark: /代码|(?<!非)技术|架构|接口|API|部署|性能|开发者|命令行|工程师/g,
  frost: /产品|功能|发布|上线|工具|版本|演示/g,
  glass: /界面|设计|交互|体验|视觉|UI|原型|App|科技/g,
  flat: /流程|插画|图解|科普|零基础|通俗/g,
  magazine: /观点|读书|书单|复盘|思考|心得|反思|拆解/g,
  brutal: /实操|动手|清单|攻略|玩法|速成|内部分享|周会/g,
  // 像素家
  pixel: /新人|新同事|入职|引导|闯关|通关|关卡|游戏|轻松/g,
};
// 命中次数一样时的先后：最早的 6 种在前，后加的按「通用程度」排在后面
const DEFAULT_ORDER = ['paper', 'watercolor', 'board', 'dark', 'desk', 'journal',
  'flat', 'frost', 'magazine', 'ink', 'blueprint', 'comic', 'glass', 'brutal', 'pixel'];

// 讲稿（尤其「给组织方」里的场合）写了在投影、幕布上讲
const PROJECTOR = /投影|幕布|会议室/;
// 在投影上讲时深色底要扣的分：比任何一份讲稿的关键词命中都多，深色底排到所有浅色底后面
const DARK_PENALTY = 1000;
// 一个风格的关键词在讲稿里合计至少命中这么多次才算数：只出现一次多半是顺口提到，不该左右推荐
const MIN_HITS = 2;

// 讲稿里算「内容」的部分（④ 推荐风格只数这些）：「给组织方」一节、每页的页标题、「屏幕」段和「讲词」段。
// 「节拍」「画面」两段是照格式写的版式说明（「第 1 拍：步骤 1 出现」「三个步骤横排」），
// 「屏幕」里「步骤 1：」「卡片 1：」这类行首标签和讲词里的【第 n 拍】也是格式字样，都不数，免得自己给自己打分。
// 讲稿里没有「## 第 N 页」时（还没照格式写），整份都算。
const SCREEN_LABEL = /^([ \t]*[-*][ \t]*)(?:主题行|标题|副标题|一句话解释|卡片[ \t]*\d*|步骤[ \t]*\d*|图注|命令)[ \t]*[:：]/gm;
export function contentText(text) {
  const t = String(text);
  const heads = scriptPageHeads(t);
  if (!heads.length) return t;
  const parts = [organizerSection(t)];
  heads.forEach((h, i) => {
    const body = t.slice(h.index, i + 1 < heads.length ? heads[i + 1].index : t.length);
    parts.push(h.title);
    const marks = [...body.matchAll(/^\*\*(屏幕|节拍|画面|讲词)\*\*[^\n]*$/gm)];
    marks.forEach((m, j) => {
      if (m[1] !== '屏幕' && m[1] !== '讲词') return;
      const seg = body.slice(m.index + m[0].length, j + 1 < marks.length ? marks[j + 1].index : body.length);
      parts.push(m[1] === '屏幕' ? seg.replace(SCREEN_LABEL, '$1') : seg.replace(/【第\s*\d+\s*拍】/g, ''));
    });
  });
  return parts.join('\n');
}

// 返回 [{ s, hits（关键词命中次数，不到 MIN_HITS 算 0）, score（扣分后）, penalized, order, words }]，按 score 从高到低
function rankScenes(ready, text, { projector = false } = {}) {
  const rank = ready.map((s, i) => {
    let found = {};
    const re = HINTS[s.key];
    if (re) for (const m of text.match(re) || []) found[m] = (found[m] || 0) + 1;
    let hits = Object.values(found).reduce((a, b) => a + b, 0);
    // 合计不到门槛：当作没有匹配，不加分，也不进推荐理由
    if (hits < MIN_HITS) { hits = 0; found = {}; }
    const penalized = projector && !!s.dark;
    const score = hits - (penalized ? DARK_PENALTY : 0);
    const order = DEFAULT_ORDER.includes(s.key) ? DEFAULT_ORDER.indexOf(s.key) : DEFAULT_ORDER.length + i;
    // 只列实际在讲稿里匹配到的词，带上次数，方便对照讲稿核实
    const words = Object.entries(found).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([w, c]) => `「${w}」${c} 处`);
    return { s, hits, score, penalized, order, words };
  });
  return rank.sort((a, b) => b.score - a.score || a.order - b.order);
}

// 已经搭好骨架以后换风格的做法（④ 和 ⑥ 用）
function switchLines(s, info) {
  const old = s.meta.scenes[0] || '〈现在的风格〉';
  const tplScenes = posix(join(TPL_DIR, 'scenes'));
  // 自带字体的风格（像素游戏的缝合像素字体在 template/vendor/fonts/pixel/）：换过去时字体目录也要带上
  const withFont = info.ready.filter(x => existsSync(join(TPL_DIR, 'vendor', 'fonts', x.key)));
  const fontLine = withFont.length
    ? `（换成${withFont.map(x => `${x.label}（${x.key}）`).join('、')}时，还要把 ${posix(join(TPL_DIR, 'vendor', 'fonts'))}/〈新风格〉/ 整个复制到 ${posix(s.dir)}/vendor/fonts/〈新风格〉/，不然字会退回系统字体）`
    : '';
  // 命令单独占一行，后面不跟说明，免得复制时把说明也带进去
  return [
    `a. 记下新风格（把〈新风格〉换成键名，比如 board${s.meta.mascot ? `；形象先不换，还用${info.mascot(s.meta.mascot)}` : ''}）：`,
    `   ${cli('confirm', quote(s.dir), 'style', '--scenes', '〈新风格〉', ...(s.meta.mascot ? ['--mascot', s.meta.mascot] : []))}`,
    `b. 把 ${tplScenes}/〈新风格〉.js 和 〈新风格〉.css 复制到 ${posix(s.dir)}/scenes/${fontLine}`,
    `c. 把 ${posix(s.dir)}/index.html 里 scenes/${old}.css、scenes/${old}.js 这两行的文件名换成新风格（只有换风格时才动章节区以外的这两行）`,
    `d. 把 ${posix(s.dir)}/slides/ 里每页的 scene: '${old}' 换成新风格`,
    'e. 重跑后台自检，错误改到 0 个：',
    `   ${cli('check', quote(s.dir), '--browser')}`,
  ];
}

// ④ 风格
function stageStyle(s) {
  const info = sceneInfo();
  const where = [`课件目录：${posix(s.dir)}`, progress(s.meta)];
  if (s.script) where.push(`讲稿.md 有 ${s.script.pages.length} 页`);
  if (s.engine) where.push(`已经搭好骨架，用的风格：${s.meta.scenes.map(info.label).join('、') || '没记下'}；形象：${s.meta.mascot ? info.mascot(s.meta.mascot) : '没记下'}`);

  // 推荐：已经记下的风格优先（搭好的骨架就是它），否则按讲稿内容里的词粗估（节拍、画面这些格式段不算）
  let text = '';
  try { text = contentText(readFileSync(join(s.dir, SCRIPT), 'utf8').replace(/^﻿/, '')); } catch (e) { text = ''; }
  const projector = PROJECTOR.test(text);
  const ranked = rankScenes(info.ready, text, { projector });
  const anyDark = ranked.some(r => r.penalized);
  if (projector && anyDark) where.push('讲稿里写了在投影、幕布或会议室讲：深色底在幕布上容易发灰，推荐时浅色底排在前面');
  const fit = sc => (sc.fit ? `：适合${sc.fit}` : '');
  let first;
  let recKeys;
  const recorded = s.meta.scenes.filter(k => info.ready.some(x => x.key === k));
  if (recorded.length) {
    const scs = recorded.map(k => info.ready.find(x => x.key === k));
    recKeys = recorded.join(',');
    const dim = projector && scs.some(x => x.dark) ? '；注意在投影上讲，深色底容易发灰' : '';
    first = `${scs.map(x => x.label).join(' + ')}（${recKeys}）${scs.length === 1 ? fit(scs[0]) : ''}（推荐：${s.engine ? '已经搭好的骨架用的就是它，不用改文件' : '之前记下的就是它'}${dim}）`;
  } else if (ranked.length) {
    const top = ranked[0];
    recKeys = top.s.key;
    // 深色底因为投影被排到后面、而它本来命中更多时，说一句它为什么没排第一
    const demoted = projector ? ranked.find(r => r.penalized && r.hits > top.hits) : null;
    const why = [];
    if (top.hits) why.push(`讲稿里出现了${top.words.join('、')}`);
    else if (!demoted) why.push('讲稿里没有明显的关键词，按适合讲什么挑的');
    if (demoted) why.push(`讲稿里的${demoted.words.join('、')}更像${demoted.s.label}，但它是深色底`);
    if (projector && anyDark) why.push('在投影上讲，优先浅色底');
    first = `${top.s.label}（${top.s.key}）${fit(top.s)}（推荐：${why.join('；')}）`;
  } else {
    recKeys = '〈风格键名〉';
    first = '照 styles 列出的挑一个（推荐）';
  }
  const others = ranked.filter(r => !recKeys.split(',').includes(r.s.key)).slice(0, 2)
    .map(r => `${r.s.label}（${r.s.key}）${fit(r.s)}${r.penalized ? '（深色底，投影上容易发灰）' : ''}`);
  const opts = [first, ...others, '先看样册再定'];

  // 各风格默认的形象：「方格纸用尖尖（jianjian），黑板用沙沙（shasha），科技暗黑用微光（weiguang）」
  const byMascot = {};
  for (const sc of info.ready) (byMascot[sc.mascot] = byMascot[sc.mascot] || []).push(sc.label);
  const mascotNote = Object.entries(byMascot).map(([k, labels]) => `${labels.join('、')}用${info.mascot(k)}`).join('，');

  const steps = [];
  steps.push(['运行 styles，看所有风格的样子、适合讲什么、不适合什么、属于哪一家：', cli('styles')]);
  steps.push('对照讲稿每部分讲什么，从「适合」里挑一个主推，跟用户说一句理由。下面问题 1 的推荐是按讲稿里的词粗估的；' +
    '你读过讲稿，觉得别的更合适，就把它换到第一个、标上（推荐）。' +
    (projector && anyDark ? `讲稿里写了在投影上讲：优先推浅色底；用户想要深色底（${info.ready.filter(x => x.dark).map(x => x.label).join('、')}），先跟他说一声投到幕布上容易发灰。` : ''));
  steps.push('内容跨度大时，可以按章用不同风格：最多 3 种，只在同一家里混（手绘家、现代家、像素家互不混用）；一份课件只用一个形象。');
  steps.push(['打开样册给用户看（样册还没做好时它会说明，那就把 styles 的文字说明讲给用户听）：', cli('styles', '--open')]);
  steps.push(['用户选定后（必须等用户明确选了）运行，--scenes 后面写风格的键名，多种用逗号隔开：',
    cli('confirm', quote(s.dir), 'style', '--scenes', recKeys),
    `形象默认跟第一种风格走（${mascotNote}）；用户想换形象再加 --mascot 键名。`]);
  if (s.engine) steps.push(['已经搭好骨架了：用户选的和现在的一样，就照上面运行 confirm；选了别的风格，照这样换：', ...switchLines(s, info)]);
  steps.push(guideStep(s.dir));

  const label = recorded.length ? recorded.map(k => info.ready.find(x => x.key === k).label).join('和') : ranked.length ? ranked[0].s.label : '推荐的那个';
  return render(4, {
    where, steps,
    asks: [{ q: '这份课件用哪种风格？', opts }],
    say: `先打开样册让我看看，没问题就用${label}`,
  });
}

// ⑤ 搭骨架
function stageBuild(s) {
  const info = sceneInfo();
  const font = fontState();
  const where = [`课件目录：${posix(s.dir)}`, progress(s.meta)];
  if (s.meta.scenes.length) where.push(`风格：${s.meta.scenes.map(info.label).join('、')}；形象：${s.meta.mascot ? info.mascot(s.meta.mascot) : '跟着风格走'}`);
  where.push(`字体：${font.text}`);

  // 标题：讲稿的一级标题 > 记下的标题 > 目录名；去掉会被终端特殊处理的字符
  const title = String((s.script && s.script.title) || s.meta.title || basename(s.dir)).replace(/["`$\\]/g, '').trim() || '我的分享';
  const scenes = s.meta.scenes.join(',') || '〈风格键名〉';
  const newCmd = cli('new', quote(s.dir), '--title', `"${title}"`, '--scenes', scenes);

  const steps = [];
  if (s.engine && !s.index) {
    steps.push(['目录里有 engine/ 却没有 index.html，骨架不完整；new 不会在已有 engine/ 的目录里重搭。' +
      '把 讲稿.md、素材/、.li-talk.json 挪到一个新目录，再对新目录运行（下面命令里的目录换成新目录）：', newCmd]);
    steps.push(['搭好后对新目录运行 guide 看下一步。', cli('guide', '"〈新目录〉"')]);
    return render(5, { where, steps, noAsk: '这一步不用问用户；挪目录前告诉用户一声。', say: '骨架坏了就换个目录重新搭吧' });
  }
  const foreign = foreignFiles(s.dir);
  if (foreign.length) {
    steps.push(`目录里有别的文件（${foreign.slice(0, 5).join('、')}${foreign.length > 5 ? ` 等 ${foreign.length} 项` : ''}），new 会拒绝：搭骨架前课件目录里只能有 讲稿.md 和 素材/。先把这些文件挪进 素材/（或挪走）。`);
  }
  if (!s.meta.scenes.length) steps.push('风格确认过，但没记下是哪种：问用户选的是哪种（或者翻对话记录），把下面命令里的〈风格键名〉换成它，比如 paper。');
  steps.push(['运行搭骨架（标题取讲稿.md 的第一行标题，用户想换就改 --title 后面的字）：', newCmd]);
  if (!font.ok) steps.push(`第一次搭骨架会下载霞鹜文楷完整字体（约 ${font.mb} MB），要等一会儿；下载不了会先用自带的常用字小字库，不影响往下做。`);
  steps.push(['new 会复制引擎、选中的风格和形象，生成 index.html 和一页封面（slides/ch1.js）。搭好后运行 guide 看下一步：', cli('guide', quote(s.dir))]);
  return render(5, { where, steps, noAsk: '这一步不用问用户，直接运行上面的命令。', say: `课件标题就叫《${title}》，开始搭吧` });
}

// 页面一览：「p01「封面」、p02「…」」
function pageList(pages) {
  const shown = pages.slice(0, 8).map(p => `${p.def.id || '（没写 id）'}「${p.def.title == null ? '' : String(p.def.title)}」`);
  return shown.join('、') + (pages.length > 8 ? ` 等 ${pages.length} 页` : '');
}

// 章节运行出错时（⑥、⑦ 共用）
function failSteps(s) {
  return [
    ['有章节运行出错，出错之后的页没加载上：', ...s.failures.map(f => `${f.file}：${f.message}`)],
    ['运行不开浏览器的检查，看详细的出错位置，改好：', cli('check', quote(s.dir))],
    guideStep(s.dir),
  ];
}

// 自检没跑、过期、有错误时（⑥、⑦ 共用）
function checkSteps(s, lead) {
  return [
    [`${lead}${s.st.text}。运行后台自检（5 个尺寸逐页逐拍量一遍，要等一会儿）：`, cli('check', quote(s.dir), '--browser')],
    '把报告里的错误一条条改掉，再跑，直到 0 个错误。每条都写了在哪、什么问题、怎么改；看不了图就照报告改，不要猜。' +
      '提醒逐条判断：要么改，要么跟用户说明为什么不改。能看图的话加 --shots 看截图（存在 .li-talk/shots/）。',
    guideStep(s.dir),
  ];
}

// ⑥ 先做 3 页
function stageTrial(s) {
  const info = sceneInfo();
  const n = s.pages.length;
  const where = [`课件目录：${posix(s.dir)}`, progress(s.meta), `现在 ${n} 页${n ? '：' + pageList(s.pages) : ''}`, `自检：${s.st.text}`];
  const waitSay = '先把 3 页做出来、自检清零了再给我看';

  if (s.failures.length) {
    return render(6, { where, steps: failSteps(s), noAsk: '先把出错的章节改好，现在不用问用户。', say: waitSay });
  }
  if (n < 3) {
    const hasCover = s.pages.some(p => p.def.id === 'p01');
    const steps = [
      ['先读两份说明：样板页（照着改，少从零写）、写页面的规矩：', refDoc('templates.md'), refDoc('authoring.md')],
      '写到 3 页：封面，加讲稿里最典型的两页——从讲稿里挑一页步骤或图示（有先后、有箭头的）和一页清单（并列的几件事），' +
        `优先挑内容最多、最能代表这份课件的那两页。${hasCover ? '封面 p01 已经有了（new 生成的），照讲稿第 1 页改文字。' : ''}`,
      `写在 ${posix(s.dir)}/slides/ch1.js 里（每页一个 Deck.add，页面顺序就是写的顺序）。id 用讲稿的页号：讲稿第 5 页就写 id: 'p05'，以后写全稿再按顺序把中间的页补上。` +
        `页面样式写在同一目录的 ch1.css 里，选择器以 [data-id="p05"] 这样开头。`,
      '只改 slides/ 里的文件和 index.html 里两对「章节」注释之间的行，不碰 engine/、scenes/、mascots/、vendor/。',
      ['写完运行后台自检，把报告里的错误一条条改掉、再跑，直到 0 个错误；提醒逐条判断：要么改，要么跟用户说明为什么不改。能看图的话加 --shots，截图存在 .li-talk/shots/：',
        cli('check', quote(s.dir), '--browser')],
      guideStep(s.dir),
    ];
    return render(6, { where, steps, noAsk: '先把 3 页做出来、自检清零，再给用户看；现在不用问。', say: waitSay });
  }
  if (s.st.kind !== 'ok') {
    return render(6, { where, steps: checkSteps(s, ''), noAsk: '自检清零以前不要给用户看，现在不用问。', say: waitSay });
  }
  const steps = [
    ['用浏览器打开课件给用户看：', cli('open', quote(s.dir))],
    '告诉用户怎么看：→ 或空格下一拍，← 上一拍，O 总览跳页，B 黑屏，L 激光笔，S 打开演讲者视图（看讲词；在那里按 H 彩排），F 全屏。',
    '问用户这 3 页行不行（问题 1），必须等用户明确说可以。用户要改：改完重跑 check --browser 清零，再请用户看。',
    ['用户认可后运行：', cli('confirm', quote(s.dir), 'trial')],
    ['用户想换个风格（问题 1 选 3）：先打开样册让用户比较，定了要换再照下面改：', cli('styles', '--open'), ...switchLines(s, info)],
    guideStep(s.dir),
  ];
  return render(6, {
    where, steps,
    asks: [{ q: '这 3 页的样子行吗？', opts: ['可以，照这个样子写全稿（推荐）', '要改：说哪页改什么', '想换个风格看看'] }],
    say: '封面可以；清单那页字太多，删短一点',
  });
}

// ⑦ 写全稿
function stageFull(s) {
  const want = s.script ? s.script.pages.length : 0;
  const n = s.pages.length;
  const where = [`课件目录：${posix(s.dir)}`, progress(s.meta), `讲稿 ${want} 页，课件现在 ${n} 页`, `自检：${s.st.text}`];
  const say = '照讲稿把剩下的页都写完，自检清零后再给我看';
  const noAsk = '这一步不用问用户；全稿写完、自检清零后进入过稿，再请用户看。';

  if (s.failures.length) return render(7, { where, steps: failSteps(s), noAsk, say });
  if (n < want) {
    // 页面 id 照讲稿页号写（p03）时，能列出还没写的是哪几页
    const ids = new Set(s.pages.map(p => String(p.def.id)));
    const missing = s.script.pages.filter(p => !ids.has('p' + pad2(p.no)) && !ids.has('p' + p.no));
    const list = missing.length === want - n
      ? '：' + missing.slice(0, 10).map(p => `第 ${p.no} 页「${p.title}」`).join('、') + (missing.length > 10 ? ` 等 ${missing.length} 页` : '')
      : '';
    const steps = [
      `照讲稿把剩下的页写完，还差 ${want - n} 页${list}。id 用讲稿的页号（第 3 页就是 'p03'），按讲稿的顺序放在对应位置（页面顺序 = 章节的引入顺序 + 文件里 Deck.add 的顺序）。`,
      ['写法和前 3 页一样：先找最接近的样板照着改，规矩见：', refDoc('templates.md'), refDoc('authoring.md')],
      `按讲稿的章节分文件：第二章建 ${posix(s.dir)}/slides/ch2.js 和 ch2.css，再在 index.html 里两对「章节」注释之间各加一行引入（照 ch1 那两行写）。`,
      ['每写完一章，跑一次不开浏览器的检查（几秒）：', cli('check', quote(s.dir))],
      ['全部写完跑后台自检，错误改到 0 个，提醒逐条判断：要么改，要么跟用户说明为什么不改：', cli('check', quote(s.dir), '--browser')],
      guideStep(s.dir),
    ];
    return render(7, { where, steps, noAsk, say });
  }
  const lead = want ? `页数够了（讲稿 ${want} 页，课件 ${n} 页），` : '讲稿.md 里没找到「## 第 N 页」这样的标题，数不出讲稿有几页，确认照讲稿写完了以后，';
  return render(7, { where, steps: checkSteps(s, lead), noAsk, say });
}

// ⑧ 过稿
function stageReview(s) {
  const where = [`课件目录：${posix(s.dir)}`, progress(s.meta), `课件 ${s.pages.length} 页`, `自检：${s.st.text}`];
  const steps = [
    ['用浏览器打开整份课件给用户过稿：', cli('open', quote(s.dir))],
    '告诉用户怎么看：→ 或空格下一拍，← 上一拍，O 总览跳页（点一页或敲页码回车跳过去），B 或「.」黑屏，L 激光笔，S 演讲者视图（看讲词、重点词和下一拍；在那里按 H 彩排一遍，看每页用时和哪几页超时），T 计时开始或暂停，R 计时归零，F 全屏。',
    '问用户行不行（问题 1），必须等用户明确说可以。用户提意见就照着改，改完重跑 check --browser 清零，再请用户看，直到用户认可。',
    ['用户认可后运行：', cli('confirm', quote(s.dir), 'review')],
    guideStep(s.dir),
  ];
  return render(8, {
    where, steps,
    asks: [{ q: '整份课件过一遍，可以了吗？', opts: ['可以了（推荐）', '要改：说哪页改什么', '讲起来太长或太短：说要删还是要加'] }],
    say: '第 7 页太挤了，拆成两页；结尾那句话换一下',
  });
}

// ⑨ 完成
function stageDone(s) {
  const where = [`课件目录：${posix(s.dir)}`, '提纲、讲稿、风格、3 页试做、过稿都确认了', `课件 ${s.pages.length} 页`, `自检：${s.st.text}`];
  const steps = [
    ['告诉用户怎么讲（双击 index.html 就能打开，不用联网）：',
      '→ ↓ 空格 PageDown Enter 或点击：下一拍；← ↑ PageUp：上一拍',
      'Home / End：第一页 / 最后一页',
      'O：总览跳页（点一页跳过去，或敲页码再回车；← → ↑ ↓ 选、回车跳；Esc 或再按 O 关闭）',
      'B 或「.」：黑屏（很多翻页笔的黑屏键发的就是「.」）；再按 B、Esc、翻页键或点一下恢复，恢复时不翻页',
      'L：激光笔开关（Esc 也能关），开着时点击照常进拍',
      'S：演讲者视图（另开一个窗口，看讲词、重点词和下一拍；在那个窗口里按 O、B、L 同样管主窗口）',
      'H：在演讲者视图里开始或结束彩排',
      'T：计时开始或暂停；R：计时归零',
      'F：全屏',
      '底部那条细线是进度条，按全稿走、按章节分段，自己会动'],
    ['告诉用户先按 H 彩排一遍：正式讲之前，在演讲者视图里按 H 从头讲一遍，讲完再按 H 出小结（每页用时、哪几页超时）；点「复制成文字」把小结贴给 AI，让它删减超时页的讲词。',
      '用户贴来小结（以「【彩排小结】」开头）时：只删小结列出的超时页的讲词，每页删到小结写的字数左右，重点词和意思保留；先改 讲稿.md，再改页面 notes 里对应拍的 say，两边一致；改完跑 check --browser 清零。'],
    ['想再看一遍就打开：', cli('open', quote(s.dir))],
    '发给别人：把整个课件目录拷走（或压缩成 zip），对方双击 index.html 就能看。',
    ['以后再改：改完跑后台自检清零，再运行 guide 看一眼：', cli('check', quote(s.dir), '--browser')],
  ];
  return render(9, {
    where, steps,
    asks: [{ q: '还要做什么吗？', opts: ['不用了，就这样（推荐）', '再改改：说改哪里', '彩排过了：贴上彩排小结，删减超时页的讲词'] }],
    say: '再从头帮我看一遍讲词，有没有错别字',
  });
}

const RENDER = [null, stageStart, stageOutline, stageScript, stageStyle, stageBuild, stageTrial, stageFull, stageReview, stageDone];

/**
 * guide 的输出文字。target 是课件目录，不写就用当前目录。
 */
export function guideText(target) {
  const s = inspect(target);
  return RENDER[s.stage](s);
}

// guide 命令
export async function run(args = {}, opts = {}) {
  const log = opts.log || (s => console.log(s));
  const target = args._ && args._[0];
  log(guideText(target ? String(target) : undefined));
  return 0;
}
