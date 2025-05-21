import { AppContext } from "../../mod.ts";
import { CLIENT_ID } from "../../utils/constant.ts";

interface Props {
  code: string;
  returnUrl?: string;
  redirectUri: string;
  clientSecret?: string;
}

export default async function callback(
  { code, returnUrl, clientSecret }: Props,
  req: Request,
  ctx: AppContext,
) {
  const { authClient } = ctx;
  const currenteCtx = await ctx.getConfiguration();

  const response = await authClient[`POST /token`]({
    code,
    client_id: CLIENT_ID,
    client_secret: clientSecret || "",
    redirect_uri: new URL("/oauth/callback", req.url).href,
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
    tokenObtainedAt: Math.floor(Date.now() / 1000),
  });

  if (returnUrl) {
    return Response.redirect(returnUrl);
  }

  return new Response(
    `
      <html>
        <head>
          <title>Google Sheets Authenticated</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f8f9fa; color: #202124; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .container { background: #ffffff; padding: 40px 32px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
            .gs-logo { width: 64px; margin-bottom: 16px; }
            h1 { color: #0f9d58; margin-bottom: 12px; }
            p { color: #5f6368; font-size: 1.1em; }
            .close { margin-top: 24px; color: #fff; background: #0f9d58; border: none; border-radius: 6px; padding: 10px 24px; font-size: 1em; cursor: pointer; transition: background 0.2s; }
            .close:hover { background: #0b8043; }
          </style>
        </head>
        <body>
          <div class="container">
            <img class="gs-logo" src="https://ssl.gstatic.com/docs/spreadsheets/spreadsheets_48dp.png" alt="Google Sheets Logo" />
            <h1>Autenticado!</h1>
            <p>Você foi autenticado com sucesso no Google Sheets.<br>Você pode fechar esta página agora.</p>
            <button class="close" onclick="window.close()">Fechar</button>
          </div>
        </body>
      </html>
    `,
    {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
}
