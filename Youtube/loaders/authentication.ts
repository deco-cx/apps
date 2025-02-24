import { getCookies, setCookie } from "@std/http";
import type { AppContext } from "../mod.ts";

const CLIENT_ID = Deno.env.get("YOUTUBE_CLIENT_ID") ||
  "1030232647128-t3lept0ser9ik2oq333pfs53l2pnkon0.apps.googleusercontent.com";
const REDIRECT_URI = Deno.env.get("YOUTUBE_REDIRECT_URI") ||
  "http://localhost:8000/";
const SCOPES = Deno.env.get("YOUTUBE_SCOPES") ||
  "https://www.googleapis.com/auth/youtube.readonly";

export type AuthenticationResult = {
  user: {
    login: string;
    avatar_url: string;
  };
  authorizationUrl: string;
  channelData: any;
};

export default async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<AuthenticationResult> {
  const urlParams = new URL(req.url).searchParams;
  const code = urlParams.get("code");
  let channelData = null;
  const cookie = getCookies(ctx.response.headers);
  let accessToken = cookie.accessToken || null;
  let authorizationUrl = null;
  console.log("accessToken", accessToken);
  if (!accessToken) {
    if (code) {
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id: CLIENT_ID,
          client_secret: "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",
          redirect_uri: REDIRECT_URI,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenResponse.json();
      accessToken = tokenData.access_token;

      if (accessToken) {
        const channelResponse = await fetch(
          "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const channelResult = await channelResponse.json();
        channelData = channelResult.items;
      }
    }
    setCookie(ctx.response.headers, {
      name: "accessToken",
      value: accessToken || "",
      expires: new Date(0),
    });
    authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${CLIENT_ID}&` +
      `redirect_uri=${REDIRECT_URI}&` +
      `response_type=code&` +
      `scope=${SCOPES}&` +
      `state=state_parameter_passthrough_value`;
  }

  const user = {
    login: "exampleUser",
    avatar_url: "https://example.com/avatar.jpg",
  };

  return {
    user: user,
    authorizationUrl: authorizationUrl || "",
    channelData,
  };
}
