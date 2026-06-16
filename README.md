# PromptShot

**Full-page screenshots, straight into your coding agent.**

One click captures the entire page, saves it to a single folder, and drops the
file's path onto your clipboard. Paste it into Claude Code, Codex, or Cursor and
your agent reads the screenshot instantly. No more digging through Downloads.

- 🖱️ **One click** — full-page scroll-and-stitch capture, or `⌥⇧S`
- 📋 **Path on your clipboard** — exactly what a terminal agent needs (`@/path/shot.png`)
- 🖼️ **Image mode** — copy the PNG itself for web chat boxes (Cursor, claude.ai)
- 🧹 **No graveyard** — shots land in one `agent-shots/` folder and old ones auto-delete
- 🔒 **Private** — no servers, no account, no analytics, no host permissions

## Privacy

PromptShot collects nothing. Screenshots are saved to your own machine and never
transmitted. It requests only `activeTab`, `scripting`, `downloads`, and
`storage`, and has no access to the content of the pages you visit.

## How it works

- Clicking the toolbar icon opens a small popup. The popup asks the background
  service worker to capture and save, then **copies the path itself** —
  a popup is a focused context, which is the only reliable place to write the
  clipboard from an MV3 extension (a toolbar click blurs the page, and offscreen
  documents are never focused).
- Full-page capture scrolls the tab in viewport-sized steps, captures each with
  `chrome.tabs.captureVisibleTab`, and stitches them onto an `OffscreenCanvas`.
  Fixed/sticky elements are hidden after the first frame so they don't repeat.
- The keyboard shortcut keeps page focus, so it copies in-page directly.

## Develop

Built with [WXT](https://wxt.dev). Requires Node 18+ and pnpm.

```bash
pnpm install
pnpm dev      # launches Chrome with hot-reload
pnpm build    # outputs .output/chrome-mv3
```

Icons are generated from `scripts/make-icons.mjs` (`node scripts/make-icons.mjs`).

## Load it unpacked

1. `pnpm build`
2. Open `chrome://extensions`, enable **Developer mode**
3. **Load unpacked** → select `.output/chrome-mv3`

Works on any Chromium browser (Chrome, Edge, Brave, Arc).

## License

[MIT](./LICENSE) © 2026 Kevin Castro
