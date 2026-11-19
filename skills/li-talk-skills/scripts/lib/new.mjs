// new 命令：按选中的风格搭一份课件的骨架
//   new <课件目录> --title 标题 --scenes 风格[,风格] [--mascot 形象]
// 复制引擎、选中的风格、用到的形象、vendor、起步章节，装字体（选中的风格自带字体的，比如像素游戏，
// 把 template/vendor/fonts/<风格键名>/ 一起带上；自带品牌素材的，比如方果，把 template/vendor/brand/<风格键名>/ 一起带上），按模板生成 index.html，记下 .li-talk.json。
// 目录可以已经存在，但里面只能有 讲稿.md、素材/、.li-talk.json、.li-talk/（以及 . 开头的文件）；
// 已经有 engine/ 的说明搭过了，不重搭，免得覆盖写好的页面。
import {
  copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, rmdirSync, statSync, writeFileSync,
} from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { UserError } from './cli.mjs';
import { TPL_DIR, VERSION } from './paths.mjs';
import { readMeta, writeMeta } from './meta.mjs';
import { ensureCache, installFonts, liteNotice } from './fonts.mjs';

const FAMILY = { corp: '企业风', hand: '手绘风', modern: '现代风', pixel: '像素风' };
// 搭骨架前目录里允许已有的东西（. 开头的另算，一律放过）
const ALLOWED = new Set(['讲稿.md', '素材', '.li-talk.json', '.li-talk']);
const OS_JUNK = new Set(['thumbs.db', 'desktop.ini']);

const broken = what => new UserError(`skill 没装完整：缺少 ${what}。请重新安装 li-talk-skills。`, 2);

/* ------------------------------------------------------------------
   风格和形象
   ------------------------------------------------------------------ */

// 读风格说明 scenes/index.json：[{ key, label, family, mascot, look, fit, notFit, risk }]
export function sceneIndex(tplDir = TPL_DIR) {
  const file = join(tplDir, 'scenes', 'index.json');
  if (!existsSync(file)) throw broken('template/scenes/index.json');
  let list;
  try { list = JSON.parse(readFileSync(file, 'utf8').replace(/^﻿/, '')); } catch (e) { list = null; }
  if (!Array.isArray(list)) throw broken('格式正确的 template/scenes/index.json');
  return list.filter(s => s && typeof s.key === 'string');
}

const sceneReady = (tplDir, key) => existsSync(join(tplDir, 'scenes', key + '.js'));
const sceneName = s => `${s.key}（${s.label || s.key}）`;

/**
 * 把用户写的风格（数组，或用逗号、顿号、空格隔开的一串；键名或名字都认）换成风格说明里的条目，去重、保持顺序。
 * 不认识的、还没做好的（说明里有但风格文件不存在）抛 UserError，并列出能选的。
 */
export function resolveScenes(input, tplDir = TPL_DIR) {
  const words = (Array.isArray(input) ? input : String(input == null ? '' : input).split(/[,，、\s]+/))
    .map(w => String(w).trim()).filter(Boolean);
  const index = sceneIndex(tplDir);
  const ready = index.filter(s => sceneReady(tplDir, s.key));
  const choices = () => ready.map(sceneName).join('、') || '（没有做好的风格，skill 可能没装完整）';
  if (!words.length) throw new UserError(`要选风格：--scenes 风格[,风格]。可选的：${choices()}`);
  const out = [];
  for (const w of words) {
    const s = index.find(x => x.key === w.toLowerCase()) || index.find(x => x.label === w);
    if (!s) throw new UserError(`不认识的风格「${w}」。可选的：${choices()}`);
    if (!sceneReady(tplDir, s.key)) throw new UserError(`风格「${s.label || s.key}」（${s.key}）这个风格还没做好，先选别的：${choices()}`);
    if (!out.includes(s)) out.push(s);
  }
  return out;
}

// 本机有哪些形象：[{ key, label }]，label 从形象文件的 label: '…' 里读
export function mascotList(tplDir = TPL_DIR) {
  const dir = join(tplDir, 'mascots');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith('.js')).sort().map(f => {
    const key = f.slice(0, -3);
    const m = /\blabel\s*:\s*(['"])([^'"]*)\1/.exec(readFileSync(join(dir, f), 'utf8'));
    return { key, label: m ? m[2] : key };
  });
}

/**
 * 定下用哪个形象：写了就按写的（键名或名字），没写就用第一种风格默认的形象。
 * scenes 可以是 resolveScenes 的结果，也可以是风格键名的数组。返回 { key, label }。
 */
export function resolveMascot(input, scenes = [], tplDir = TPL_DIR) {
  const list = mascotList(tplDir);
  const choices = list.map(m => `${m.key}（${m.label}）`).join('、') || '（没有形象，skill 可能没装完整）';
  if (input) {
    const w = String(input).trim();
    const m = list.find(x => x.key === w.toLowerCase()) || list.find(x => x.label === w);
    if (!m) throw new UserError(`不认识的形象「${w}」。可选的：${choices}`);
    return m;
  }
  const first = scenes[0];
  const sc = typeof first === 'string' ? sceneIndex(tplDir).find(s => s.key === first) : first;
  const key = sc && sc.mascot;
  const m = key ? list.find(x => x.key === key) : list[0];
  if (!m) throw new UserError(`风格「${sc ? sc.label || sc.key : ''}」默认的形象「${key || ''}」还没做好，用 --mascot 另选一个：${choices}`);
  return m;
}

/* ------------------------------------------------------------------
   文件
   ------------------------------------------------------------------ */

// 风格自带的字体目录 template/vendor/fonts/<风格键名>/：有就返回它的路径，没有返回 null
function sceneFontDir(tplDir, key) {
  const d = join(tplDir, 'vendor', 'fonts', key);
  return existsSync(d) && statSync(d).isDirectory() ? d : null;
}
// 风格自带的品牌素材目录 template/vendor/brand/<风格键名>/（比如方果的 Logo 和二维码）：有就返回它的路径，没有返回 null
function sceneBrandDir(tplDir, key) {
  const d = join(tplDir, 'vendor', 'brand', key);
  return existsSync(d) && statSync(d).isDirectory() ? d : null;
}

// 递归复制目录；跳过占位文件 .gitkeep，以及 skip(名字) 为真的顶层条目
function copyTree(src, dst, skip = () => false) {
  mkdirSync(dst, { recursive: true });
  for (const e of readdirSync(src, { withFileTypes: true })) {
    if (e.name === '.gitkeep' || skip(e.name)) continue;
    const s = join(src, e.name);
    const d = join(dst, e.name);
    if (e.isDirectory()) copyTree(s, d);
    else if (e.isFile()) copyFileSync(s, d);
  }
}

const escHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// 放进 JS 单引号字符串
const escJsStr = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
// 放进 JS 模板字符串（反引号）
const escJsTpl = s => String(s).replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

// 把 {{名字}} 换成 values 里的值；模板里有没给值的占位说明模板和代码对不上
function fill(text, values, file) {
  return text.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => {
    if (!(k in values)) throw new Error(`${file} 里的占位 ${m} 没有对应的值`);
    return values[k];
  });
}

// 搭骨架前看一眼目录：已经有引擎就拒绝；有别的文件也拒绝（说清是哪些）
function checkTarget(dir) {
  if (!existsSync(dir)) return;
  if (!statSync(dir).isDirectory()) throw new UserError(`${dir} 是一个文件，不是目录。换一个课件目录。`);
  const names = readdirSync(dir);
  if (names.includes('engine')) {
    throw new UserError(`${dir} 已经搭过骨架（里面有 engine/），不再重搭，免得覆盖写好的页面。` +
      '接着在 slides/ 里写页面就行；想从头来，换一个新目录。');
  }
  const extra = names.filter(n => {
    const k = n.normalize('NFC');
    return !k.startsWith('.') && !ALLOWED.has(k) && !OS_JUNK.has(k.toLowerCase());
  });
  if (extra.length) {
    const shown = extra.slice(0, 5).join('、') + (extra.length > 5 ? ` 等 ${extra.length} 项` : '');
    throw new UserError(`${dir} 里已经有别的文件：${shown}。` +
      '课件目录里只能先放 讲稿.md 和 素材/：把材料挪进 素材/，或者换一个空目录再搭骨架。');
  }
}

/* ------------------------------------------------------------------
   搭骨架
   ------------------------------------------------------------------ */

/**
 * 搭一份课件的骨架。
 *   dir     课件目录（不存在就建）
 *   choice  { title, scenes, mascot }：scenes 是数组或逗号隔开的一串；都可以省略，
 *           省略时用 .li-talk.json 里记下的（确认风格时记的），标题再退到目录名
 *   opts    { log, fonts, download, tplDir }：
 *           log 输出函数；fonts 原样传给 ensureCache、installFonts（测试用来换清单、缓存目录、fetch）；
 *           download: false 时不下载字体，只用本机已有的缓存；tplDir 模板目录（测试用）
 * 返回 { dir, title, scenes: [键名], mascot: 键名, font: 'full' | 'lite', sceneFonts: [带了自带字体的风格键名] }。
 * 用法错误、目录不合适、风格或形象不认识时抛 UserError，这时不会在目录里留下任何东西。
 */
export async function createDeck(dir, choice = {}, opts = {}) {
  const log = opts.log || (s => console.log(s));
  const tplDir = opts.tplDir || TPL_DIR;
  const deckDir = resolve(String(dir));

  // 1. 先把能查的都查完，再动手
  checkTarget(deckDir);
  for (const p of ['index.html', 'engine', 'vendor', 'starter', 'starter/ch1.js']) {
    if (!existsSync(join(tplDir, p))) throw broken('template/' + p);
  }
  if (!VERSION) throw broken('version.txt');
  const meta = readMeta(deckDir);   // 目录或进度文件不存在时是默认结构
  const hasScenes = Array.isArray(choice.scenes) ? choice.scenes.length > 0 : !!choice.scenes;
  const fromMeta = !hasScenes && meta.scenes.length > 0;
  if (!hasScenes && !fromMeta) {
    const list = sceneIndex(tplDir).filter(s => sceneReady(tplDir, s.key)).map(sceneName).join('、');
    throw new UserError(`要选风格：--scenes 风格[,风格]（先运行 styles 看看，和用户定下来）。可选的：${list}`);
  }
  const scenes = resolveScenes(fromMeta ? meta.scenes : choice.scenes, tplDir);
  const keys = scenes.map(s => s.key);
  const sameAsMeta = meta.scenes.join() === keys.join();
  const mascot = resolveMascot(choice.mascot || (sameAsMeta && meta.mascot) || null, scenes, tplDir);
  const title = String(choice.title || meta.title || basename(deckDir)).replace(/\s+/g, ' ').trim() || basename(deckDir);

  // 风格搭配的提醒：不拦，用户说了算
  if (scenes.length > 3) log(`提醒：选了 ${scenes.length} 种风格，一份课件建议最多 3 种。`);
  const fams = [...new Set(scenes.map(s => s.family))];
  if (fams.length > 1) {
    log(`提醒：${scenes.map(s => `${s.label}（${FAMILY[s.family] || s.family}）`).join('、')} 不是同一类，同一份课件里建议只用同一类的风格。`);
  }

  // 2. 字体：先补本机缓存（缓存完整时不联网）。放在复制文件之前，下载中途被打断也不会留下半份课件
  const fontOpts = { ...(opts.fonts || {}), log };
  let cache = null;
  if (opts.download !== false) {
    try { cache = await ensureCache(fontOpts); } catch (e) { cache = null; }   // 清单坏了等情况：退回小字库
  }

  // 3. 复制文件；中途出错就把这次建的东西删掉
  const existed = existsSync(deckDir);
  const before = new Set(existed ? readdirSync(deckDir) : []);
  try {
    mkdirSync(deckDir, { recursive: true });
    copyTree(join(tplDir, 'engine'), join(deckDir, 'engine'));
    for (const s of scenes) {
      for (const ext of ['.js', '.css']) {
        const f = join(tplDir, 'scenes', s.key + ext);
        if (existsSync(f)) { mkdirSync(join(deckDir, 'scenes'), { recursive: true }); copyFileSync(f, join(deckDir, 'scenes', s.key + ext)); }
      }
    }
    mkdirSync(join(deckDir, 'mascots'), { recursive: true });
    copyFileSync(join(tplDir, 'mascots', mascot.key + '.js'), join(deckDir, 'mascots', mascot.key + '.js'));
    // 字体整个交给 installFonts；品牌素材只带选中的风格的（见下面）
    copyTree(join(tplDir, 'vendor'), join(deckDir, 'vendor'), name => name === 'fonts' || name === 'brand');
    mkdirSync(join(deckDir, '素材'), { recursive: true });

    // 起步章节：标题在 JS 字符串里用 {{TITLE}}，在页面 HTML（模板字符串）里用 {{TITLE_HTML}}
    const starterValues = {
      TITLE: escJsStr(title),
      TITLE_HTML: escJsTpl(escHtml(title)),
      SCENE: keys[0],
    };
    mkdirSync(join(deckDir, 'slides'), { recursive: true });
    for (const f of readdirSync(join(tplDir, 'starter'))) {
      if (f === '.gitkeep') continue;
      const src = join(tplDir, 'starter', f);
      if (!statSync(src).isFile()) continue;
      if (/\.(js|css)$/.test(f)) writeFileSync(join(deckDir, 'slides', f), fill(readFileSync(src, 'utf8'), starterValues, 'starter/' + f));
      else copyFileSync(src, join(deckDir, 'slides', f));
    }

    // 字体装进 vendor/fonts/：本机缓存完整就装完整字体，否则用自带的小字库
    const font = installFonts(deckDir, fontOpts);
    // 风格自带的字体（比如像素游戏的缝合像素字体）：模板里有 vendor/fonts/<风格键名>/ 就整个复制过去，
    // 风格的 CSS 用 ../vendor/fonts/<风格键名>/… 引用它；没选这个风格就不带
    const sceneFonts = keys.filter(k => sceneFontDir(tplDir, k));
    for (const k of sceneFonts) copyTree(sceneFontDir(tplDir, k), join(deckDir, 'vendor', 'fonts', k));
    // 风格自带的品牌素材（比如方果的 Logo 和二维码）：规则和字体一样，模板里有 vendor/brand/<风格键名>/ 就整个复制过去，
    // 风格的 CSS 用 ../vendor/brand/<风格键名>/… 引用它；没选这个风格就不带
    const sceneBrands = keys.filter(k => sceneBrandDir(tplDir, k));
    for (const k of sceneBrands) copyTree(sceneBrandDir(tplDir, k), join(deckDir, 'vendor', 'brand', k));

    // 入口 index.html
    let html = fill(readFileSync(join(tplDir, 'index.html'), 'utf8'), {
      VERSION,
      MASCOT: mascot.key,
      TITLE: escHtml(title),
      FONT_CSS: font === 'full' ? 'wenkai.css' : 'wenkai-lite.css',
      SCENE_CSS: keys.filter(k => existsSync(join(tplDir, 'scenes', k + '.css')))
        .map(k => `<link rel="stylesheet" href="scenes/${k}.css">`).join('\n'),
      SCENE_JS: keys.map(k => `<script src="scenes/${k}.js"></script>`).join('\n'),
      MASCOT_JS: `<script src="mascots/${mascot.key}.js"></script>`,
    }, 'template/index.html');
    // 模板里列出、但引擎目录里还没有的文件不引入（引擎文件是陆续加的），免得打开时报加载失败
    html = html.replace(/^[ \t]*<script src="engine\/([\w.-]+\.js)"><\/script>[ \t]*\r?\n/gm,
      (line, f) => (existsSync(join(deckDir, 'engine', f)) ? line : ''));
    writeFileSync(join(deckDir, 'index.html'), html);

    // 进度文件：记下标题、风格、形象；之前确认过的环节保留
    writeMeta(deckDir, { version: VERSION, title, scenes: keys, mascot: mascot.key });

    if (font !== 'full') log(liteNotice(cache ? cache.missing.length : undefined, deckDir));
    return { dir: deckDir, title, scenes: keys, mascot: mascot.key, font, sceneFonts, sceneBrands };
  } catch (e) {
    // 只删这次新建的条目；目录是这次建的、删完是空的，就连目录一起删
    try {
      for (const n of readdirSync(deckDir)) if (!before.has(n)) rmSync(join(deckDir, n), { recursive: true, force: true });
      if (!existed) rmdirSync(deckDir);
    } catch (e2) { /* 清理不了就算了，报原来的错 */ }
    throw e;
  }
}

// new 命令；第二个参数和 createDeck 的 opts 相同，测试时用来换掉字体下载
export async function run(args = {}, opts = {}) {
  const log = opts.log || (s => console.log(s));
  const target = args._ && args._[0];
  if (!target) throw new UserError('new 后面要写课件目录，比如：new ./我的分享 --title 我的分享 --scenes paper');
  if (args.title === true) throw new UserError('--title 后面要写标题，比如：--title 我的分享');
  if (args.scenes === true) throw new UserError('--scenes 后面要写风格，比如：--scenes paper 或 --scenes paper,board');
  if (args.mascot === true) throw new UserError('--mascot 后面要写形象，比如：--mascot duoduo');

  const r = await createDeck(String(target), {
    title: args.title ? String(args.title) : undefined,
    scenes: args.scenes ? String(args.scenes) : undefined,
    mascot: args.mascot ? String(args.mascot) : undefined,
  }, { ...opts, log });

  const labels = resolveScenes(r.scenes, opts.tplDir || TPL_DIR).map(s => `${s.label}（${s.key}）`).join('、');
  const m = mascotList(opts.tplDir || TPL_DIR).find(x => x.key === r.mascot);
  log(`骨架搭好了：${r.dir}`);
  log(`  标题：${r.title}`);
  log(`  风格：${labels}；形象：${m ? `${m.label}（${m.key}）` : r.mascot}`);
  log(`  字体：${r.font === 'full' ? '霞鹜文楷完整字体' : '自带的常用字小字库'}`);
  if (r.sceneFonts && r.sceneFonts.length) {
    const named = resolveScenes(r.sceneFonts, opts.tplDir || TPL_DIR).map(s => `${s.label}（vendor/fonts/${s.key}/）`).join('、');
    log(`  风格自带的字体：${named}`);
  }
  if (r.sceneBrands && r.sceneBrands.length) {
    const named = resolveScenes(r.sceneBrands, opts.tplDir || TPL_DIR).map(s => `${s.label}（vendor/brand/${s.key}/）`).join('、');
    log(`  风格自带的品牌素材：${named}`);
  }
  log(`  起步章节：slides/ch1.js（一页封面）`);
  log(`下一步：照 references/templates.md 先写 3 页（封面、一页图示、一页清单），然后运行 check ${target} --browser`);
  return 0;
}
