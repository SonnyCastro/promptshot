import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';

const ACCENT = '#6ee7b7';
const INK = '#06130d';
const DARK = '#0e0f12';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function tile(ctx, ox, oy, size, fill) {
  rr(ctx, ox, oy, size, size, (26 * size) / 128);
  ctx.fillStyle = fill;
  ctx.fill();
}

function camera(ctx, ox, oy, size, color, lineW, lens) {
  const s = size / 128;
  const X = (v) => ox + v * s;
  const Y = (v) => oy + v * s;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.5, lineW * s);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  rr(ctx, X(47), Y(26), 30 * s, 14 * s, 5 * s);
  ctx.stroke();
  rr(ctx, X(16), Y(40), 96 * s, 66 * s, 15 * s);
  ctx.stroke();
  if (lens === 'dot') {
    ctx.beginPath(); ctx.arc(X(64), Y(76), 20 * s, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(X(64), Y(76), 8.5 * s, 0, Math.PI * 2); ctx.fill();
  } else if (lens === 'prompt') {
    ctx.lineWidth = Math.max(1.5, 9 * s);
    ctx.beginPath(); ctx.moveTo(X(53), Y(67)); ctx.lineTo(X(63), Y(76)); ctx.lineTo(X(53), Y(85)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X(67), Y(85)); ctx.lineTo(X(79), Y(85)); ctx.stroke();
  }
}

function brackets(ctx, ox, oy, size, color, lineW) {
  const s = size / 128;
  const X = (v) => ox + v * s;
  const Y = (v) => oy + v * s;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.5, lineW * s);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const m = 28, len = 20, e = 128 - m;
  const corner = (a, b, c, d, f, g) => { ctx.beginPath(); ctx.moveTo(X(a), Y(b)); ctx.lineTo(X(c), Y(d)); ctx.lineTo(X(f), Y(g)); ctx.stroke(); };
  corner(m, m + len, m, m, m + len, m);
  corner(e - len, m, e, m, e, m + len);
  corner(m, e - len, m, e, m + len, e);
  corner(e - len, e, e, e, e, e - len);
  // down arrow (capture → pipe)
  ctx.beginPath(); ctx.moveTo(X(64), Y(46)); ctx.lineTo(X(64), Y(82)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(X(51), Y(69)); ctx.lineTo(X(64), Y(82)); ctx.lineTo(X(77), Y(69)); ctx.stroke();
}

const variants = [
  { label: 'A  green camera (current)', draw: (ctx, x, y, s) => { tile(ctx, x, y, s, ACCENT); camera(ctx, x, y, s, INK, 11, 'dot'); } },
  { label: 'B  dark dev-tool camera', draw: (ctx, x, y, s) => { tile(ctx, x, y, s, DARK); camera(ctx, x, y, s, ACCENT, 11, 'dot'); } },
  { label: 'C  camera + prompt lens', draw: (ctx, x, y, s) => { tile(ctx, x, y, s, DARK); camera(ctx, x, y, s, ACCENT, 10, 'prompt'); } },
  { label: 'D  capture-bracket mark', draw: (ctx, x, y, s) => { tile(ctx, x, y, s, DARK); brackets(ctx, x, y, s, ACCENT, 11); } },
];

const W = 840, H = 340, ICON = 92;
const c = createCanvas(W, H);
const ctx = c.getContext('2d');

// bands: light (toolbar light) top, dark (toolbar dark) bottom
ctx.fillStyle = '#e9ebef'; ctx.fillRect(0, 0, W, H / 2);
ctx.fillStyle = '#0b0c0f'; ctx.fillRect(0, H / 2, W, H / 2);

const centers = [110, 320, 530, 740];
for (let i = 0; i < variants.length; i++) {
  const cx = centers[i];
  // light band
  variants[i].draw(ctx, cx - ICON / 2, 48, ICON);
  // dark band
  variants[i].draw(ctx, cx - ICON / 2, 48 + H / 2, ICON);
  // labels
  ctx.font = '600 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0e0f12';
  ctx.fillText(variants[i].label, cx, 28);
}

writeFileSync(new URL('../icon-mocks.png', import.meta.url), c.toBuffer('image/png'));
console.log('wrote icon-mocks.png');
