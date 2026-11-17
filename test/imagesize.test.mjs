// 读图片宽高：只看文件头，支持 PNG、GIF、JPEG、WebP
// JPEG、WebP 用浏览器 canvas 生成的 4×3 真图（test/fixtures/img/）；
// 其中 4x3-vp8.webp、4x3-vp8l.webp 是把 canvas 生成的 WebP 里的 VP8 / VP8L 块拆出来、包成最简单的格式（浏览器能正常解码）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { imageSize } from '../skills/li-talk-skills/scripts/lib/imagesize.mjs';

const IMG = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'img');
const img = f => readFileSync(join(IMG, f));

test('读 PNG 的宽高', () => {
  const b = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.write('IHDR', 12, 'ascii');
  b.writeUInt32BE(1280, 16);
  b.writeUInt32BE(720, 20);
  assert.deepEqual(imageSize(b), { type: 'png', w: 1280, h: 720 });
});

test('读 GIF 的宽高', () => {
  const b = Buffer.alloc(10);
  b.write('GIF89a', 0, 'ascii');
  b.writeUInt16LE(320, 6);
  b.writeUInt16LE(200, 8);
  assert.deepEqual(imageSize(b), { type: 'gif', w: 320, h: 200 });
});

test('认不出的格式返回 null', () => assert.equal(imageSize(Buffer.from('hello')), null));

test('读 JPEG 的宽高（浏览器生成的真图，前面有 APP0、ICC、量化表）', () => {
  assert.deepEqual(imageSize(img('4x3.jpg')), { type: 'jpeg', w: 4, h: 3 });
});

test('读 WebP 的宽高：VP8、VP8L、VP8X 三种头', () => {
  assert.deepEqual(imageSize(img('4x3-vp8.webp')), { type: 'webp', w: 4, h: 3 });
  assert.deepEqual(imageSize(img('4x3-vp8l.webp')), { type: 'webp', w: 4, h: 3 });
  assert.deepEqual(imageSize(img('4x3-vp8x.webp')), { type: 'webp', w: 4, h: 3 });
});

// 手写一个只有文件头的 JPEG：segments 是 [标记, 内容] 的列表
function jpeg(segments) {
  const parts = [Buffer.from([0xff, 0xd8])];
  for (const [marker, body] of segments) {
    const len = Buffer.alloc(2);
    len.writeUInt16BE(body.length + 2);
    parts.push(Buffer.from([0xff, marker]), len, body);
  }
  return Buffer.concat(parts);
}
// SOF 段的内容：精度、高、宽、分量数
const sof = (w, h) => { const b = Buffer.alloc(6); b[0] = 8; b.writeUInt16BE(h, 1); b.writeUInt16BE(w, 3); b[5] = 3; return b; };

test('JPEG：跳过 DHT（0xC4）等不是帧头的段，认渐进式的 SOF2', () => {
  const b = jpeg([[0xc4, Buffer.alloc(20)], [0xcc, Buffer.alloc(4)], [0xc2, sof(1920, 1080)]]);
  assert.deepEqual(imageSize(b), { type: 'jpeg', w: 1920, h: 1080 });
});

test('JPEG：EXIF 里写了旋转 90°（手机竖拍）时宽高对调，和浏览器显示的一致', () => {
  // TIFF 头（大端）+ 一个 IFD，里面只有方向这一项，值是 6（顺时针转 90°）
  const exif = Buffer.concat([
    Buffer.from('Exif\0\0', 'binary'),
    Buffer.from([0x4d, 0x4d, 0x00, 0x2a, 0, 0, 0, 8]),
    Buffer.from([0, 1, 0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, 6, 0, 0, 0, 0, 0, 0]),
  ]);
  const b = jpeg([[0xe1, exif], [0xc0, sof(4032, 3024)]]);
  assert.deepEqual(imageSize(b), { type: 'jpeg', w: 3024, h: 4032 });
});

test('文件头不完整时返回 null，不抛错', () => {
  assert.equal(imageSize(img('4x3.jpg').subarray(0, 200)), null);
  assert.equal(imageSize(img('4x3-vp8.webp').subarray(0, 24)), null);
  assert.equal(imageSize(Buffer.from([0x89, 0x50, 0x4e, 0x47])), null);
  assert.equal(imageSize(Buffer.alloc(0)), null);
});
