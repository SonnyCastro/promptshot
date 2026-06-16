import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';

const ACCENT = '#6ee7b7', INK = '#06130d', PANEL = '#15171d', LINE = '#23262f', LINE2 = '#2c303a', TEXT = '#e9ebf0', MUTED = '#9aa0ad', FAINT = '#6b7280';
const W = 1400, H = 560;

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
function lightPage(ctx, x, y, w, h) {
  ctx.save(); rr(ctx, x, y, w, h, 12); ctx.clip();
  ctx.fillStyle = '#f6f7f9'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#fff'; ctx.fillRect(x, y, w, 44);
  ctx.fillStyle = '#0f1115'; rr(ctx, x + 18, y + 15, 14, 14, 4); ctx.fill();
  ctx.font = '700 13px sans-serif'; ctx.fillText('Northwind', x + 40, y + 26);
  ctx.fillStyle = '#0f1115'; rr(ctx, x + w - 88, y + 12, 68, 20, 6); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '600 10px sans-serif'; ctx.fillText('Start free', x + w - 76, y + 26);
  ctx.fillStyle = '#0f1115'; ctx.font = '700 27px sans-serif';
  ctx.fillText('The workspace', x + 22, y + 96);
  ctx.fillText('that ships itself.', x + 22, y + 128);
  ctx.fillStyle = '#6b7280'; ctx.font = '13px sans-serif'; ctx.fillText('Plan, build, and ship faster.', x + 22, y + 156);
  ctx.fillStyle = '#10b981'; rr(ctx, x + 22, y + 172, 92, 28, 7); ctx.fill();
  ctx.fillStyle = '#04130c'; ctx.font = '600 12px sans-serif'; ctx.fillText('Get started', x + 36, y + 190);
  const ig = ctx.createLinearGradient(x + w - 220, y + 66, x + w - 22, y + 200);
  ig.addColorStop(0, '#cfe9df'); ig.addColorStop(1, '#bcd3f0');
  ctx.fillStyle = ig; rr(ctx, x + w - 220, y + 70, 196, 130, 10); ctx.fill();
  ctx.restore();
}
function browser(ctx, x, y, w, h) {
  ctx.fillStyle = PANEL; ctx.strokeStyle = LINE2; rr(ctx, x, y, w, h, 16); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#33373f';
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x + 20 + i * 18, y + 22, 5.5, 0, 6.2832); ctx.fill(); }
  ctx.fillStyle = '#0e1014'; ctx.strokeStyle = LINE; rr(ctx, x + 84, y + 12, w - 152, 22, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = FAINT; ctx.font = '12px monospace'; ctx.textAlign = 'left'; ctx.fillText('northwind.so', x + 96, y + 27);
  ctx.fillStyle = ACCENT; rr(ctx, x + w - 50, y + 11, 30, 24, 6); ctx.fill();
  lightPage(ctx, x + 1, y + 46, w - 2, h - 47);
  ctx.fillStyle = '#0b0c0f'; ctx.strokeStyle = LINE2; rr(ctx, x + w / 2 - 140, y + h - 50, 280, 34, 10); ctx.fill(); ctx.stroke();
  ctx.fillStyle = ACCENT; ctx.beginPath(); ctx.arc(x + w / 2 - 118, y + h - 33, 4, 0, 6.2832); ctx.fill();
  ctx.font = '600 13px monospace'; ctx.textAlign = 'center'; ctx.fillText('path copied — paste in your agent', x + w / 2 + 8, y + h - 28);
  ctx.textAlign = 'left';
}
function terminal(ctx, x, y, w) {
  ctx.fillStyle = '#0a0b0e'; ctx.strokeStyle = LINE2; rr(ctx, x, y, w, 76, 14); ctx.fill(); ctx.stroke();
  ctx.fillStyle = FAINT; ctx.font = '12px monospace'; ctx.fillText('claude code', x + 22, y + 26);
  ctx.font = '15px monospace';
  ctx.fillStyle = ACCENT; ctx.fillText('>', x + 22, y + 54);
  ctx.fillStyle = TEXT; ctx.fillText('match this layout ', x + 40, y + 54);
  ctx.fillStyle = ACCENT; ctx.fillText('@shot.png', x + 40 + ctx.measureText('match this layout ').width, y + 54);
}

const c = createCanvas(W, H);
const ctx = c.getContext('2d');
ctx.fillStyle = '#0b0c0f'; ctx.fillRect(0, 0, W, H);
const g = ctx.createRadialGradient(W * 0.74, 40, 0, W * 0.74, 40, 640);
g.addColorStop(0, 'rgba(110,231,183,0.13)'); g.addColorStop(1, 'rgba(110,231,183,0)');
ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

// brand
camera(ctx, 90, 60, 46);
ctx.fillStyle = TEXT; ctx.font = '600 27px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('PromptShot', 152, 92);
// headline
ctx.font = '700 52px sans-serif';
ctx.fillText('Screenshots, straight', 90, 230);
ctx.fillText('into your coding agent.', 90, 292);
// sub
ctx.fillStyle = MUTED; ctx.font = '21px sans-serif';
ctx.fillText('One click grabs the full page and drops its', 90, 348);
ctx.fillText('path on your clipboard. Paste it into your agent.', 90, 378);
// cta
ctx.fillStyle = ACCENT; rr(ctx, 90, 416, 200, 50, 11); ctx.fill();
ctx.fillStyle = INK; ctx.font = '600 18px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Add to Chrome', 190, 448);
ctx.textAlign = 'left';
ctx.fillStyle = FAINT; ctx.font = '14px monospace'; ctx.fillText('Claude Code · Codex · Cursor', 90, 500);

// right visual
browser(ctx, 760, 70, 560, 330);
terminal(ctx, 760, 424, 560);

writeFileSync(new URL('../store/promo-marquee-1400x560.jpg', import.meta.url), c.toBuffer('image/jpeg', 92));
console.log('wrote store/promo-marquee-1400x560.jpg');
