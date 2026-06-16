import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';

const BG1 = '#16181d';
const BG2 = '#0b0c0f';
const ACCENT = '#6ee7b7';
const SIZES = [16, 32, 48, 96, 128];

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Bright green chip + bold dark camera filling the frame. Max toolbar presence.
const INK = '#06130d';
function draw(size) {
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  const s = size / 128;

  // bright green tile
  ctx.fillStyle = ACCENT;
  roundRect(ctx, 0, 0, size, size, 24 * s);
  ctx.fill();

  // bold dark camera, frame-filling
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.lineWidth = Math.max(2, 13 * s);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // shutter bump (viewfinder)
  roundRect(ctx, 44 * s, 22 * s, 40 * s, 16 * s, 5 * s);
  ctx.stroke();
  // camera body
  roundRect(ctx, 10 * s, 38 * s, 108 * s, 72 * s, 16 * s);
  ctx.stroke();
  // lens
  ctx.beginPath();
  ctx.arc(64 * s, 76 * s, 21 * s, 0, Math.PI * 2);
  ctx.stroke();
  // lens center dot
  ctx.beginPath();
  ctx.arc(64 * s, 76 * s, 9 * s, 0, Math.PI * 2);
  ctx.fill();

  return c.toBuffer('image/png');
}

for (const size of SIZES) {
  writeFileSync(new URL(`../public/icon/${size}.png`, import.meta.url), draw(size));
  console.log(`wrote public/icon/${size}.png`);
}
