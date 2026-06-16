import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';

const ACCENT = '#6ee7b7', INK = '#06130d', TEXT = '#e9ebf0', MUTED = '#9aa0ad';
const W = 440, H = 280;

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function camera(ctx, ox, oy, size) {
  const s = size / 128, X = (v) => ox + v * s, Y = (v) => oy + v * s;
  ctx.fillStyle = ACCENT; rr(ctx, ox, oy, size, size, 24 * s); ctx.fill();
  ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = 13 * s; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  rr(ctx, X(44), Y(22), 40 * s, 16 * s, 5 * s); ctx.stroke();
  rr(ctx, X(10), Y(38), 108 * s, 72 * s, 16 * s); ctx.stroke();
  ctx.beginPath(); ctx.arc(X(64), Y(76), 21 * s, 0, 6.2832); ctx.stroke();
  ctx.beginPath(); ctx.arc(X(64), Y(76), 9 * s, 0, 6.2832); ctx.fill();
}

const c = createCanvas(W, H);
const ctx = c.getContext('2d');
// opaque dark background (no alpha) + green glow
ctx.fillStyle = '#0b0c0f'; ctx.fillRect(0, 0, W, H);
const g = ctx.createRadialGradient(W / 2, 70, 0, W / 2, 70, 300);
g.addColorStop(0, 'rgba(110,231,183,0.16)'); g.addColorStop(1, 'rgba(110,231,183,0)');
ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

// centered icon + wordmark
const icon = 62;
ctx.font = '600 34px sans-serif';
const wordW = ctx.measureText('PromptShot').width;
const groupW = icon + 16 + wordW;
const gx = (W - groupW) / 2;
camera(ctx, gx, 86, icon);
ctx.fillStyle = TEXT; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
ctx.fillText('PromptShot', gx + icon + 16, 86 + icon / 2 + 1);

// tagline
ctx.fillStyle = MUTED; ctx.font = '17px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
ctx.fillText('Screenshots, straight into your coding agent', W / 2, 196);

// JPEG = no alpha channel, exactly what the store wants
writeFileSync(new URL('../store/promo-tile-440x280.jpg', import.meta.url), c.toBuffer('image/jpeg', 92));
console.log('wrote store/promo-tile-440x280.jpg');
