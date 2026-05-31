import { Env, LINE_BOT_INFO_URL, json } from "../../_lib/line";

interface VerifyRequest {
  accessToken?: string;
}

interface BotInfo {
  userId: string;
  basicId: string;
  displayName: string;
  pictureUrl?: string;
  chatMode?: string;
  markAsReadMode?: string;
}

async function fetchBotInfo(accessToken: string): Promise<Response> {
  const res = await fetch(LINE_BOT_INFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const detail = await res.text();
    return json({ connected: false, status: res.status, detail }, 200);
  }
  const info = (await res.json()) as BotInfo;
  return json({ connected: true, bot: info });
}

// GET: verify the server-configured Messaging API token.
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN) {
    return json({ connected: false, configured: false }, 200);
  }
  return fetchBotInfo(env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN);
};

// POST: validate a token supplied by the admin (e.g. from the Connections form).
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: VerifyRequest = {};
  try {
    body = (await request.json()) as VerifyRequest;
  } catch {
    // ignore - fall back to configured token
  }
  const accessToken = body.accessToken || env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN;
  if (!accessToken) {
    return json({ connected: false, configured: false }, 200);
  }
  return fetchBotInfo(accessToken);
};
