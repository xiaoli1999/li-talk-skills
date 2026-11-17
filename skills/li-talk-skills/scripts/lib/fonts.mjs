// fonts 命令：霞鹜文楷完整字体的下载、校验、缓存，以及装进课件
//
// 字体文件不放在仓库和 skill 里：按清单 wenkai.json（npm 包 lxgw-wenkai-webfont 的切块，只取常规和粗体）
// 从三个公开镜像依次下载，逐块校验 sha256，存到 ~/.li-talk-skills/fonts/wenkai/<版本>/，之后一直复用。
// 下载失败不卡流程：课件先用 skill 自带的常用字小字库（wenkai-lite），缺的字回退到系统楷体。
//
// 只用 Node 18 自带的接口：全局 fetch、node:crypto、node:fs。
import { createHash } from 'node:crypto';
import {
  existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, renameSync, unlinkSync, statSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const SKILL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const TPL_FONTS = join(SKILL_DIR, 'template', 'vendor', 'fonts');
const LICENSE = 'OFL-LXGW-WenKai.txt';
const LITE = ['wenkai-lite.css', 'wenkai-lite-regular.woff2', 'wenkai-lite-bold.woff2'];
// 清单放在 skill 目录下的 fonts/：npx skills add 只装 skill 目录，放在仓库根目录会漏掉
const MANIFEST_PATHS = [
  join(SKILL_DIR, 'fonts', 'wenkai.json'),
];
const TIMEOUT = 20000;   // 单个文件的下载超时（毫秒）；切块最大 70KB 左右
const CONCURRENCY = 6;   // 同时下载几个文件
const DEAD_AFTER = 3;    // 一个镜像连续失败几次就认为它这次不可用，后面的块不再试它

// 给用户看的错误：入口只打印 userMessage，不打印堆栈；exitCode 2 表示环境问题
function userError(message, exitCode = 1) {
  return Object.assign(new Error(message), { userMessage: message, exitCode });
}

const fileName = p => p.split('/').pop();
const mb = n => (n / 1024 / 1024).toFixed(1) + ' MB';

export function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

// 读字体清单；找不到或格式不对时抛给用户看的错误
export function loadManifest() {
  const p = MANIFEST_PATHS.find(f => existsSync(f));
  if (!p) throw userError('找不到字体清单 wenkai.json，skill 可能没装完整。先用自带的常用字小字库，重新安装 skill 后再运行 fonts。', 2);
  let m;
  try { m = JSON.parse(readFileSync(p, 'utf8')); } catch (e) { m = null; }
  if (!m || !m.version || !Array.isArray(m.files) || !m.files.length || !Array.isArray(m.mirrors) || !m.mirrors.length) {
    throw userError('字体清单 wenkai.json 格式不对，skill 可能没装完整。重新安装 skill 后再运行 fonts。', 2);
  }
  return m;
}

// 本机缓存目录：~/.li-talk-skills/fonts/wenkai/<版本>/
export function cacheDir(manifest) {
  return join(homedir(), '.li-talk-skills', 'fonts', 'wenkai', manifest.version);
}

// 生成字体 CSS：每块一个 @font-face，url 用文件名本身（不带包里的目录），前面加 prefix
export function buildCss(manifest, prefix = '') {
  const family = manifest.family || 'WK';
  const head = `/* 霞鹜文楷完整字体（${manifest.package}@${manifest.version}，常规和粗体）。` +
    '按 unicode-range 切块，浏览器只下载页面上用到的字所在的块。' +
    `SIL OFL 1.1 许可，见 ${LICENSE}。本文件由 fonts 命令生成，不要手改。 */\n`;
  // 粗体声明成 500–900：页面里写 500、600 的字也用粗体，和旧引擎的效果一致；常规只管 400 以下
  const weightOf = w => (w >= 700 ? '500 900' : String(w));
  return head + manifest.files.map(f =>
    `@font-face { font-family: "${family}"; font-style: normal; font-weight: ${weightOf(f.weight)}; font-display: swap; ` +
    `src: url("${prefix}${fileName(f.path)}") format("woff2"); unicode-range: ${f.range}; }`,
  ).join('\n') + '\n';
}

// 读出缓存里校验通过的块；有一块缺失或不对就返回 null
function readCache(manifest, dir) {
  const out = [];
  for (const f of manifest.files) {
    const p = join(dir, fileName(f.path));
    if (!existsSync(p)) return null;
    const buf = readFileSync(p);
    if (buf.length !== f.size || sha256(buf) !== f.sha256) return null;
    out.push(buf);
  }
  return out;
}

// 缓存里这一块是否完好
function cachedOk(f, dir) {
  const p = join(dir, fileName(f.path));
  if (!existsSync(p) || statSync(p).size !== f.size) return false;
  return sha256(readFileSync(p)) === f.sha256;
}

// 带超时地取一个文件，返回 Buffer；状态码不是 2xx 或超时都抛错
async function fetchBuf(fetchImpl, url, timeout) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeout);
  try {
    const r = await fetchImpl(url, { signal: ac.signal, redirect: 'follow' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return Buffer.from(await r.arrayBuffer());
  } finally {
    clearTimeout(timer);
  }
}

// 把缺的块下载进缓存。opts（都可省略，测试时用来替换）：
//   manifest 清单；dir 缓存目录；fetch 下载函数；log 输出函数；timeout 单文件超时；concurrency 并发数
// 返回 { ok, missing（失败的块的包内路径）, dir, total（块数）, bytes（总大小）, downloaded（本次下载了几块） }
export async function ensureCache(opts = {}) {
  const manifest = opts.manifest || loadManifest();
  const dir = opts.dir || cacheDir(manifest);
  const fetchImpl = opts.fetch || globalThis.fetch;
  const log = opts.log || (s => console.log(s));
  const timeout = opts.timeout || TIMEOUT;
  const total = manifest.files.length;
  const bytes = manifest.files.reduce((a, f) => a + f.size, 0);
  const done = { ok: true, missing: [], dir, total, bytes, downloaded: 0 };

  mkdirSync(dir, { recursive: true });
  const todo = manifest.files.filter(f => !cachedOk(f, dir));
  if (todo.length) {
    if (typeof fetchImpl !== 'function') throw userError('当前 Node 没有自带 fetch，下载不了字体。请升级到 Node 18 或以上。', 2);
    const need = todo.reduce((a, f) => a + f.size, 0);
    log(`正在下载霞鹜文楷完整字体：${todo.length} 块，${mb(need)}，存到 ${dir}`);

    const mirrors = manifest.mirrors;
    let order = mirrors.map((_, i) => i);    // 镜像的尝试顺序：失败的挪到最后
    const fails = mirrors.map(() => 0);      // 每个镜像连续失败的次数
    const demote = m => { order = order.filter(i => i !== m).concat(m); };

    let next = 0;
    let finished = 0;
    let shown = 0;
    const one = async f => {
      for (const m of order.slice()) {
        if (fails[m] >= DEAD_AFTER) continue;
        try {
          const buf = await fetchBuf(fetchImpl, mirrors[m] + f.path, timeout);
          if (buf.length !== f.size || sha256(buf) !== f.sha256) throw new Error('校验不对');
          const p = join(dir, fileName(f.path));
          writeFileSync(p + '.part', buf);   // 先写临时文件再改名，中途断掉不会留下半截的块
          renameSync(p + '.part', p);
          fails[m] = 0;
          return true;
        } catch (e) {
          fails[m]++;
          demote(m);
        }
      }
      return false;
    };
    const allDead = () => fails.every(n => n >= DEAD_AFTER);
    const worker = async () => {
      while (next < todo.length) {
        const f = todo[next++];
        if (await one(f)) done.downloaded++;
        else done.missing.push(f.path);
        finished++;
        // 块多时每过四分之一报一次进度，不刷屏；镜像全都不可用时不再报
        const q = Math.floor(finished * 4 / todo.length);
        if (todo.length >= 20 && q > shown && finished < todo.length && !allDead()) {
          shown = q;
          log(`  进度 ${finished}/${todo.length}`);
        }
      }
    };
    const n = Math.max(1, Math.min(opts.concurrency || CONCURRENCY, todo.length));
    await Promise.all(Array.from({ length: n }, worker));
    // 并发时完成顺序不定，按清单顺序排一下，方便看
    const pos = new Map(manifest.files.map((f, i) => [f.path, i]));
    done.missing.sort((a, b) => pos.get(a) - pos.get(b));
  }

  done.ok = done.missing.length === 0;
  if (done.ok) {
    writeFileSync(join(dir, 'wenkai.css'), buildCss(manifest, ''));
    const lic = join(TPL_FONTS, LICENSE);
    if (existsSync(lic)) copyFileSync(lic, join(dir, LICENSE));
  }
  return done;
}

// 把字体装进课件的 vendor/fonts/。opts：manifest、dir（缓存目录），测试时用来替换。
// 缓存完整且校验通过：复制全部切块到 vendor/fonts/wenkai/，写 vendor/fonts/wenkai.css，返回 'full'；
// 否则复制自带的小字库和 wenkai-lite.css，返回 'lite'。两种都带上许可证。只读本机缓存，不联网。
export function installFonts(deckDir, opts = {}) {
  const fontsDir = join(deckDir, 'vendor', 'fonts');
  mkdirSync(fontsDir, { recursive: true });
  copyFileSync(join(TPL_FONTS, LICENSE), join(fontsDir, LICENSE));

  let manifest = opts.manifest || null;
  if (!manifest) { try { manifest = loadManifest(); } catch (e) { manifest = null; } }
  const bufs = manifest ? readCache(manifest, opts.dir || cacheDir(manifest)) : null;
  if (bufs) {
    const blockDir = join(fontsDir, 'wenkai');
    mkdirSync(blockDir, { recursive: true });
    manifest.files.forEach((f, i) => writeFileSync(join(blockDir, fileName(f.path)), bufs[i]));
    writeFileSync(join(fontsDir, 'wenkai.css'), buildCss(manifest, 'wenkai/'));
    return 'full';
  }
  for (const f of LITE) copyFileSync(join(TPL_FONTS, f), join(fontsDir, f));
  return 'lite';
}

// 完整字体没装上时给用户的说明；failed 是失败的块数，不知道时省略
export function liteNotice(failed, deckDir) {
  const why = typeof failed === 'number' ? `完整字体没下载成功（${failed} 块失败）` : '完整字体还没下载好';
  return `${why}，先用自带的常用字小字库，个别字会显示成系统楷体。网络好了以后运行 fonts --into ${deckDir || '<课件目录>'} 补上。`;
}

// 命令入口：
//   fonts                     下载或检查本机缓存，打印块数、大小、存放位置
//   fonts --into <课件目录>   先补全缓存，再把完整字体装进课件，index.html 改用 wenkai.css
// 第二个参数只给测试用，和 ensureCache 的 opts 相同
export async function run(args = {}, opts = {}) {
  const log = opts.log || (s => console.log(s));
  if (args.into === true) throw userError('fonts --into 后面要写课件目录，比如：fonts --into ./我的分享');
  const into = typeof args.into === 'string' ? args.into : (args._ && args._[0]);
  let deck = null;
  if (into) {
    deck = resolve(String(into));
    if (!existsSync(join(deck, 'index.html'))) throw userError(`没找到课件：${deck} 里没有 index.html。请确认课件目录写对了。`);
  }

  const r = await ensureCache({ ...opts, log });
  if (!deck) {
    if (!r.ok) {
      log(`完整字体没下载成功（${r.missing.length} 块失败），做课件时先用自带的常用字小字库，个别字会显示成系统楷体。网络好了以后再运行 fonts 补上。`);
      return 2;
    }
    log(`完整字体已就绪：霞鹜文楷 常规和粗体，共 ${r.total} 块，${mb(r.bytes)}${r.downloaded ? `（本次下载 ${r.downloaded} 块）` : ''}。`);
    log(`存放位置：${r.dir}`);
    return 0;
  }

  const mode = installFonts(deck, opts);
  if (mode !== 'full') {
    log(liteNotice(r.missing.length, into));
    return 2;
  }
  const index = join(deck, 'index.html');
  const html = readFileSync(index, 'utf8');
  const next = html.replace(/vendor\/fonts\/wenkai-lite\.css/g, 'vendor/fonts/wenkai.css');
  if (next !== html) writeFileSync(index, next);
  log(`已把完整字体装进课件：vendor/fonts/wenkai/（${r.total} 块，${mb(r.bytes)}）。`);
  if (next !== html) log('index.html 已改用 vendor/fonts/wenkai.css。');
  else if (!html.includes('vendor/fonts/wenkai.css')) log('注意：index.html 里没找到字体样式的引用，请在 <head> 里加一行 <link rel="stylesheet" href="vendor/fonts/wenkai.css">。');
  return 0;
}
