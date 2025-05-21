import { AppContext } from "../../mod.ts";
import {
  CLIENT_ID,
  GITHUB_URL_OAUTH_ACCESS_TOKEN,
} from "../../utils/constant.ts";

interface Props {
  code: string;
  returnUrl?: string;
  redirectUri: string;
  clientSecret: string;
}

export default async function callback(
  { code, returnUrl, redirectUri, clientSecret }: Props,
  _req: Request,
  ctx: AppContext,
) {
  const currentCtx = await ctx.getConfiguration();
  console.log(clientSecret);
  const response = await fetch(`${GITHUB_URL_OAUTH_ACCESS_TOKEN}`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const authResponse = await response.json();

  await ctx.configure({
    ...currentCtx,
    access_token: authResponse.access_token,
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
          <title>GitHub Autenticado</title>
          <style>
            body { font-family: Arial, sans-serif; background: #181818; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .container { background: #202020; padding: 40px 32px; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.3); text-align: center; }
            .gh-logo { width: 64px; margin-bottom: 16px; }
            h1 { color: #fff; margin-bottom: 12px; }
            p { color: #ccc; font-size: 1.1em; }
            .close { margin-top: 24px; color: #fff; background: #333; border: none; border-radius: 6px; padding: 10px 24px; font-size: 1em; cursor: pointer; transition: background 0.2s; }
            .close:hover { background: #444; }
          </style>
        </head>
        <body>
          <div class="container">
            <img class="gh-logo" src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub Logo" />
            <h1>Autenticado!</h1>
            <p>Você se autenticou com o GitHub.<br>Agora pode fechar esta página.</p>
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
