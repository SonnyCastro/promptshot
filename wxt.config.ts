import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: 'PromptShot - Full Page Screenshot for Claude Code, Cursor & Codex',
    description:
      'Full-page screenshot in one click. Drops the file path on your clipboard for Claude Code, Codex & Cursor.',
    // No default_popup → clicking the toolbar icon fires action.onClicked = instant capture.
    //  - activeTab: granted on click; lets us capture + script the current tab
    //  - scripting: scroll/measure the page for full-page stitching, show the toast
    //  - downloads: write the PNG and read back its absolute path (terminal needs a path)
    //  - offscreen: a hidden doc that writes the path to the clipboard
    permissions: ['activeTab', 'scripting', 'downloads', 'storage'],
    action: {
      default_title: 'PromptShot — full page → path on clipboard',
      default_popup: 'popup.html',
    },
    commands: {
      capture: {
        suggested_key: { default: 'Alt+Shift+S' },
        description: 'Capture full page → copy path',
      },
    },
  },
});
