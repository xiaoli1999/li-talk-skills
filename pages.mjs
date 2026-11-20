#!/usr/bin/env node
// 打包 GitHub Pages 网站：根目录是介绍页（site/index.html），tour/ 是教程课件，gallery.html 是样册；可选推到 gh-pages 分支
//   node pages.mjs            打包到 .pages/（git 不收），打开 .pages/index.html 就能看
//   node pages.mjs --deploy   打包后把 .pages/ 作为 gh-pages 分支强推到 origin（只动 gh-pages，不碰 master、dev）
//
// 网站目录照模板目录的样子摆：
//   1. 教程课件 tour/ 整个复制到 tour/（它引用的 ../engine/…、../scenes/…、../gallery.html 正好指到网站根目录，不用改路径）
//   2. 顺着教程和样册引入的文件，以及这些 CSS 里 url(...) 引用的文件，把用到的模板文件原样复制到根目录同样的相对位置
//   3. 介绍页 site/index.html 放到根目录：填上风格清单（scenes/index.json 加上每个形象的名字），图片从 docs/images 复制到 img/
//   4. 加一个 .nojekyll（不让 GitHub Pages 用 Jekyll 处理，下划线开头的文件也能访问）
// 只用 Node 18 自带的模块。
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, readdirSync, statSync, rmSync } from 'node:fs';
import { dirname, join, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = dirname(fileURLToPath(import.meta.url));
const TPL = join(ROOT, 'skills', 'li-talk-skills', 'template');
const TOUR = join(TPL, 'tour');
const SITE = join(ROOT, 'site');
const IMAGES = join(ROOT, 'docs', 'images');

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
  copyDir(TOUR, join(out, 'tour'));
  const done = new Set();
  const take = rel => {
    rel = posix(rel);
    if (done.has(rel)) return;
    const abs = join(TPL, ...rel.split('/'));
    if (!abs.startsWith(TPL) || !existsSync(abs)) throw new Error('教程或样册引用的模板文件不存在：' + rel);
    done.add(rel);
    copy(abs, join(out, ...rel.split('/')));
    if (rel.endsWith('.css')) {
      for (const u of cssUrls(readFileSync(abs, 'utf8'))) take(relative(TPL, resolve(dirname(abs), u)));
    }
  };
  // 教程引用的模板文件（../ 开头），gallery.html 单独处理
  const html = readFileSync(join(TOUR, 'index.html'), 'utf8');
  for (const m of html.matchAll(/(?:href|src)="\.\.\/([^"]+)"/g)) {
    const rel = m[1].split(/[?#]/)[0];
    if (rel !== 'gallery.html') take(rel);
  }

  // 样册：教程里点风格小图会跳到 ../gallery.html?scene=键名，也就是网站根目录的 gallery.html；
  // 带上它引入的文件，加上它用 document.write 按风格引入的 samples/ 整个目录
  const gallery = readFileSync(join(TPL, 'gallery.html'), 'utf8');
  for (const m of gallery.matchAll(/(?:href|src)="([\w./-]+\.(?:css|js|svg|png|jpe?g|webp|woff2?))"/g)) take(m[1]);
  copyDir(join(TPL, 'samples'), join(out, 'samples'));
  writeFileSync(join(out, 'gallery.html'), gallery);

  buildSite(out);
  writeFileSync(join(out, '.nojekyll'), '');
  return [...done].sort();
}

/** 介绍页：填风格清单，复制图片（每种风格一张样板截图 docs/images/styles/<键名>.jpg，缺了就报错） */
function buildSite(out) {
  const page = readFileSync(join(SITE, 'index.html'), 'utf8');
  const styles = JSON.parse(readFileSync(join(TPL, 'scenes', 'index.json'), 'utf8')).map(s => {
    let mascotLabel = '';
    const mf = join(TPL, 'mascots', s.mascot + '.js');
    if (existsSync(mf)) {
      const m = /label:\s*'([^']+)'/.exec(readFileSync(mf, 'utf8'));
      if (m) mascotLabel = m[1];
    }
    return { key: s.key, label: s.label, family: s.family, fit: s.fit, mascotLabel };
  });
  for (const s of styles) {
    const img = join(IMAGES, 'styles', s.key + '.jpg');
    if (!existsSync(img)) throw new Error('介绍页缺这种风格的截图：' + posix(relative(ROOT, img)));
    copy(img, join(out, 'img', 'styles', s.key + '.jpg'));
  }
  for (const n of ['hero.jpg', 'edit.jpg']) copy(join(IMAGES, n), join(out, 'img', n));
  const SLOT = '/*LT_STYLES*/[]';
  if (!page.includes(SLOT)) throw new Error('site/index.html 里找不到风格清单的占位 ' + SLOT);
  // JSON 里的 < 写成 <：说明文字里万一有 </script> 也不会提前结束脚本
  const json = JSON.stringify(styles).replace(/</g, '\\u003c');
  writeFileSync(join(out, 'index.html'), page.replace(SLOT, () => json));
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
  run(['-c', 'user.name=li-talk-skills', '-c', 'user.email=li-talk-skills@users.noreply.github.com', 'commit', '-q', '-m', `介绍页和教程网页（来自 ${head}）`]);
  run(['push', '-f', remote, 'gh-pages:gh-pages']);
  rmSync(join(out, '.git'), { recursive: true, force: true });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = join(ROOT, '.pages');
  const files = buildPages(out);
  console.log(`已打包到 ${posix(out)}：介绍页、教程课件（tour/）、样册，加 ${files.length} 个模板文件`);
  if (process.argv.includes('--deploy')) {
    deploy(out);
    console.log('已推到 gh-pages 分支。');
  } else {
    console.log('打开 .pages/index.html 先看一遍；要发布就运行 node pages.mjs --deploy');
  }
}
