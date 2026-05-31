// Loads the LINE LIFF SDK on demand and initializes it with the LIFF ID
// configured on the backend. Used by the customer-facing membership page so it
// can read the real LINE profile when opened inside the LINE app.

import { fetchLineConfig } from './lineApi';

export interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

declare global {
  interface Window {
    liff?: any;
  }
}

const LIFF_SDK_URL = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
let sdkPromise: Promise<void> | null = null;

function loadLiffSdk(): Promise<void> {
  if (window.liff) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = LIFF_SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load LIFF SDK'));
    document.head.appendChild(script);
  });
  return sdkPromise;
}

/**
 * Initialize LIFF and return the logged-in LINE profile.
 * Returns null if no LIFF ID is configured or initialization fails (e.g. when
 * the page is opened outside the LINE app during a preview).
 */
export async function getLiffProfile(): Promise<LiffProfile | null> {
  try {
    const config = await fetchLineConfig();
    if (!config.liffId) return null;

    await loadLiffSdk();
    if (!window.liff) return null;

    await window.liff.init({ liffId: config.liffId });
    if (!window.liff.isLoggedIn()) {
      window.liff.login();
      return null;
    }
    return (await window.liff.getProfile()) as LiffProfile;
  } catch (error) {
    console.warn('LIFF profile unavailable (preview/standalone mode):', error);
    return null;
  }
}
