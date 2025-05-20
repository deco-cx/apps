import { AppContext } from "../../mod.ts";
import { CLIENT_ID } from "../../utils/constant.ts";
import { YoutubeTokenResponse } from "../../utils/types.ts";

interface Props {
  code: string;
  returnUrl?: string;
  redirectUri: string;
}

export default async function callback(
  { code, returnUrl, ...rest }: Props,
  _req: Request,
  ctx: AppContext,
) {
  const { authClient } = ctx;
  const currenteCtx = await ctx.getConfiguration();

  const response = await authClient[`POST /token`]({
    code,
    client_id: CLIENT_ID,
    client_secret: "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",
    redirect_uri: "http://jonasjesus--mcp.deco.site/oauth/callback",
    grant_type: "authorization_code",
  });

  const authResponse = await response.json();

  await ctx.configure({
    ...currenteCtx,
    code,
    access_token: authResponse.access_token,
    refresh_token: authResponse.refresh_token,
    expires_in: authResponse.expires_in,
    scope: authResponse.scope,
    token_type: authResponse.token_type,
  });

  if (returnUrl) {
    return Response.redirect(returnUrl);
  }

  return new Response(
    `
      <html>
        <head>
          <title>YouTube Authenticated</title>
          <style>
            body { font-family: Arial, sans-serif; background: #181818; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .container { background: #202020; padding: 40px 32px; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.3); text-align: center; }
            .yt-logo { width: 64px; margin-bottom: 16px; }
            h1 { color: #FF0000; margin-bottom: 12px; }
            p { color: #ccc; font-size: 1.1em; }
            .close { margin-top: 24px; color: #fff; background: #FF0000; border: none; border-radius: 6px; padding: 10px 24px; font-size: 1em; cursor: pointer; transition: background 0.2s; }
            .close:hover { background: #cc0000; }
          </style>
        </head>
        <body>
          <div class="container">
            <img class="yt-logo" src="https://cdn.pixabay.com/photo/2021/09/11/18/21/youtube-6616310_1280.png" alt="YouTube Logo" />
            <h1>Authenticated!</h1>
            <p>You have successfully authenticated with YouTube.<br>You can now close this page.</p>
            <button class="close" onclick="window.close()">Close</button>
          </div>
        </body>
      </html>
    `,
    {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
}
