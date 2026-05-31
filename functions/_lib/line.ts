// Shared helpers for LINE Login + LINE Messaging API, running on the
// Cloudflare Workers runtime (Web APIs only, no Node built-ins).

export interface Env {
  // LINE Login channel (https://developers.line.biz/console/ -> LINE Login)
  LINE_LOGIN_CHANNEL_ID?: string;
  LINE_LOGIN_CHANNEL_SECRET?: string;
  // Optional explicit callback URL. If unset it is derived from the request.
  LINE_LOGIN_REDIRECT_URI?: string;

  // LINE Messaging API channel (https://developers.line.biz/console/ -> Messaging API)
  LINE_MESSAGING_CHANNEL_ACCESS_TOKEN?: string;
  LINE_MESSAGING_CHANNEL_SECRET?: string;

  // LIFF id used by the customer-facing membership page.
  LINE_LIFF_ID?: string;

  // Secret used to sign the admin session cookie. Falls back to the login
  // channel secret if not provided so the app still works with minimal config.
  SESSION_SECRET?: string;

  // Optional shared secret to protect the push endpoint when there is no
  // logged-in admin session (e.g. server-to-server automation calls).
  PUSH_API_KEY?: string;

  // Where to send the user after a successful / failed LINE login.
  APP_BASE_URL?: string;
}

export const LINE_AUTHORIZE_URL = "https://access.line.me/oauth2/v2.1/authorize";
export const LINE_TOKEN_URL = "https://api.line.me/oauth2/v2.1/token";
export const LINE_PROFILE_URL = "https://api.line.me/v2/profile";
export const LINE_VERIFY_URL = "https://api.line.me/oauth2/v2.1/verify";
export const LINE_PUSH_URL = "https://api.line.me/v2/bot/message/push";
export const LINE_REPLY_URL = "https://api.line.me/v2/bot/message/reply";
export const LINE_BOT_INFO_URL = "https://api.line.me/v2/bot/info";

const COOKIE_NAME = "line_session";
const STATE_COOKIE = "line_oauth_state";

export interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  email?: string;
}

export function json(data: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}

export function getSessionSecret(env: Env): string {
  return env.SESSION_SECRET || env.LINE_LOGIN_CHANNEL_SECRET || env.LINE_MESSAGING_CHANNEL_SECRET || "dev-insecure-secret";
}

/** Compute the redirect URI for the LINE Login callback. */
export function getRedirectUri(request: Request, env: Env): string {
  if (env.LINE_LOGIN_REDIRECT_URI) return env.LINE_LOGIN_REDIRECT_URI;
  const url = new URL(request.url);
  return `${url.origin}/api/line/callback`;
}

/** Base URL of the front-end app for post-login redirects. */
export function getAppBaseUrl(request: Request, env: Env): string {
  if (env.APP_BASE_URL) return env.APP_BASE_URL;
  return new URL(request.url).origin;
}

// --- Crypto helpers (HMAC-SHA256 via Web Crypto) ---

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function base64UrlEncode(input: string): string {
  return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  return atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
}

async function hmacSha256(secret: string, data: ArrayBuffer | Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const buffer = data instanceof Uint8Array ? data : new Uint8Array(data);
  const sig = await crypto.subtle.sign("HMAC", key, buffer);
  return new Uint8Array(sig);
}

/** Constant-time comparison of two strings. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

/**
 * Verify the x-line-signature header for a Messaging API webhook request.
 * `rawBody` must be the exact bytes LINE sent.
 */
export async function verifyLineSignature(channelSecret: string, rawBody: ArrayBuffer, signature: string | null): Promise<boolean> {
  if (!signature) return false;
  const expected = bytesToBase64(await hmacSha256(channelSecret, rawBody));
  return timingSafeEqual(expected, signature);
}

// --- Signed session cookie ---

export async function createSessionToken(profile: LineProfile, secret: string): Promise<string> {
  const payload = base64UrlEncode(JSON.stringify({ ...profile, iat: Date.now() }));
  const sig = base64UrlEncode(String.fromCharCode(...(await hmacSha256(secret, new TextEncoder().encode(payload)))));
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token: string, secret: string): Promise<LineProfile | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = base64UrlEncode(String.fromCharCode(...(await hmacSha256(secret, new TextEncoder().encode(payload)))));
  if (!timingSafeEqual(expected, sig)) return null;
  try {
    return JSON.parse(base64UrlDecode(payload)) as LineProfile;
  } catch {
    return null;
  }
}

// --- Cookie helpers ---

export function parseCookies(request: Request): Record<string, string> {
  const header = request.headers.get("cookie") || "";
  const out: Record<string, string> = {};
  header.split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx > -1) out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  return out;
}

export function sessionCookie(value: string, maxAgeSeconds: number): string {
  const attrs = [
    `${COOKIE_NAME}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];
  return attrs.join("; ");
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function stateCookie(value: string): string {
  return `${STATE_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`;
}

export function clearStateCookie(): string {
  return `${STATE_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const STATE_COOKIE_NAME = STATE_COOKIE;

export async function getSessionFromRequest(request: Request, env: Env): Promise<LineProfile | null> {
  const token = parseCookies(request)[COOKIE_NAME];
  if (!token) return null;
  return verifySessionToken(token, getSessionSecret(env));
}

export { bytesToBase64, base64ToBytes };
