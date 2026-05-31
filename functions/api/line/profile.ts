import { Env, getSessionFromRequest, json } from "../../_lib/line";

// Returns the currently logged-in LINE profile (from the session cookie).
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const profile = await getSessionFromRequest(request, env);
  if (!profile) return json({ authenticated: false }, 200);
  return json({ authenticated: true, profile });
};
