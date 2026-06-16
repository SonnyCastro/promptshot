import { browser } from 'wxt/browser';

type Mode = 'path' | 'image';

const body = document.body;
const spin = document.getElementById('spin')!;
const msg = document.getElementById('msg')!;
const pathEl = document.getElementById('path')!;
const btnPath = document.getElementById('mPath')!;
const btnImage = document.getElementById('mImage')!;

function capturing() {
  body.classList.remove('ok', 'err');
  spin.className = 'spin';
  spin.textContent = '';
  spin.style.color = '';
  pathEl.classList.remove('show');
  pathEl.textContent = '';
  msg.textContent = 'capturing the full page…';
}

function done(cls: 'ok' | 'err', text: string) {
  spin.classList.add('done');
  spin.textContent = cls === 'ok' ? '✓' : '⚠';
  spin.style.color = cls === 'ok' ? '#6ee7b7' : '#f7b955';
  body.classList.add(cls);
  msg.textContent = text;
}

function highlight(mode: Mode) {
  btnPath.classList.toggle('active', mode === 'path');
  btnImage.classList.toggle('active', mode === 'image');
}

async function getMode(): Promise<Mode> {
  const r = await browser.storage.local.get('copyMode');
  return r.copyMode === 'image' ? 'image' : 'path';
}

async function run(mode: Mode) {
  capturing();
  let res: { ok: boolean; mode?: Mode; path?: string; dataUrl?: string } | undefined;
  try {
    res = await browser.runtime.sendMessage({ type: 'capture', mode });
  } catch {
    done('err', 'something went wrong');
    return;
  }
  if (!res?.ok) {
    done('err', "couldn't capture this page");
    return;
  }

  if (mode === 'image' && res.dataUrl) {
    try {
      const blob = await (await fetch(res.dataUrl)).blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type || 'image/png']: blob })]);
      browser.runtime.sendMessage({ type: 'toast', text: '🖼  image copied — ⌘V in chat' }).catch(() => {});
      done('ok', 'image copied — ⌘V in chat');
    } catch {
      done('err', 'image copy was blocked');
    }
    return;
  }

  if (res.path) {
    try {
      await navigator.clipboard.writeText(res.path);
      browser.runtime.sendMessage({ type: 'toast', text: '📋  path copied — ⌘V in your agent' }).catch(() => {});
      done('ok', 'path copied — ⌘V in your agent');
    } catch {
      done('ok', 'saved — copy the path below');
      pathEl.textContent = res.path;
      pathEl.classList.add('show');
    }
  }
}

for (const btn of [btnPath, btnImage]) {
  btn.addEventListener('click', async () => {
    const mode = (btn as HTMLElement).dataset.mode as Mode;
    await browser.storage.local.set({ copyMode: mode });
    highlight(mode);
    run(mode);
  });
}

(async () => {
  const mode = await getMode();
  highlight(mode);
  run(mode);
})();
