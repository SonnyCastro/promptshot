import { browser } from 'wxt/browser';

const FOLDER = 'agent-shots';
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default defineBackground(() => {
  // Hide Chrome's download shelf/bubble so saving feels silent.
  browser.downloads.setUiOptions({ enabled: false }).catch(() => {});

  // Icon click opens the popup (popup.html), which calls us to capture and then
  // copies the path itself — a popup is a focused context, so clipboard works.
  browser.runtime.onMessage.addListener((msg) => {
    // Popup asks us to show the familiar in-page toast after it copies.
    if (msg?.type === 'toast' && typeof msg.text === 'string') {
      browser.tabs.query({ active: true, lastFocusedWindow: true }).then(([tab]) => {
        if (tab?.id != null) toast(tab.id, msg.text);
      });
      return;
    }
    if (msg?.type !== 'capture') return;
    return (async () => {
      const [tab] = await browser.tabs.query({ active: true, lastFocusedWindow: true });
      if (tab?.id == null) return { ok: false, error: 'no active tab' };
      try {
        const dataUrl = await captureFullPage(tab.id, tab.windowId!);
        // Image mode: hand back the PNG, no file saved (for web chat boxes).
        if (msg.mode === 'image') return { ok: true, mode: 'image', dataUrl };
        // Path mode (default): save the file and return its path (for CLI agents).
        const path = await saveToFolder(dataUrl);
        return { ok: true, mode: 'path', path };
      } catch (e) {
        console.error('[PromptShot]', e);
        return { ok: false, error: String(e) };
      }
    })();
  });

  // Keyboard shortcut: the page keeps focus, so we capture + copy in-page directly.
  browser.commands.onCommand.addListener(async (cmd) => {
    if (cmd !== 'capture') return;
    const [tab] = await browser.tabs.query({ active: true, lastFocusedWindow: true });
    if (tab?.id == null) return;
    try {
      badge('…', '#6ee7b7');
      const dataUrl = await captureFullPage(tab.id, tab.windowId!);
      const path = await saveToFolder(dataUrl);
      const copied = await copyInPage(tab.id, path);
      badge(copied ? '✓' : '!', copied ? '#16a34a' : '#eab308');
      await toast(tab.id, copied ? '📋  path copied — ⌘V in your agent' : `saved → ${path}`);
    } catch (e) {
      console.error('[PromptShot]', e);
      badge('!', '#ef4444');
      await toast(tab.id, "couldn't capture this page");
    } finally {
      setTimeout(() => browser.action.setBadgeText({ text: '' }), 1900);
    }
  });
});

/* ------------------------------------------------------------------ */
/* Full-page capture: scroll, capture each viewport, stitch on canvas. */
/* ------------------------------------------------------------------ */

async function captureFullPage(tabId: number, windowId: number): Promise<string> {
  const [{ result: m }] = await browser.scripting.executeScript({ target: { tabId }, func: spMeasure });
  const { fullH, viewH, viewW, dpr, sx, sy, prevSB } = m as PageMetrics;

  const cw = Math.round(viewW * dpr);
  const ch = Math.round(fullH * dpr);
  const canvas = new OffscreenCanvas(cw, ch);
  const ctx = canvas.getContext('2d')!;

  const positions: number[] = [];
  for (let y = 0; y < fullH; y += viewH) positions.push(Math.min(y, Math.max(0, fullH - viewH)));
  const steps = [...new Set(positions)];

  for (let i = 0; i < steps.length; i++) {
    const y = steps[i];
    await browser.scripting.executeScript({ target: { tabId }, func: spScroll, args: [y] });
    await delay(i === 0 ? 260 : 200);
    const shot = await captureWithRetry(windowId);
    const bmp = await createImageBitmap(await (await fetch(shot)).blob());
    const destY = Math.round(y * dpr);
    const h = Math.min(bmp.height, ch - destY);
    ctx.drawImage(bmp, 0, 0, cw, h, 0, destY, cw, h);
    bmp.close();
    if (i === 0 && steps.length > 1) {
      await browser.scripting.executeScript({ target: { tabId }, func: spHideFixed });
    }
  }

  await browser.scripting.executeScript({ target: { tabId }, func: spRestore, args: [sx, sy, prevSB] });
  const blob = await canvas.convertToBlob({ type: 'image/png' });
  return blobToDataUrl(blob);
}

async function captureWithRetry(windowId: number): Promise<string> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await browser.tabs.captureVisibleTab(windowId, { format: 'png' });
    } catch (e) {
      if (attempt >= 3) throw e;
      await delay(550);
    }
  }
}

/* ------------------------------ save ------------------------------ */

async function saveToFolder(dataUrl: string): Promise<string> {
  const id = await browser.downloads.download({
    url: dataUrl,
    filename: `${FOLDER}/${shotName()}.png`,
    conflictAction: 'uniquify',
    saveAs: false,
  });
  const path = await resolveDownloadPath(id);
  await trackAndPrune(id);
  return path;
}

const MAX_SHOTS = 25;
async function trackAndPrune(id: number) {
  const r = await browser.storage.local.get('shots');
  const shots = ((r.shots as number[] | undefined) ?? []).concat(id);
  const overflow = shots.splice(0, Math.max(0, shots.length - MAX_SHOTS));
  for (const oldId of overflow) {
    await browser.downloads.removeFile(oldId).catch(() => {});
    await browser.downloads.erase({ id: oldId }).catch(() => {});
  }
  await browser.storage.local.set({ shots });
}

function resolveDownloadPath(id: number, attempts = 30): Promise<string> {
  return new Promise((resolve, reject) => {
    const tick = async (left: number) => {
      const [item] = await browser.downloads.search({ id });
      if (item?.filename) return resolve(item.filename);
      if (left <= 0) return reject(new Error('could not resolve download path'));
      setTimeout(() => tick(left - 1), 100);
    };
    tick(attempts);
  });
}

function shotName(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    `shot-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
  );
}

/* ---------------------------- clipboard --------------------------- */
// Keyboard path only — the page is focused, so a textarea + execCommand works.
async function copyInPage(tabId: number, text: string): Promise<boolean> {
  try {
    const [{ result }] = await browser.scripting.executeScript({ target: { tabId }, func: spCopy, args: [text] });
    return !!result;
  } catch {
    return false;
  }
}

/* ------------------------------ misc ------------------------------ */

function badge(text: string, color: string) {
  browser.action.setBadgeText({ text });
  browser.action.setBadgeBackgroundColor({ color });
}

async function toast(tabId: number, text: string) {
  try {
    await browser.scripting.executeScript({ target: { tabId }, func: spToast, args: [text] });
  } catch {
    /* page may block injection */
  }
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return 'data:image/png;base64,' + btoa(bin);
}

/* ------------------ functions injected into the page ------------------ */

interface PageMetrics {
  fullH: number; viewH: number; viewW: number; dpr: number; sx: number; sy: number; prevSB: string;
}

function spMeasure(): PageMetrics {
  const de = document.documentElement;
  const b = document.body;
  const prevSB = de.style.scrollBehavior;
  de.style.scrollBehavior = 'auto';
  return {
    fullH: Math.max(de.scrollHeight, b ? b.scrollHeight : 0, de.offsetHeight, b ? b.offsetHeight : 0, de.clientHeight),
    viewH: window.innerHeight,
    viewW: de.clientWidth,
    dpr: window.devicePixelRatio || 1,
    sx: window.scrollX,
    sy: window.scrollY,
    prevSB,
  };
}

function spScroll(y: number) {
  window.scrollTo(0, y);
}

function spCopy(text: string): boolean {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '0';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

function spHideFixed() {
  const walk = (root: Document | ShadowRoot) => {
    root.querySelectorAll<HTMLElement>('*').forEach((el) => {
      const s = getComputedStyle(el);
      if ((s.position === 'fixed' || s.position === 'sticky') && el.style.visibility !== 'hidden') {
        el.dataset.spVis = el.style.visibility;
        el.style.visibility = 'hidden';
      }
      if (el.shadowRoot) walk(el.shadowRoot);
    });
  };
  walk(document);
}

function spRestore(sx: number, sy: number, prevSB: string) {
  const walk = (root: Document | ShadowRoot) => {
    root.querySelectorAll<HTMLElement>('*').forEach((el) => {
      if (el.dataset && el.dataset.spVis !== undefined) {
        el.style.visibility = el.dataset.spVis;
        delete el.dataset.spVis;
      }
      if (el.shadowRoot) walk(el.shadowRoot);
    });
  };
  walk(document);
  document.documentElement.style.scrollBehavior = prevSB || '';
  window.scrollTo(sx, sy);
}

function spToast(text: string) {
  const id = '__shotpipe_toast';
  document.getElementById(id)?.remove();
  const d = document.createElement('div');
  d.id = id;
  d.textContent = text;
  Object.assign(d.style, {
    position: 'fixed', zIndex: '2147483647', left: '50%', bottom: '24px',
    transform: 'translateX(-50%)', background: '#0e0f12', color: '#6ee7b7',
    font: '600 13px -apple-system, BlinkMacSystemFont, sans-serif', padding: '10px 16px',
    borderRadius: '10px', boxShadow: '0 8px 30px rgba(0,0,0,.45)', border: '1px solid #24262e',
    pointerEvents: 'none', opacity: '0', transition: 'opacity .15s ease',
  } as CSSStyleDeclaration);
  document.body.appendChild(d);
  requestAnimationFrame(() => (d.style.opacity = '1'));
  setTimeout(() => { d.style.opacity = '0'; setTimeout(() => d.remove(), 220); }, 4000);
}
