#!/usr/bin/env node
// 把教程课件（skills/li-talk-skills/template/tour/）打成 GitHub Pages 用的独立网页目录，可选推到 gh-pages 分支
//   node pages.mjs            打包到 .pages/（git 不收），打开 .pages/index.html 就能看
//   node pages.mjs --deploy   打包后把 .pages/ 作为 gh-pages 分支强推到 origin（只动 gh-pages，不碰 master、dev）
//
// 教程在 skill 里是直接引用模板的（../engine/…、../scenes/…），网页上没有模板目录，所以这里：
//   1. 把 tour/ 整个复制过去（index.html、slides/、素材），index.html 里的 ../ 改成 ./
//   2. 顺着 index.html 引入的文件，以及这些 CSS 里 url(...) 引用的文件，把用到的模板文件原样复制到同样的相对位置
//   3. 加一个 .nojekyll（不让 GitHub Pages 用 Jekyll 处理，下划线开头的文件也能访问）
// 只用 Node 18 自带的模块。
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, readdirSync, statSync, rmSync } from 'node:fs';
import { dirname, join, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = dirname(fileURLToPath(import.meta.url));
const TPL = join(ROOT, 'skills', 'li-talk-skills', 'template');
const TOUR = join(TPL, 'tour');

const posix = p => p.split(sep).join('/');
const copy = (from, to) => { mkdirSync(dirname(to), { recursive: true }); copyFileSync(from, to); };

// 复制一个目录（跳过自检记录 .li-talk/）
function copyDir(from, to) {
  for (const n of readdirSync(from)) {
    if (n === '.li-talk') continue;
    const a = join(from, n), b = join(to, n);
    if (statSync(a).isDirectory()) copyDir(a, b); else copy(a, b);
  }
}

// CSS 里 url(...) 引用的本地文件（相对这个 CSS 文件）
const cssUrls = text => [...text.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)].map(m => m[2])
  .filter(u => !/^(data:|https?:|#|%23)/i.test(u)).map(u => u.split(/[?#]/)[0]);

/** 打包到 out，返回复制的模板文件清单（相对模板目录） */
export function buildPages(out = join(ROOT, '.pages')) {
  if (!existsSync(join(TOUR, 'index.html'))) throw new Error('找不到教程课件 ' + posix(join(TOUR, 'index.html')));
  rmSync(out, { recursive: true, force: true });
  copyDir(TOUR, out);
  const html = readFileSync(join(TOUR, 'index.html'), 'utf8');
  const refs = [...html.matchAll(/(?:href|src)="\.\.\/([^"]+)"/g)].map(m => m[1].split(/[?#]/)[0]);
  const done = new Set();
  const take = rel => {
    rel = posix(rel);
    if (done.has(rel)) return;
    const abs = join(TPL, ...rel.split('/'));
    if (!abs.startsWith(TPL) || !existsSync(abs)) throw new Error('教程引用的模板文件不存在：' + rel);
    done.add(rel);
    copy(abs, join(out, ...rel.split('/')));
    if (rel.endsWith('.css')) {
      for (const u of cssUrls(readFileSync(abs, 'utf8'))) take(relative(TPL, resolve(dirname(abs), u)));
    }
  };
  refs.forEach(take);
  writeFileSync(join(out, 'index.html'), html.replace(/(href|src)="\.\.\//g, '$1="./'));

  // 样册：教程里点风格小图会跳到 ../gallery.html?scene=键名。网页版把样册放在根目录，
  // 带上它引入的文件，加上它用 document.write 按风格引入的 samples/ 整个目录
  const gallery = readFileSync(join(TPL, 'gallery.html'), 'utf8');
  for (const m of gallery.matchAll(/(?:href|src)="([\w./-]+\.(?:css|js|svg|png|jpe?g|webp|woff2?))"/g)) take(m[1]);
  copyDir(join(TPL, 'samples'), join(out, 'samples'));
  writeFileSync(join(out, 'gallery.html'), gallery);
  // 教程章节里指向样册的链接：../gallery.html 改成 ./gallery.html
  const slides = join(out, 'slides');
  if (existsSync(slides)) {
    for (const n of readdirSync(slides)) {
      if (!/\.(js|css)$/.test(n)) continue;
      const p = join(slides, n), s = readFileSync(p, 'utf8');
      if (s.includes('../gallery.html')) writeFileSync(p, s.split('../gallery.html').join('./gallery.html'));
    }
  }
  writeFileSync(join(out, '.nojekyll'), '');
  return [...done].sort();
}

// 把 out 作为 gh-pages 分支强推到 origin：在 out 里建一个只有一个提交的临时仓库
function deploy(out) {
  const run = (args, cwd = out) => {
    const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
    if (r.status !== 0) throw new Error(`git ${args.join(' ')} 失败：${r.stderr || r.stdout}`);
    return r.stdout.trim();
  };
  const remote = run(['remote', 'get-url', 'origin'], ROOT);
  const head = run(['rev-parse', '--short', 'HEAD'], ROOT);
  run(['init', '-q', '-b', 'gh-pages']);
  run(['add', '-A']);
  run(['-c', 'user.name=li-talk-skills', '-c', 'user.email=li-talk-skills@users.noreply.github.com', 'commit', '-q', '-m', `教程网页（来自 ${head}）`]);
  run(['push', '-f', remote, 'gh-pages:gh-pages']);
  rmSync(join(out, '.git'), { recursive: true, force: true });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = join(ROOT, '.pages');
  const files = buildPages(out);
  console.log(`已打包到 ${posix(out)}：教程课件，加 ${files.length} 个模板文件`);
  if (process.argv.includes('--deploy')) {
    deploy(out);
    console.log('已推到 gh-pages 分支。');
  } else {
    console.log('打开 .pages/index.html 先看一遍；要发布就运行 node pages.mjs --deploy');
  }
}
