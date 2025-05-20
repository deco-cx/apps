import { AppContext } from "../../mod.ts";

interface Props {
  code: string;
  returnUrl?: string;
  redirectUri: string;
}

export default async function callback(
  { code, returnUrl }: Props,
  req: Request,
  ctx: AppContext,
) {
  const currenteCtx = await ctx.getConfiguration();

  const url = new URL(req.url);
  const redirectUri = `${url.protocol}//${url.host}${url.pathname}`;

  console.log({ redirectUri, currenteCtx, code });

  const response = await fetch('https://accounts.tiny.com.br/realms/tiny/protocol/openid-connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: Deno.env.get('TINY_CLIENT_ID') ?? '',
      client_secret: Deno.env.get('TINY_CLIENT_SECRET') ?? '',
      redirect_uri: redirectUri,
      code: code,
    }),
  });

  const authResponse = await response.json();

  console.log({ authResponse });

  await ctx.configure({
    ...currenteCtx,
    code,
    access_token: authResponse.access_token,
    refresh_token: authResponse.refresh_token,
    expires_in: authResponse.expires_in,
    refresh_expires_in: authResponse.refresh_expires_in,
    token_type: authResponse.token_type,
    id_token: authResponse.id_token,
    session_state: authResponse.session_state,
    scope: authResponse.scope,
  });

  if (returnUrl) {
    return Response.redirect(returnUrl);
  }

  return new Response(
    `
      <html>
        <head>
          <title>Tiny Authenticated</title>
          <style>
            body { font-family: Arial, sans-serif; background: #181818; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .container { background: #202020; padding: 40px 32px; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.3); text-align: center; }
            .logo { width: 64px; margin-bottom: 16px; }
            h1 { color: #00A3E0; margin-bottom: 12px; }
            p { color: #ccc; font-size: 1.1em; }
            .close { margin-top: 24px; color: #fff; background: #00A3E0; border: none; border-radius: 6px; padding: 10px 24px; font-size: 1em; cursor: pointer; transition: background 0.2s; }
            .close:hover { background: #0088b3; }
          </style>
        </head>
        <body>
          <div class="container">
            <img class="logo" src="https://www.tiny.com.br/wp-content/uploads/2021/03/logo-tiny.png" alt="Tiny Logo" />
            <h1>Authenticated!</h1>
            <p>You have successfully authenticated with Tiny.<br>You can now close this page.</p>
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