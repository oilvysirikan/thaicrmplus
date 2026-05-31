import { Env, LINE_PUSH_URL, getSessionFromRequest, timingSafeEqual, json } from "../../_lib/line";

interface PushRequest {
  to: string;
  messages?: { type: string; text?: string }[];
  text?: string;
}

// Sends a push message via the LINE Messaging API.
// Auth: a logged-in LINE admin session, or the x-api-key shared secret.
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN) {
    return json({ error: "messaging_not_configured" }, 503);
  }

  const session = await getSessionFromRequest(request, env);
  const apiKey = request.headers.get("x-api-key");
  const apiKeyOk = Boolean(env.PUSH_API_KEY && apiKey && timingSafeEqual(env.PUSH_API_KEY, apiKey));
  if (!session && !apiKeyOk) {
    return json({ error: "unauthorized" }, 401);
  }

  let payload: PushRequest;
  try {
    payload = (await request.json()) as PushRequest;
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  if (!payload.to) return json({ error: "missing_to" }, 400);
  const messages = payload.messages ?? (payload.text ? [{ type: "text", text: payload.text }] : []);
  if (messages.length === 0) return json({ error: "missing_messages" }, 400);

  const res = await fetch(LINE_PUSH_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ to: payload.to, messages }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return json({ error: "line_push_failed", status: res.status, detail }, 502);
  }
  return json({ ok: true, sent: messages.length });
};
