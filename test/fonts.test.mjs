// 字体：清单、CSS 生成、下载缓存（假的 fetch，不联网）、装进课件
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync, mkdtempSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { buildCss, sha256, ensureCache, installFonts, run } from '../skills/li-talk-skills/scripts/lib/fonts.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(ROOT, 'fonts', 'wenkai.json'), 'utf8'));

test('清单有常规和粗体，每块都有校验值', () => {
  assert.equal(manifest.family, 'WK');
  assert.ok(manifest.files.some(f => f.weight === 400));
  assert.ok(manifest.files.some(f => f.weight === 700));
  for (const f of manifest.files) assert.match(f.sha256, /^[0-9a-f]{64}$/);
});

test('清单的镜像和每块的字段齐全，文件名不重复', () => {
  assert.equal(manifest.mirrors.length, 3);
  for (const m of manifest.mirrors) assert.match(m, /^https:\/\/.+\/$/);
  const names = new Set();
  for (const f of manifest.files) {
    assert.ok([400, 700].includes(f.weight), '只要常规和粗体：' + f.path);
    assert.match(f.range, /^U\+[0-9a-f]/i);
    assert.ok(f.size > 0);
    names.add(f.path.split('/').pop());
  }
  assert.equal(names.size, manifest.files.length);
});

test('生成的 CSS 每块一个 @font-face，路径指向课件里的 wenkai 目录', () => {
  const css = buildCss(manifest, 'wenkai/');
  assert.equal((css.match(/@font-face/g) || []).length, manifest.files.length);
  assert.match(css, /font-family:\s*"WK"/);
  assert.match(css, /unicode-range:/);
  assert.match(css, /url\("wenkai\//);
  assert.match(css, /font-display:\s*swap/);
  assert.doesNotMatch(css, /url\("wenkai\/files\//, 'url 里不带包里的目录');
});

test('sha256', () => {
  assert.equal(sha256(Buffer.from('abc')), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

// ---- 下面用两块假字体和假的 fetch，不联网 ----

const made = [];
const tmp = () => { const d = mkdtempSync(join(tmpdir(), 'li-talk-fonts-')); made.push(d); return d; };
after(() => { for (const d of made) rmSync(d, { recursive: true, force: true }); });
const A = Buffer.from('假字体 A：常规');
const B = Buffer.from('假字体 B：粗体');
const fake = {
  package: 'fake-font', version: '0.0.1', family: 'WK',
  mirrors: ['https://m1.test/', 'https://m2.test/', 'https://m3.test/'],
  files: [
    { path: 'files/a-400.woff2', weight: 400, range: 'U+4e00-4e2f', sha256: sha256(A), size: A.length },
    { path: 'files/b-700.woff2', weight: 700, range: 'U+4e30-4e5f', sha256: sha256(B), size: B.length },
  ],
};
const body = { 'files/a-400.woff2': A, 'files/b-700.woff2': B };
const res = buf => ({ ok: true, status: 200, arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length) });
const quiet = () => {};

test('ensureCache：第一个镜像内容不对就换下一个，校验通过才落盘，并生成 wenkai.css', async () => {
  const dir = join(tmp(), 'cache');
  const calls = [];
  const fetch = async url => {
    calls.push(url);
    if (url.startsWith('https://m1.test/')) return res(Buffer.from('被篡改的内容'));
    return res(body[url.replace('https://m2.test/', '')]);
  };
  const r = await ensureCache({ manifest: fake, dir, fetch, log: quiet, concurrency: 1 });
  assert.equal(r.ok, true);
  assert.deepEqual(r.missing, []);
  assert.deepEqual(readFileSync(join(dir, 'a-400.woff2')), A);
  assert.deepEqual(readFileSync(join(dir, 'b-700.woff2')), B);
  assert.match(readFileSync(join(dir, 'wenkai.css'), 'utf8'), /url\("a-400\.woff2"\)/);
  // 第一块先试 m1 失败再到 m2；之后 m1 被挪到最后，第二块直接从 m2 取
  assert.deepEqual(calls, ['https://m1.test/files/a-400.woff2', 'https://m2.test/files/a-400.woff2', 'https://m2.test/files/b-700.woff2']);
  assert.ok(!readdirSync(dir).some(f => f.endsWith('.part')), '不留下半截文件');

  // 缓存已完整：不再联网
  const again = await ensureCache({ manifest: fake, dir, fetch: async () => { throw new Error('不该联网'); }, log: quiet });
  assert.equal(again.ok, true);
  assert.equal(again.downloaded, 0);
});

test('ensureCache：三个镜像都失败时记下失败的块', async () => {
  const dir = join(tmp(), 'cache');
  const fetch = async url => {
    if (url.includes('a-400')) return res(A);
    if (url.startsWith('https://m2.test/')) return { ok: false, status: 404, arrayBuffer: async () => new ArrayBuffer(0) };
    throw new Error('连不上');
  };
  const r = await ensureCache({ manifest: fake, dir, fetch, log: quiet, concurrency: 1 });
  assert.equal(r.ok, false);
  assert.deepEqual(r.missing, ['files/b-700.woff2']);
  assert.ok(existsSync(join(dir, 'a-400.woff2')), '成功的块照样留着，下次只补缺的');
  assert.ok(!existsSync(join(dir, 'b-700.woff2')));
  assert.ok(!existsSync(join(dir, 'wenkai.css')), '不完整时不生成 wenkai.css');
});

test('ensureCache：镜像一直没响应时按超时放弃，不卡住', async () => {
  const dir = join(tmp(), 'cache');
  const fetch = (url, { signal }) => new Promise((_, reject) => {
    signal.addEventListener('abort', () => reject(new Error('超时')));
  });
  const t = Date.now();
  const r = await ensureCache({ manifest: fake, dir, fetch, log: quiet, timeout: 50 });
  assert.equal(r.ok, false);
  assert.equal(r.missing.length, 2);
  assert.ok(Date.now() - t < 3000);
});

test('installFonts：缓存不完整时退回自带的小字库', () => {
  const deck = tmp();
  const dir = join(tmp(), 'cache'); // 空缓存
  assert.equal(installFonts(deck, { manifest: fake, dir }), 'lite');
  for (const f of ['wenkai-lite.css', 'wenkai-lite-regular.woff2', 'wenkai-lite-bold.woff2', 'OFL-LXGW-WenKai.txt']) {
    assert.ok(existsSync(join(deck, 'vendor', 'fonts', f)), '缺少 vendor/fonts/' + f);
  }
  assert.ok(!existsSync(join(deck, 'vendor', 'fonts', 'wenkai.css')));
});

test('installFonts：缓存里有块但校验不对也退回小字库', () => {
  const deck = tmp();
  const dir = join(tmp(), 'cache');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'a-400.woff2'), A);
  writeFileSync(join(dir, 'b-700.woff2'), Buffer.from('坏的'));
  assert.equal(installFonts(deck, { manifest: fake, dir }), 'lite');
});

test('installFonts：缓存完整时复制全部切块并写 wenkai.css', () => {
  const deck = tmp();
  const dir = join(tmp(), 'cache');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'a-400.woff2'), A);
  writeFileSync(join(dir, 'b-700.woff2'), B);
  assert.equal(installFonts(deck, { manifest: fake, dir }), 'full');
  const fonts = join(deck, 'vendor', 'fonts');
  assert.deepEqual(readFileSync(join(fonts, 'wenkai', 'a-400.woff2')), A);
  assert.deepEqual(readFileSync(join(fonts, 'wenkai', 'b-700.woff2')), B);
  assert.ok(existsSync(join(fonts, 'OFL-LXGW-WenKai.txt')));
  const css = readFileSync(join(fonts, 'wenkai.css'), 'utf8');
  assert.match(css, /url\("wenkai\/a-400\.woff2"\)/);
  assert.match(css, /font-weight: 700/);
});

test('fonts --into：下载完整后装进课件，并把 index.html 改用 wenkai.css', async () => {
  const deck = tmp();
  writeFileSync(join(deck, 'index.html'), '<link rel="stylesheet" href="vendor/fonts/wenkai-lite.css">\n');
  installFonts(deck, { manifest: fake, dir: join(tmp(), 'empty') }); // 先是小字库
  const dir = join(tmp(), 'cache');
  const fetch = async url => res(body[url.replace('https://m1.test/', '')]);
  const logs = [];
  const code = await run({ _: [], into: deck }, { manifest: fake, dir, fetch, log: s => logs.push(s) });
  assert.equal(code, 0);
  assert.equal(readFileSync(join(deck, 'index.html'), 'utf8'), '<link rel="stylesheet" href="vendor/fonts/wenkai.css">\n');
  assert.ok(existsSync(join(deck, 'vendor', 'fonts', 'wenkai', 'b-700.woff2')));
  assert.match(logs.join('\n'), /完整字体/);
});

test('fonts --into：下载失败时提示用小字库，退出码 2', async () => {
  const deck = tmp();
  writeFileSync(join(deck, 'index.html'), '<link rel="stylesheet" href="vendor/fonts/wenkai-lite.css">\n');
  const logs = [];
  const code = await run({ _: [], into: deck }, {
    manifest: fake, dir: join(tmp(), 'cache'), fetch: async () => { throw new Error('断网'); }, log: s => logs.push(s),
  });
  assert.equal(code, 2);
  assert.match(logs.join('\n'), /完整字体没下载成功（2 块失败），先用自带的常用字小字库/);
  assert.match(readFileSync(join(deck, 'index.html'), 'utf8'), /wenkai-lite\.css/);
});

test('fonts --into：课件目录不对时给中文说明', async () => {
  await assert.rejects(() => run({ _: [], into: join(tmp(), '不存在') }, { manifest: fake, log: quiet }),
    e => /没找到课件/.test(e.userMessage));
  await assert.rejects(() => run({ _: [], into: true }, { manifest: fake, log: quiet }),
    e => /--into 后面/.test(e.userMessage));
});
