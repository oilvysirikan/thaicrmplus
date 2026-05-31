# LINE + Backend Integration (Cloudflare Pages Functions)

This app is a static front-end (Vite + React) deployed on **Cloudflare Pages**.
The backend that powers **LINE Login** and the **LINE Messaging API** lives in the
`functions/` directory and is deployed automatically by Cloudflare Pages as
[Pages Functions](https://developers.cloudflare.com/pages/functions/). It is
served from the same domain under `/api/*`, e.g. `https://thaicrmplus.pages.dev/api/health`.

A backend is required because the LINE Channel Secret / Channel Access Token
must never be exposed in the browser, and the Messaging API cannot be called
directly from client-side JavaScript (CORS + security).

## Endpoints

| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET  | `/api/health` | Health check + which integrations are configured |
| GET  | `/api/line/config` | Public (non-secret) config for the front-end (`loginEnabled`, `messagingEnabled`, `liffId`) |
| GET  | `/api/line/login?returnTo=/` | Starts LINE Login (redirects to LINE) |
| GET  | `/api/line/callback` | LINE Login redirect target; exchanges code → token, sets a signed session cookie |
| GET  | `/api/line/profile` | Returns the logged-in LINE profile from the session cookie |
| POST | `/api/line/logout` | Clears the session cookie |
| POST | `/api/line/webhook` | LINE Messaging API webhook (verifies `x-line-signature`) |
| POST | `/api/line/push` | Sends a push message (requires admin session or `x-api-key`) |
| GET/POST | `/api/line/verify` | Validates a Messaging API token via `GET /v2/bot/info` |

## Environment variables (Cloudflare Pages → Settings → Environment variables)

Set these on the Pages project (`thaicrmplus`) for both **Production** and **Preview**:

| Variable | Where to find it |
| -------- | ---------------- |
| `LINE_LOGIN_CHANNEL_ID` | LINE Developers Console → your **LINE Login** channel → Basic settings → Channel ID |
| `LINE_LOGIN_CHANNEL_SECRET` | Same channel → Channel secret |
| `LINE_MESSAGING_CHANNEL_ACCESS_TOKEN` | LINE Developers Console → your **Messaging API** channel → Messaging API tab → Channel access token (long-lived) |
| `LINE_MESSAGING_CHANNEL_SECRET` | Messaging API channel → Basic settings → Channel secret |
| `LINE_LIFF_ID` *(optional)* | LIFF tab → your LIFF app ID (for the customer membership page) |
| `SESSION_SECRET` *(recommended)* | Any long random string used to sign the session cookie |
| `PUSH_API_KEY` *(optional)* | Shared secret to allow server-to-server calls to `/api/line/push` |

> Treat these as **secrets** in Cloudflare (click "Encrypt"). They are read
> server-side only and never sent to the browser.

## LINE Developers Console configuration

1. **LINE Login channel → LINE Login settings → Callback URL:**
   `https://thaicrmplus.pages.dev/api/line/callback`
2. **Messaging API channel → Messaging API → Webhook URL:**
   `https://thaicrmplus.pages.dev/api/line/webhook` — then click **Verify** and enable **Use webhook**.
3. **LIFF (optional) → Endpoint URL:** the URL of your LIFF/membership page.

## Local development

```bash
npm install
cp .dev.vars.example .dev.vars   # then fill in your channel values
npm run build                    # build the static assets into dist/
npx wrangler pages dev dist --port 8788 --compatibility-date 2024-11-01
```

The functions are then available at `http://localhost:8788/api/*`. `.dev.vars`
is git-ignored and is the local equivalent of the Cloudflare environment
variables above.

## Typecheck

`npm run lint` runs `tsc --noEmit` for the front-end **and** for `functions/`
(via `functions/tsconfig.json`, which uses `@cloudflare/workers-types`).
