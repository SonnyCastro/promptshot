import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'node:fs';

const ACCENT = '#6ee7b7', INK = '#06130d', BG = '#0b0c0f', PANEL = '#15171d', LINE = '#23262f', LINE2 = '#2c303a', TEXT = '#e9ebf0', MUTED = '#9aa0ad', FAINT = '#6b7280';
const W = 1280, H = 800;
mkdirSync(new URL('../store/', import.meta.url), { recursive: true });

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
function bg(ctx) {
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W * 0.78, 60, 0, W * 0.78, 60, 620);
  g.addColorStop(0, 'rgba(110,231,183,0.13)'); g.addColorStop(1, 'rgba(110,231,183,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function brandRow(ctx, x, y) {
  camera(ctx, x, y, 44);
  ctx.fillStyle = TEXT; ctx.font = '600 26px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('PromptShot', x + 58, y + 31);
}

// realistic light page mock
function lightPage(ctx, x, y, w, h) {
  ctx.save();
  rr(ctx, x, y, w, h, 14); ctx.clip();
  ctx.fillStyle = '#f6f7f9'; ctx.fillRect(x, y, w, h);
  // nav
  ctx.fillStyle = '#fff'; ctx.fillRect(x, y, w, 46);
  ctx.fillStyle = '#0f1115'; rr(ctx, x + 20, y + 16, 15, 15, 4); ctx.fill();
  ctx.font = '700 14px sans-serif'; ctx.fillText('Northwind', x + 42, y + 28);
  ctx.fillStyle = '#5b6270'; ctx.font = '12px sans-serif';
  ctx.fillText('Product    Customers    Pricing    Docs', x + 130, y + 28);
  ctx.fillStyle = '#0f1115'; rr(ctx, x + w - 92, y + 13, 72, 22, 6); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '600 11px sans-serif'; ctx.fillText('Start free', x + w - 80, y + 28);
  // hero
  ctx.fillStyle = '#0f1115'; ctx.font = '700 30px sans-serif';
  ctx.fillText('The workspace', x + 24, y + 100);
  ctx.fillText('that ships itself.', x + 24, y + 136);
  ctx.fillStyle = '#6b7280'; ctx.font = '14px sans-serif';
  ctx.fillText('Plan, build, and ship faster.', x + 24, y + 166);
  ctx.fillStyle = '#10b981'; rr(ctx, x + 24, y + 184, 96, 30, 7); ctx.fill();
  ctx.fillStyle = '#04130c'; ctx.font = '600 12px sans-serif'; ctx.fillText('Get started', x + 38, y + 203);
  // image block
  const ig = ctx.createLinearGradient(x + w - 230, y + 70, x + w - 24, y + 210);
  ig.addColorStop(0, '#cfe9df'); ig.addColorStop(1, '#bcd3f0');
  ctx.fillStyle = ig; rr(ctx, x + w - 230, y + 74, 206, 140, 10); ctx.fill();
  // cards
  for (let i = 0; i < 3; i++) { ctx.fillStyle = '#fff'; ctx.strokeStyle = '#e6e8ee'; rr(ctx, x + 24 + i * ((w - 48) / 3), y + 236, (w - 48) / 3 - 12, h - 260, 9); ctx.fill(); ctx.stroke(); }
  ctx.restore();
}
function browser(ctx, x, y, w, h) {
  ctx.fillStyle = PANEL; ctx.strokeStyle = LINE2; rr(ctx, x, y, w, h, 16); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#33373f';
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x + 20 + i * 18, y + 22, 5.5, 0, 6.2832); ctx.fill(); }
  ctx.fillStyle = '#0e1014'; ctx.strokeStyle = LINE; rr(ctx, x + 84, y + 12, w - 104, 22, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = FAINT; ctx.font = '12px monospace'; ctx.textAlign = 'left'; ctx.fillText('northwind.so', x + 96, y + 27);
  lightPage(ctx, x + 1, y + 46, w - 2, h - 47);
  // toast
  ctx.fillStyle = '#0b0c0f'; ctx.strokeStyle = LINE2; rr(ctx, x + w / 2 - 140, y + h - 52, 280, 36, 10); ctx.fill(); ctx.stroke();
  ctx.fillStyle = ACCENT; ctx.beginPath(); ctx.arc(x + w / 2 - 116, y + h - 34, 4, 0, 6.2832); ctx.fill();
  ctx.font = '600 14px monospace'; ctx.textAlign = 'center';
  ctx.fillText('path copied — paste in your agent', x + w / 2 + 8, y + h - 29);
  ctx.textAlign = 'left';
}
function terminal(ctx, x, y, w, cmd) {
  ctx.fillStyle = '#0a0b0e'; ctx.strokeStyle = LINE2; rr(ctx, x, y, w, 86, 14); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#33373f';
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x + 20 + i * 16, y + 22, 4.5, 0, 6.2832); ctx.fill(); }
  ctx.fillStyle = FAINT; ctx.font = '12px monospace'; ctx.fillText('claude code', x + 74, y + 26);
  ctx.font = '15px monospace';
  ctx.fillStyle = ACCENT; ctx.fillText('>', x + 20, y + 60);
  ctx.fillStyle = TEXT; ctx.fillText(cmd, x + 38, y + 60);
  ctx.fillStyle = ACCENT; ctx.fillText('@shot.png', x + 38 + ctx.measureText(cmd).width, y + 60);
}

/* ---- Promo 1: hero ---- */
function promo1() {
  const c = createCanvas(W, H), ctx = c.getContext('2d');
  bg(ctx);
  brandRow(ctx, 80, 70);
  ctx.fillStyle = TEXT; ctx.font = '700 58px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('Screenshots, straight', 80, 250);
  ctx.fillText('into your coding agent.', 80, 318);
  ctx.fillStyle = MUTED; ctx.font = '22px sans-serif';
  ctx.fillText('One click grabs the full page and drops its path', 80, 380);
  ctx.fillText('on your clipboard. Paste it into your agent.', 80, 410);
  ctx.fillStyle = ACCENT; rr(ctx, 80, 452, 210, 54, 11); ctx.fill();
  ctx.fillStyle = INK; ctx.font = '600 19px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('Add to Chrome', 185, 486); ctx.textAlign = 'left';
  ctx.fillStyle = FAINT; ctx.font = '15px monospace';
  ctx.fillText('works with Claude Code · Codex · Cursor', 80, 560);
  browser(ctx, 700, 96, 500, 360);
  terminal(ctx, 700, 486, 500, 'match this layout ');
  writeFileSync(new URL('../store/promo-1-hero.png', import.meta.url), c.toBuffer('image/png'));
}

/* ---- Promo 2: 3 steps ---- */
function promo2() {
  const c = createCanvas(W, H), ctx = c.getContext('2d');
  bg(ctx);
  brandRow(ctx, 80, 70);
  ctx.fillStyle = TEXT; ctx.font = '700 46px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('Capture to paste, in one move.', 80, 210);
  const steps = [
    ['01', 'Click the icon', 'Scrolls and stitches the', 'full page into one PNG.'],
    ['02', "It's copied for you", 'The file path lands on', 'your clipboard, instantly.'],
    ['03', 'Paste in your agent', '⌘V into Claude Code', 'or Codex. It just reads it.'],
  ];
  const cw = 350, gap = 30, x0 = 80, y0 = 300, ch = 280;
  for (let i = 0; i < 3; i++) {
    const x = x0 + i * (cw + gap);
    ctx.fillStyle = PANEL; ctx.strokeStyle = LINE; rr(ctx, x, y0, cw, ch, 16); ctx.fill(); ctx.stroke();
    ctx.fillStyle = ACCENT; ctx.font = '600 16px monospace'; ctx.fillText(steps[i][0], x + 28, y0 + 50);
    ctx.fillStyle = TEXT; ctx.font = '600 24px sans-serif'; ctx.fillText(steps[i][1], x + 28, y0 + 100);
    ctx.fillStyle = MUTED; ctx.font = '17px sans-serif';
    ctx.fillText(steps[i][2], x + 28, y0 + 142);
    ctx.fillText(steps[i][3], x + 28, y0 + 168);
  }
  writeFileSync(new URL('../store/promo-2-steps.png', import.meta.url), c.toBuffer('image/png'));
}

promo1();
promo2();
console.log('wrote store/promo-1-hero.png and store/promo-2-steps.png');
