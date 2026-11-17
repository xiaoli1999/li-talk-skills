// 读图片的宽高：只看文件头，不解码，不装任何包。支持 PNG、GIF、JPEG、WebP。
// 返回 { type: 'png' | 'gif' | 'jpeg' | 'webp', w, h }；认不出、文件头不完整时返回 null，不抛错。

/**
 * @param {Buffer|Uint8Array} input 图片文件的内容（至少要包含文件头；JPEG 要读到帧头那一段）
 */
export function imageSize(input) {
  if (!input || !input.length) return null;
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input.buffer, input.byteOffset, input.length);
  try {
    return png(b) || gif(b) || jpeg(b) || webp(b);
  } catch (e) {
    return null;   // 读越界等：当成认不出
  }
}

const ok = (type, w, h) => (w > 0 && h > 0 ? { type, w, h } : null);

// PNG：8 字节签名，紧接着 IHDR 块，宽、高是大端 32 位
function png(b) {
  if (b.length < 24 || b.readUInt32BE(0) !== 0x89504e47 || b.readUInt32BE(4) !== 0x0d0a1a0a) return null;
  if (b.toString('ascii', 12, 16) !== 'IHDR') return null;
  return ok('png', b.readUInt32BE(16), b.readUInt32BE(20));
}

// GIF：GIF87a / GIF89a，宽、高是小端 16 位
function gif(b) {
  if (b.length < 10) return null;
  const sig = b.toString('ascii', 0, 6);
  if (sig !== 'GIF87a' && sig !== 'GIF89a') return null;
  return ok('gif', b.readUInt16LE(6), b.readUInt16LE(8));
}

// JPEG：逐段找帧头 SOF0–SOF15（0xC0–0xCF），其中 0xC4（哈夫曼表）、0xC8（保留）、0xCC（算术编码表）不是帧头。
// 顺带读 EXIF 里的方向：方向 5–8 表示转了 90°（手机竖拍常见），浏览器显示时会转过来，所以宽高对调。
function jpeg(b) {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  let orientation = 1;
  while (i + 3 < b.length) {
    if (b[i] !== 0xff) { i++; continue; }               // 不在标记上：往后找
    const m = b[i + 1];
    if (m === 0xff) { i++; continue; }                   // 填充字节
    if (m === 0x01 || m === 0xd8 || (m >= 0xd0 && m <= 0xd7)) { i += 2; continue; }   // 没有长度的标记
    if (m === 0xd9 || m === 0xda) return null;           // 到了图像数据或结尾还没见到帧头
    const len = b.readUInt16BE(i + 2);
    if (len < 2) return null;
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      if (i + 9 > b.length) return null;
      const h = b.readUInt16BE(i + 5);
      const w = b.readUInt16BE(i + 7);
      return orientation >= 5 && orientation <= 8 ? ok('jpeg', h, w) : ok('jpeg', w, h);
    }
    if (m === 0xe1 && len >= 16 && i + 10 <= b.length && b.toString('binary', i + 4, i + 10) === 'Exif\0\0') {
      orientation = exifOrientation(b, i + 10, Math.min(b.length, i + 2 + len));
    }
    i += 2 + len;
  }
  return null;
}

// EXIF 的 TIFF 头里第一个 IFD 的方向（标签 0x0112）；读不到就当 1（不转）
function exifOrientation(b, start, end) {
  if (start + 8 > end) return 1;
  const order = b.toString('ascii', start, start + 2);
  const le = order === 'II';
  if (!le && order !== 'MM') return 1;
  const u16 = o => (le ? b.readUInt16LE(o) : b.readUInt16BE(o));
  const u32 = o => (le ? b.readUInt32LE(o) : b.readUInt32BE(o));
  if (u16(start + 2) !== 42) return 1;
  const ifd = start + u32(start + 4);
  if (ifd + 2 > end) return 1;
  const n = u16(ifd);
  for (let k = 0; k < n; k++) {
    const e = ifd + 2 + k * 12;
    if (e + 12 > end) break;
    if (u16(e) === 0x0112) {
      const v = u16(e + 8);
      return v >= 1 && v <= 8 ? v : 1;
    }
  }
  return 1;
}

// WebP：RIFF 容器，第一个块是 VP8（有损）、VP8L（无损）或 VP8X（扩展，带透明、ICC 等）
function webp(b) {
  if (b.length < 16 || b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null;
  const kind = b.toString('ascii', 12, 16);
  if (kind === 'VP8 ') {
    // 帧头：3 字节帧标记，起始码 9d 01 2a，再是 14 位宽、14 位高（高 2 位是缩放，不要）
    if (b.length < 30 || b[23] !== 0x9d || b[24] !== 0x01 || b[25] !== 0x2a) return null;
    return ok('webp', b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff);
  }
  if (kind === 'VP8L') {
    // 签名 0x2f，之后 14 位（宽 - 1）、14 位（高 - 1），按小端位序排
    if (b.length < 25 || b[20] !== 0x2f) return null;
    const b1 = b[21], b2 = b[22], b3 = b[23], b4 = b[24];
    const w = 1 + (((b2 & 0x3f) << 8) | b1);
    const h = 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6));
    return ok('webp', w, h);
  }
  if (kind === 'VP8X') {
    // 画布的（宽 - 1）、（高 - 1），各 24 位小端
    if (b.length < 30) return null;
    return ok('webp', 1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3));
  }
  return null;
}
