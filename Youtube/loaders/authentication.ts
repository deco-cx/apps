import { getCookies, setCookie } from "@std/http";
import type { AppContext } from "../mod.ts";

const CLIENT_ID = Deno.env.get("YOUTUBE_CLIENT_ID") ||
  "1030232647128-t3lept0ser9ik2oq333pfs53l2pnkon0.apps.googleusercontent.com";
const REDIRECT_URI = Deno.env.get("YOUTUBE_REDIRECT_URI") ||
  "http://localhost:8000/";
const SCOPES = Deno.env.get("YOUTUBE_SCOPES") ||
  "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.force-ssl";

// Tempo de expiração do cookie - 1 dia em milissegundos
const COOKIE_EXPIRATION_TIME = 24 * 60 * 60 * 1000;

export type AuthenticationResult = {
  user: {
    login: string;
    avatar_url: string;
  };
  authorizationUrl: string;
  channelData: any;
  accessToken: string | null;
};

export default async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<AuthenticationResult> {
  const urlParams = new URL(req.url).searchParams;
  const code = urlParams.get("code");
  let channelData = null;

  // Obter cookies dos cabeçalhos da requisição em vez da resposta
  const cookies = getCookies(req.headers);
  let accessToken = cookies.youtube_access_token || null;

  // Sempre definir a URL de autorização, será usada se não houver token
  const authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${CLIENT_ID}&` +
    `redirect_uri=${REDIRECT_URI}&` +
    `response_type=code&` +
    `scope=${SCOPES}&` +
    `state=state_parameter_passthrough_value`;

  if (!accessToken && code) {
    try {
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
        // Define o cookie apenas se tivermos um token válido
        setCookie(ctx.response.headers, {
          name: "youtube_access_token",
          value: accessToken,
          path: "/",
          // Expira em 1 dia
          // Isso precisa ser uma data no futuro baseada no timestamp atual
          expires: new Date(Date.now() + COOKIE_EXPIRATION_TIME),
          httpOnly: true,
          secure: true, // Apenas em HTTPS
          sameSite: "Lax",
        });

        // Busca os dados do canal diretamente aqui
        try {
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
        } catch (error) {
          console.error("Erro ao buscar dados do canal:", error);
        }
      }
    } catch (error) {
      console.error("Erro ao obter token de acesso:", error);
    }
  } else if (accessToken) {
    // Se já temos um token, vamos testar se ele ainda é válido
    try {
      const testResponse = await fetch(
        "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (testResponse.ok) {
        const channelResult = await testResponse.json();
        channelData = channelResult.items;
      } else {
        // Token expirado ou inválido, removemos o cookie
        console.error("Token existente inválido, redirecionando para login");
        accessToken = null;
        setCookie(ctx.response.headers, {
          name: "youtube_access_token",
          value: "",
          path: "/",
          expires: new Date(0), // Expira imediatamente
          secure: true,
          httpOnly: true,
        });
      }
    } catch (error) {
      console.error("Erro ao verificar token existente:", error);
      // Em caso de erro, invalidamos o token para forçar novo login
      accessToken = null;
      setCookie(ctx.response.headers, {
        name: "youtube_access_token",
        value: "",
        path: "/",
        expires: new Date(0),
        secure: true,
        httpOnly: true,
      });
    }
  }

  // Informações do usuário mais significativas quando está logado
  const user = {
    login: accessToken ? "Usuário YouTube" : "Visitante",
    avatar_url: "https://example.com/avatar.jpg",
  };

  return {
    user: user,
    authorizationUrl: authorizationUrl,
    channelData,
    accessToken,
  };
}
