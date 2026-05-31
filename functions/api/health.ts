import { Env, json } from "../_lib/line";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  return json({
    ok: true,
    service: "siam-connect-hub-api",
    time: new Date().toISOString(),
    integrations: {
      lineLogin: Boolean(env.LINE_LOGIN_CHANNEL_ID && env.LINE_LOGIN_CHANNEL_SECRET),
      lineMessaging: Boolean(env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN && env.LINE_MESSAGING_CHANNEL_SECRET),
      liff: Boolean(env.LINE_LIFF_ID),
    },
  });
};
