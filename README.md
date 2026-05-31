<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ad8ba8e8-4e34-414c-8e3d-1ed5a9bcf860

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Backend & LINE integration

The LINE Login and LINE Messaging API integration is powered by a backend that
runs as [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)
in the [`functions/`](functions/) directory and is served from `/api/*` on the
same domain.

To run the backend locally (serves `/api/*` alongside the built front-end):

```bash
cp .dev.vars.example .dev.vars   # fill in your LINE channel values
npm run build
npx wrangler pages dev dist --port 8788 --compatibility-date 2024-11-01
```

See [docs/LINE_INTEGRATION.md](docs/LINE_INTEGRATION.md) for the full list of
endpoints, the environment variables to set in Cloudflare Pages, and the LINE
Developers Console callback/webhook URLs.
