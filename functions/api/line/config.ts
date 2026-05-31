import { Env, json } from "../../_lib/line";

// Public, non-secret configuration the front-end needs to render LINE features.
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  return json({
    loginEnabled: Boolean(env.LINE_LOGIN_CHANNEL_ID && env.LINE_LOGIN_CHANNEL_SECRET),
    messagingEnabled: Boolean(env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN && env.LINE_MESSAGING_CHANNEL_SECRET),
    liffId: env.LINE_LIFF_ID || null,
  });
};
