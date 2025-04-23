import { AppContext } from "../mod.ts";

export default async function loader(
  _props: null,
  req: Request,
  ctx: AppContext,
) {
  const urlParams = new URL(req.url).searchParams;
  const code = urlParams.get("code");
  const { clientId, clientSecret, redirectUri } = ctx.auth;
  console.log(clientSecret);
  if (!code) {
    const authParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/presentations",
      access_type: "offline",
      prompt: "consent",
    });

    return {
      authorizationUrl:
        `https://accounts.google.com/o/oauth2/v2/auth?${authParams.toString()}`,
    };
  }

  try {
    const tokenParams = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret.get() ?? "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: tokenParams.toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      return { error: errorData };
    }

    const data = await tokenResponse.json();
    return data;
  } catch (err) {
    const error = err as Error;
    return { error: error.message };
  }
}
