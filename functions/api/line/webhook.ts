import { Env, LINE_REPLY_URL, verifyLineSignature, json } from "../../_lib/line";

interface LineWebhookEvent {
  type: string;
  replyToken?: string;
  message?: { type: string; text?: string };
  source?: { userId?: string; type?: string };
}

interface LineWebhookBody {
  destination?: string;
  events?: LineWebhookEvent[];
}

async function reply(env: Env, replyToken: string, text: string): Promise<void> {
  await fetch(LINE_REPLY_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages: [{ type: "text", text }] }),
  });
}

// Receives LINE Messaging API webhook events. Verifies the x-line-signature
// header against the channel secret before processing.
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.LINE_MESSAGING_CHANNEL_SECRET) {
    return json({ error: "messaging_not_configured" }, 503);
  }

  const rawBody = await request.arrayBuffer();
  const signature = request.headers.get("x-line-signature");
  const valid = await verifyLineSignature(env.LINE_MESSAGING_CHANNEL_SECRET, rawBody, signature);
  if (!valid) {
    return json({ error: "invalid_signature" }, 401);
  }

  let body: LineWebhookBody;
  try {
    body = JSON.parse(new TextDecoder().decode(rawBody)) as LineWebhookBody;
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const events = body.events ?? [];
  // Auto-reply to text messages (a simple echo) when we can send messages.
  if (env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN) {
    await Promise.all(
      events
        .filter((e) => e.type === "message" && e.message?.type === "text" && e.replyToken)
        .map((e) => reply(env, e.replyToken as string, `รับข้อความแล้ว: ${e.message?.text ?? ""}`)),
    );
  }

  // LINE expects a 200 response so it stops retrying.
  return json({ ok: true, received: events.length });
};
