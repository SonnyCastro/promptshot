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
const tile = (ctx, ox, oy, size, fill) => { rr(ctx, ox, oy, size, size, (24 * size) / 128); ctx.fillStyle = fill; ctx.fill(); };

// big camera that fills the frame
function camera(ctx, ox, oy, size, color) {
  const s = size / 128, X = (v) => ox + v * s, Y = (v) => oy + v * s;
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 13 * s; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  rr(ctx, X(44), Y(22), 40 * s, 16 * s, 5 * s); ctx.stroke();
  rr(ctx, X(10), Y(38), 108 * s, 72 * s, 16 * s); ctx.stroke();
  ctx.beginPath(); ctx.arc(X(64), Y(76), 21 * s, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(X(64), Y(76), 9 * s, 0, Math.PI * 2); ctx.fill();
}

// big capture frame + arrow
function frame(ctx, ox, oy, size, color) {
  const s = size / 128, X = (v) => ox + v * s, Y = (v) => oy + v * s;
  ctx.strokeStyle = color; ctx.lineWidth = 14 * s; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const m = 18, e = 110, len = 32;
  const corner = (a, b, c2, d, f, g) => { ctx.beginPath(); ctx.moveTo(X(a), Y(b)); ctx.lineTo(X(c2), Y(d)); ctx.lineTo(X(f), Y(g)); ctx.stroke(); };
  corner(m, m + len, m, m, m + len, m);
  corner(e - len, m, e, m, e, m + len);
  corner(m, e - len, m, e, m + len, e);
  corner(e - len, e, e, e, e, e - len);
  ctx.beginPath(); ctx.moveTo(X(64), Y(38)); ctx.lineTo(X(64), Y(88)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(X(46), Y(70)); ctx.lineTo(X(64), Y(88)); ctx.lineTo(X(82), Y(70)); ctx.stroke();
}

const opts = [
  { label: '1  camera / dark', draw: (ctx, x, y, s) => { tile(ctx, x, y, s, DARK); camera(ctx, x, y, s, ACCENT); } },
  { label: '2  camera / green', draw: (ctx, x, y, s) => { tile(ctx, x, y, s, ACCENT); camera(ctx, x, y, s, INK); } },
  { label: '3  capture frame', draw: (ctx, x, y, s) => { tile(ctx, x, y, s, DARK); frame(ctx, x, y, s, ACCENT); } },
];

const W = 720, H = 360, ICON = 122;
const c = createCanvas(W, H);
const ctx = c.getContext('2d');
ctx.fillStyle = '#e9ebef'; ctx.fillRect(0, 0, W, H / 2);
ctx.fillStyle = '#0b0c0f'; ctx.fillRect(0, H / 2, W, H / 2);
const centers = [150, 360, 570];
for (let i = 0; i < opts.length; i++) {
  opts[i].draw(ctx, centers[i] - ICON / 2, 56, ICON);
  opts[i].draw(ctx, centers[i] - ICON / 2, 56 + H / 2, ICON);
  ctx.font = '600 14px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#0e0f12';
  ctx.fillText(opts[i].label, centers[i], 32);
}
writeFileSync(new URL('../icon-compare.png', import.meta.url), c.toBuffer('image/png'));
console.log('wrote icon-compare.png');
