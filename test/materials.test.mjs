// materials：列素材清单（文字字数、图片尺寸、视频大小），生成截图说明表
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { run, textCount } from '../skills/li-talk-skills/scripts/lib/materials.mjs';

const IMG = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'img');
const made = [];
const tmp = () => { const d = mkdtempSync(join(tmpdir(), 'li-talk-mat-')); made.push(d); return d; };
after(() => { for (const d of made) rmSync(d, { recursive: true, force: true }); });

// 只有文件头的 PNG（够读宽高）
function png(w, h) {
  const b = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.write('IHDR', 12, 'ascii');
  b.writeUInt32BE(w, 16);
  b.writeUInt32BE(h, 20);
  return b;
}

// 跑 materials，收集输出
async function runMat(dir) {
  const lines = [];
  const code = await run({ _: [dir] }, { log: s => lines.push(s) });
  return { code, out: lines.join('\n') };
}

test('列出文字字数和图片尺寸，生成截图说明表', async () => {
  const dir = join(tmp(), '素材');
  mkdirSync(dir);
  writeFileSync(join(dir, '笔记.md'), '# 笔记\n\n今天讲怎么泡茶。Use hot water.\n');
  writeFileSync(join(dir, '登录页.png'), png(1280, 720));
  const { code, out } = await runMat(dir);
  assert.equal(code, 0);
  assert.match(out, /笔记\.md/);
  assert.match(out, /约 \d+ 字/);
  assert.match(out, /登录页\.png.*1280×720/);
  const note = join(dir, '截图说明.md');
  assert.ok(existsSync(note), '应该生成截图说明.md');
  const md = readFileSync(note, 'utf8');
  assert.match(md, /\| 文件 \| 尺寸 \| 这是什么 \| 放在讲哪块的时候用 \|/);
  assert.match(md, /\| 登录页\.png \| 1280×720 \|  \|  \|/);
  assert.match(out, /原图/);
  assert.match(out, /敏感信息/);
  // 截图说明.md 自己不算文字材料
  assert.doesNotMatch(out.split('已生成')[0], /截图说明\.md/);
});

test('字数：中文按字、英文按词', () => {
  assert.equal(textCount('今天讲怎么泡茶。Use hot water.'), 7 + 3);
  assert.equal(textCount('**重点**：第 2 步'), 4 + 1);
});

test('子目录里的图、JPEG 和 WebP 都认；Word、PDF 提示导出成文字；视频给大小', async () => {
  const dir = join(tmp(), '素材');
  mkdirSync(join(dir, '截图'), { recursive: true });
  copyFileSync(join(IMG, '4x3.jpg'), join(dir, '截图', 'a.jpg'));
  copyFileSync(join(IMG, '4x3-vp8x.webp'), join(dir, '截图', 'b.webp'));
  writeFileSync(join(dir, '方案.docx'), 'x');
  writeFileSync(join(dir, '报告.pdf'), 'x');
  writeFileSync(join(dir, '演示.mp4'), Buffer.alloc(3 * 1024 * 1024));
  writeFileSync(join(dir, '录屏.mov'), Buffer.alloc(1024));
  writeFileSync(join(dir, '.DS_Store'), 'x');
  const { out } = await runMat(dir);
  assert.match(out, /截图\/a\.jpg.*4×3/);
  assert.match(out, /截图\/b\.webp.*4×3/);
  assert.match(out, /方案\.docx.*AI 可能读不了，请导出成文字/);
  assert.match(out, /报告\.pdf.*AI 可能读不了，请导出成文字/);
  assert.match(out, /演示\.mp4.*3\.0 MB/);
  assert.match(out, /录屏\.mov.*mp4/, '浏览器放不了的视频格式要提醒转成 mp4');
  assert.doesNotMatch(out, /DS_Store/);
  const md = readFileSync(join(dir, '截图说明.md'), 'utf8');
  assert.match(md, /\| 截图\/a\.jpg \| 4×3 \|/);
});

test('截图说明.md 已经有了就不覆盖，只列出还没写进表里的图', async () => {
  const dir = tmp();
  writeFileSync(join(dir, 'a.png'), png(100, 50));
  writeFileSync(join(dir, 'b.png'), png(200, 80));
  writeFileSync(join(dir, '截图说明.md'), '| a.png | 100×50 | 首页 | 开场 |\n');
  const { out } = await runMat(dir);
  assert.equal(readFileSync(join(dir, '截图说明.md'), 'utf8'), '| a.png | 100×50 | 首页 | 开场 |\n');
  assert.match(out, /截图说明\.md 已经有了/);
  assert.match(out, /b\.png/);
  assert.match(out.split('已经有了')[1], /b\.png/);
  assert.doesNotMatch(out.split('已经有了')[1], /a\.png/);
});

test('没有图片时不生成截图说明表；不是 UTF-8 的文字文件给提醒', async () => {
  const dir = tmp();
  writeFileSync(join(dir, '提纲.txt'), Buffer.from([0xc4, 0xe3, 0xba, 0xc3, 0x0a]));   // GBK 编码的「你好」
  const { out } = await runMat(dir);
  assert.ok(!existsSync(join(dir, '截图说明.md')));
  assert.match(out, /提纲\.txt.*UTF-8/);
});

test('素材目录在课件目录里时，下一步提示对课件目录运行 guide', async () => {
  const deck = join(tmp(), '我的分享');
  mkdirSync(join(deck, '素材'), { recursive: true });
  writeFileSync(join(deck, '讲稿.md'), '# 我的分享\n');
  writeFileSync(join(deck, '素材', 'a.md'), '你好');
  const { out } = await runMat(join(deck, '素材'));
  assert.match(out, /guide/);
  assert.ok(out.includes(deck.replace(/\\/g, '/')), out);
});

test('目录不存在、没写目录时报中文错误', async () => {
  await assert.rejects(() => run({ _: [] }, { log() {} }), /materials 后面要写素材目录/);
  await assert.rejects(() => run({ _: [join(tmp(), '没有')] }, { log() {} }), /找不到素材目录/);
});

test('空目录也能跑，说明还没有素材', async () => {
  const { code, out } = await runMat(tmp());
  assert.equal(code, 0);
  assert.match(out, /还没有素材/);
});
