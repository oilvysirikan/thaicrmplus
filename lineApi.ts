// Client for the Cloudflare Pages Functions backend (`/api/...`).
// These endpoints handle LINE Login, the Messaging API webhook/push, and
// connection verification — work that must run server-side because it needs
// the LINE channel secret / access token.

export interface LineConfig {
  loginEnabled: boolean;
  messagingEnabled: boolean;
  liffId: string | null;
}

export interface LineSessionProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  email?: string;
}

export interface LineBotInfo {
  userId: string;
  basicId: string;
  displayName: string;
  pictureUrl?: string;
}

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "include", ...init });
  if (!res.ok) {
    let detail = "";
    try {
      detail = JSON.stringify(await res.json());
    } catch {
      detail = await res.text();
    }
    throw new Error(`Request to ${url} failed (${res.status}): ${detail}`);
  }
  return (await res.json()) as T;
}

/** Public, non-secret LINE configuration for the front-end. */
export const fetchLineConfig = () => getJson<LineConfig>("/api/line/config");

/** Returns the currently logged-in LINE profile, if any. */
export const fetchLineSession = () =>
  getJson<{ authenticated: boolean; profile?: LineSessionProfile }>("/api/line/profile");

/** Build the URL that starts the LINE Login flow. */
export const lineLoginUrl = (returnTo = "/") =>
  `/api/line/login?returnTo=${encodeURIComponent(returnTo)}`;

/** Begin LINE Login by redirecting the browser. */
export const startLineLogin = (returnTo = "/") => {
  window.location.href = lineLoginUrl(returnTo);
};

/** Clear the LINE admin session. */
export const lineLogout = () =>
  getJson<{ ok: boolean }>("/api/line/logout", { method: "POST" });

/**
 * Verify a LINE Messaging API channel access token against LINE.
 * Pass a token to validate user-entered credentials, or omit to verify the
 * server-configured token.
 */
export const verifyLineMessaging = (accessToken?: string) =>
  getJson<{ connected: boolean; configured?: boolean; bot?: LineBotInfo }>(
    "/api/line/verify",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(accessToken ? { accessToken } : {}),
    },
  );

/** Send a push message to a LINE user via the Messaging API. */
export const pushLineMessage = (to: string, text: string) =>
  getJson<{ ok: boolean; sent: number }>("/api/line/push", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ to, text }),
  });
