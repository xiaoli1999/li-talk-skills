// 开发用：从 npm 包 lxgw-wenkai-webfont 生成字体切块清单 fonts/wenkai.json
// 用法：node dev/fonts-manifest.mjs <解压后的 package 目录>
//   先在任意临时目录里 npm pack lxgw-wenkai-webfont@1.7.0 并解压，把里面的 package 目录传进来。
// 只取常规（400）和粗体（700）两个字重；清单里记下每块的包内路径、字重、unicode-range、sha256、大小，
// 用户机器上的 fonts 命令按它从镜像下载并校验，字体文件本身不进仓库。
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'fonts', 'wenkai.json');
// 包里两个字重各自的 CSS，以及 CSS 里应该写的 font-weight
const SHEETS = [
  { css: 'lxgwwenkai-regular.css', weight: 400 },
  { css: 'lxgwwenkai-bold.css', weight: 700 },
];

const pkgDir = process.argv[2];
if (!pkgDir) {
  console.error('用法：node dev/fonts-manifest.mjs <解压后的 package 目录>');
  process.exit(1);
}
const dir = resolve(pkgDir);
const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
if (pkg.name !== 'lxgw-wenkai-webfont') {
  console.error(`这不是 lxgw-wenkai-webfont 的包目录：package.json 里的名字是「${pkg.name}」`);
  process.exit(1);
}
const V = pkg.version;

// 取出 @font-face 块里某个属性的值（到分号或块尾为止）
function prop(block, name) {
  const m = block.match(new RegExp(name + '\\s*:\\s*([^;}]+)'));
  return m ? m[1].trim() : null;
}

const files = [];
const seen = new Set();
for (const s of SHEETS) {
  const css = readFileSync(join(dir, s.css), 'utf8');
  const blocks = css.match(/@font-face\s*\{[^}]*\}/g) || [];
  if (!blocks.length) throw new Error(s.css + ' 里没有 @font-face');
  for (const b of blocks) {
    const weight = Number(prop(b, 'font-weight'));
    const style = prop(b, 'font-style');
    const range = prop(b, 'unicode-range');
    const src = (prop(b, 'src') || '').match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/);
    if (weight !== s.weight) throw new Error(`${s.css} 里出现了字重 ${weight}，预期 ${s.weight}`);
    if (style && style !== 'normal') throw new Error(`${s.css} 里出现了 font-style: ${style}`);
    if (!range) throw new Error(`${s.css} 有一块没写 unicode-range`);
    if (!src) throw new Error(`${s.css} 有一块没写 src`);
    const path = src[1].replace(/^\.\//, '');
    if (!/^files\/[\w.-]+\.woff2$/.test(path)) throw new Error('意外的字体路径：' + src[1]);
    if (seen.has(path)) throw new Error('字体路径重复：' + path);
    seen.add(path);
    const abs = join(dir, path);
    if (!existsSync(abs)) throw new Error('CSS 引用的文件不存在：' + path);
    const buf = readFileSync(abs);
    files.push({
      path,
      weight,
      range: range.replace(/\s+/g, ' '),
      sha256: createHash('sha256').update(buf).digest('hex'),
      size: buf.length,
    });
  }
}

// 用户机器上取文件时用文件名本身，不同目录下不能有同名文件
const names = new Set(files.map(f => f.path.split('/').pop()));
if (names.size !== files.length) throw new Error('有同名的字体文件，展平到一个目录会互相覆盖');

const manifest = {
  package: pkg.name,
  version: V,
  family: 'WK',
  mirrors: [
    `https://cdn.jsdelivr.net/npm/${pkg.name}@${V}/`,
    `https://registry.npmmirror.com/${pkg.name}/${V}/files/`,
    `https://unpkg.com/${pkg.name}@${V}/`,
  ],
  files,
};

// 每块单独一行，方便看 diff；其余字段正常缩进
const head = JSON.stringify({ ...manifest, files: [] }, null, 2).replace(/\n {2}"files": \[\]\n\}$/, '');
const body = files.map(f => '    ' + JSON.stringify(f)).join(',\n');
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${head}\n  "files": [\n${body}\n  ]\n}\n`);
JSON.parse(readFileSync(OUT, 'utf8')); // 写完自查一遍是合法 JSON

const mb = n => (n / 1024 / 1024).toFixed(2) + ' MB';
const sum = list => list.reduce((a, f) => a + f.size, 0);
console.log(`已生成 fonts/wenkai.json：${pkg.name}@${V}`);
for (const s of SHEETS) {
  const list = files.filter(f => f.weight === s.weight);
  console.log(`  字重 ${s.weight}：${list.length} 块，${mb(sum(list))}`);
}
console.log(`  合计 ${files.length} 块，${mb(sum(files))}`);
