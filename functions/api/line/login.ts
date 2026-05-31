import { Env, LINE_AUTHORIZE_URL, getRedirectUri, stateCookie, json } from "../../_lib/line";

// Starts the LINE Login (OAuth 2.1) flow by redirecting the browser to LINE.
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.LINE_LOGIN_CHANNEL_ID || !env.LINE_LOGIN_CHANNEL_SECRET) {
    return json(
      { error: "line_login_not_configured", message: "Set LINE_LOGIN_CHANNEL_ID and LINE_LOGIN_CHANNEL_SECRET." },
      503,
    );
  }

  const url = new URL(request.url);
  // Allow the caller to choose where to return after login (defaults to "/").
  const returnTo = url.searchParams.get("returnTo") || "/";
  const state = crypto.randomUUID();
  const statePayload = `${state}|${returnTo}`;

  const authorize = new URL(LINE_AUTHORIZE_URL);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("client_id", env.LINE_LOGIN_CHANNEL_ID);
  authorize.searchParams.set("redirect_uri", getRedirectUri(request, env));
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("scope", "profile openid email");

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorize.toString(),
      "Set-Cookie": stateCookie(statePayload),
    },
  });
};
