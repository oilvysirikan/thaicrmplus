import {
  Env,
  LINE_TOKEN_URL,
  LINE_PROFILE_URL,
  LineProfile,
  getRedirectUri,
  getAppBaseUrl,
  getSessionSecret,
  parseCookies,
  STATE_COOKIE_NAME,
  createSessionToken,
  sessionCookie,
  clearStateCookie,
  timingSafeEqual,
  json,
} from "../../_lib/line";

interface LineTokenResponse {
  access_token: string;
  id_token?: string;
  expires_in: number;
}

interface IdTokenClaims {
  email?: string;
}

function decodeIdTokenEmail(idToken?: string): string | undefined {
  if (!idToken) return undefined;
  const parts = idToken.split(".");
  if (parts.length < 2) return undefined;
  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(atob(payload + "=".repeat((4 - (payload.length % 4)) % 4))) as IdTokenClaims;
    return claims.email;
  } catch {
    return undefined;
  }
}

// Handles the LINE Login redirect: exchanges the code for a token, fetches the
// profile, and sets a signed HttpOnly session cookie.
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.LINE_LOGIN_CHANNEL_ID || !env.LINE_LOGIN_CHANNEL_SECRET) {
    return json({ error: "line_login_not_configured" }, 503);
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const appBase = getAppBaseUrl(request, env);

  if (error) {
    return Response.redirect(`${appBase}/?line_login=denied`, 302);
  }
  if (!code || !state) {
    return json({ error: "missing_code_or_state" }, 400);
  }

  const stateCookieVal = parseCookies(request)[STATE_COOKIE_NAME] || "";
  const [expectedState, returnToRaw] = stateCookieVal.split("|");
  if (!expectedState || !timingSafeEqual(expectedState, state)) {
    return json({ error: "invalid_state" }, 400);
  }
  const returnTo = returnToRaw && returnToRaw.startsWith("/") ? returnToRaw : "/";

  // Exchange authorization code for an access token.
  const tokenRes = await fetch(LINE_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: getRedirectUri(request, env),
      client_id: env.LINE_LOGIN_CHANNEL_ID,
      client_secret: env.LINE_LOGIN_CHANNEL_SECRET,
    }),
  });

  if (!tokenRes.ok) {
    const detail = await tokenRes.text();
    return json({ error: "token_exchange_failed", detail }, 502);
  }
  const token = (await tokenRes.json()) as LineTokenResponse;

  // Fetch the user's LINE profile.
  const profileRes = await fetch(LINE_PROFILE_URL, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!profileRes.ok) {
    const detail = await profileRes.text();
    return json({ error: "profile_fetch_failed", detail }, 502);
  }
  const profileData = (await profileRes.json()) as Omit<LineProfile, "email">;

  const profile: LineProfile = {
    userId: profileData.userId,
    displayName: profileData.displayName,
    pictureUrl: profileData.pictureUrl,
    statusMessage: profileData.statusMessage,
    email: decodeIdTokenEmail(token.id_token),
  };

  const sessionToken = await createSessionToken(profile, getSessionSecret(env));
  const headers = new Headers({ Location: `${appBase}${returnTo}` });
  headers.append("Set-Cookie", sessionCookie(sessionToken, 60 * 60 * 24 * 7));
  headers.append("Set-Cookie", clearStateCookie());

  return new Response(null, { status: 302, headers });
};
