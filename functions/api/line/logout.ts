import { Env, clearSessionCookie, json } from "../../_lib/line";

// Clears the LINE admin session cookie.
export const onRequestPost: PagesFunction<Env> = async () => {
  return json({ ok: true }, 200, { "Set-Cookie": clearSessionCookie() });
};

export const onRequestGet = onRequestPost;
