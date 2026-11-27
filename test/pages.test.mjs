// pages.mjs：打 GitHub Pages 网站。根目录是介绍页，tour/ 是教程课件，gallery.html 是样册；引用的文件都在目录里
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPages } from '../pages.mjs';

const made = [];
after(() => { for (const d of made) rmSync(d, { recursive: true, force: true }); });
const TPL = join(dirname(fileURLToPath(import.meta.url)), '..', 'skills', 'li-talk-skills', 'template');

// html 里 href/src 引用的本地文件（相对这个 html 所在目录），都要在打包目录里，不能指到网站外面
function assertRefs(out, rel) {
  const html = readFileSync(join(out, ...rel.split('/')), 'utf8');
  const base = posix.dirname(rel);
  for (const m of html.matchAll(/(?:href|src)="([^"#?]*)[^"]*"/g)) {
    const u = m[1];
    if (u === '' || /^(https?:|data:|mailto:)/.test(u) || /['+]/.test(u)) continue;   // 脚本里拼出来的地址（' + b + '.css）不算
    const target = posix.normalize(posix.join(base, u.endsWith('/') ? u + 'index.html' : u));
    assert.ok(!target.startsWith('..'), `${rel} 引用到网站外面：${u}`);
    assert.ok(existsSync(join(out, ...target.split('/'))), `${rel} 缺文件：${u}`);
  }
  return html;
}

let out;
test('网站打包：教程在 tour/，样册在根目录，引用的文件（含 CSS 里 url() 用到的字体、图标）都带上', () => {
  out = join(mkdtempSync(join(tmpdir(), 'li-talk-pages-')), 'site');
  made.push(dirname(out));
  const files = buildPages(out);
  assert.ok(files.length > 5, '至少带上引擎、风格、形象');
  assertRefs(out, 'tour/index.html');
  assertRefs(out, 'gallery.html');
  assert.ok(existsSync(join(out, '.nojekyll')));
  assert.ok(!existsSync(join(out, 'tour', '.li-talk')), '自检记录不带上去');
});

test('介绍页：在根目录，链到教程和样册，风格清单从 scenes/index.json 填进去，每种风格都有截图', () => {
  const html = assertRefs(out, 'index.html');
  assert.match(html, /href="tour\/"/);
  assert.match(html, /href="gallery\.html"/);
  assert.doesNotMatch(html, /\/\*LT_STYLES\*\/\[\]/, '占位要换成真的清单');
  assert.doesNotMatch(html, /\/\*WC_ASSETS\*\//, '水彩素材的占位要换掉');
  for (const v of ['--wc-pad1:url(', '--wc-blob:url(', '--wc-brush1:url(', '--wc-paper-bg:']) assert.ok(html.includes(v), '缺水彩素材 ' + v);
  const m = /window\.LT_STYLES = (\[.*?\]);<\/script>/s.exec(html);
  assert.ok(m, '找到风格清单');
  const styles = JSON.parse(m[1]);
  const want = JSON.parse(readFileSync(join(TPL, 'scenes', 'index.json'), 'utf8')).map(s => s.key);
  assert.deepEqual(styles.map(s => s.key), want);
  for (const s of styles) {
    assert.ok(s.label && s.family && s.fit, JSON.stringify(s));
    assert.ok(existsSync(join(out, 'img', 'styles', s.key + '.jpg')), '缺截图：' + s.key);
  }
  assert.ok(existsSync(join(out, 'img', 'edit.jpg')));
});

test('网站上的教程和样册带「体验编辑」标记（按 E 能试着改，不存）；模板里的原文件不带，本机打开照常编辑', () => {
  const META = '<meta name="li-talk-edit" content="demo">';
  for (const rel of ['tour/index.html', 'gallery.html']) {
    assert.ok(readFileSync(join(out, ...rel.split('/')), 'utf8').includes(META), rel + ' 要带体验编辑的标记');
    assert.ok(!readFileSync(join(TPL, ...rel.split('/')), 'utf8').includes(META), '模板里的 ' + rel + ' 不能带');
  }
  assert.ok(existsSync(join(out, 'img', 'edit.gif')), '介绍页的编辑动图');
});
