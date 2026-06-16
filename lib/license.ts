import { browser } from 'wxt/browser';

/**
 * Free vs Pro gate. v1 is a stub: the real version validates the key against a
 * hosted store (Gumroad / Lemon Squeezy) via a single fetch. Pro unlocks the
 * workflow multipliers: per-project folders + annotate-before-send + batch.
 */
export interface License {
  key: string;
  valid: boolean;
}

export async function getLicense(): Promise<License | null> {
  const r = await browser.storage.local.get('license');
  return (r.license as License | undefined) ?? null;
}

export async function isPro(): Promise<boolean> {
  return (await getLicense())?.valid ?? false;
}

/** Dev stub — any key starting with `PRO-` activates. Swap for a real check pre-launch. */
export async function activateLicense(key: string): Promise<boolean> {
  const valid = key.trim().toUpperCase().startsWith('PRO-');
  await browser.storage.local.set({ license: { key: key.trim(), valid } });
  return valid;
}

export async function deactivateLicense(): Promise<void> {
  await browser.storage.local.remove('license');
}
