/**
 * BAIKAL favicon PNG generator — pure Node.js, no external dependencies.
 * Produces: favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png
 * Run: node scripts/generate-favicons.mjs
 */

import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, '../public');

// ── CRC32 ─────────────────────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ CRC_TABLE[(c ^ buf[i]) & 0xFF];
  return (c ^ 0xFFFFFFFF) >>> 0;
}

// ── PNG encoder ───────────────────────────────────────────────────────────────
function pngChunk(type, data) {
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const typeB = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeB, data])), 0);
  return Buffer.concat([lenBuf, typeB, data, crcBuf]);
}

function encodePNG(w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA

  const stride = 1 + w * 4;
  const raw = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) {
    raw[y * stride] = 0; // filter: None
    for (let x = 0; x < w; x++) {
      const s = (y * w + x) * 4;
      const d = y * stride + 1 + x * 4;
      raw[d] = rgba[s]; raw[d+1] = rgba[s+1]; raw[d+2] = rgba[s+2]; raw[d+3] = rgba[s+3];
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── BAIKAL brand colors ───────────────────────────────────────────────────────
const BLUE   = [13,  44,  200, 255]; // #0D2CC8
const GREEN  = [123, 213, 165, 255]; // #7BD5A5
const YELLOW = [255, 193,   7, 255]; // #FFC107
const ORANGE = [241,  90,  36, 255]; // #F15A24
const BLACK  = [ 17,  17,  17, 255]; // B character

// ── B bitmaps ─────────────────────────────────────────────────────────────────
// 5 cols × 7 rows — used at 16 px (1 px per unit)
const B5x7 = [
  [1,1,1,1,0],
  [1,0,0,1,0],
  [1,0,0,1,0],
  [1,1,1,1,0],
  [1,0,0,0,1],
  [1,0,0,0,1],
  [1,1,1,1,1],
];

// 7 cols × 9 rows — used at 32 px and 180 px (scaled)
const B7x9 = [
  [1,1,1,1,1,0,0],
  [1,1,0,0,0,1,0],
  [1,1,0,0,0,1,0],
  [1,1,0,0,0,1,0],
  [1,1,1,1,1,0,0],
  [1,1,0,0,0,1,1],
  [1,1,0,0,0,1,1],
  [1,1,0,0,0,1,1],
  [1,1,1,1,1,1,0],
];

// ── Ring segment color by angle (SVG coord: 0=East, CW) ──────────────────────
function ringColor(deg) {
  if (deg > 182 && deg < 268) return BLUE;
  if (deg > 272 && deg < 358) return GREEN;
  if (deg >   2 && deg <  88) return YELLOW;
  if (deg >  92 && deg < 178) return ORANGE;
  return null;
}

// ── Render ────────────────────────────────────────────────────────────────────
function renderFavicon(size) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 14 / 32;
  const innerR = size * 10 / 32;

  // Choose B bitmap and rendered size
  let bMap, bCols, bRows, bW, bH;
  if (size <= 20) {
    bMap = B5x7; bCols = 5; bRows = 7;
    bW = 5; bH = 7; // 1 px per B unit
  } else {
    bMap = B7x9; bCols = 7; bRows = 9;
    // Scale so B bounding-box corners stay inside inner circle
    // corner dist = sqrt((bW/2)^2 + (bH/2)^2), bW = bH*(7/9)
    // bH * sqrt((7/18)^2 + 0.25) ≤ innerR  →  bH ≤ innerR / 0.633
    bH = innerR * 1.35; // ~85 % of max, leaves visible margin
    bW = bH * bCols / bRows;
  }

  const pixels = new Uint8ClampedArray(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = x + 0.5 - cx; // pixel centre relative to image centre
      const py = y + 0.5 - cy;
      const dist = Math.sqrt(px * px + py * py);
      let color = null;

      if (dist >= innerR && dist <= outerR) {
        // Ring — determine quadrant
        let ang = Math.atan2(py, px) * 180 / Math.PI;
        if (ang < 0) ang += 360;
        color = ringColor(ang);
      } else if (dist < innerR) {
        // Inner circle — check B bitmap
        const bCol = (px + bW / 2) / (bW / bCols);
        const bRow = (py + bH / 2) / (bH / bRows);
        const ci = Math.floor(bCol);
        const ri = Math.floor(bRow);
        if (ri >= 0 && ri < bRows && ci >= 0 && ci < bCols && bMap[ri][ci]) {
          color = BLACK;
        }
      }

      if (color) {
        const i = (y * size + x) * 4;
        pixels[i] = color[0]; pixels[i+1] = color[1];
        pixels[i+2] = color[2]; pixels[i+3] = color[3];
      }
    }
  }

  return pixels;
}

// ── Generate files ────────────────────────────────────────────────────────────
const FILES = [
  { size: 16,  name: 'favicon-16x16.png' },
  { size: 32,  name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
];

for (const { size, name } of FILES) {
  const pixels = renderFavicon(size);
  const png = encodePNG(size, size, pixels);
  fs.writeFileSync(path.join(PUBLIC, name), png);
  console.log(`generated ${name} (${size}x${size})`);
}
