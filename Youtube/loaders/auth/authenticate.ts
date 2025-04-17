import { AppContext } from "../../mod.ts";
import { DEFAULT_AUTH_URL } from "../../utils/constant.ts";
import { getAccessToken, setAccessTokenCookie } from "../../utils/cookieAccessToken.ts";
import type { YoutubeTokenResponse } from "../../utils/types.ts";

/**
 * Opções de configuração para o processo de autenticação
 */
export interface AuthenticationOptions {
  /**
   * @description Código de autorização recebido do OAuth (opcional)
   */
  code?: string;
  
  /**
   * @description Token de acesso predefinido (opcional)
   */
  accessToken?: string;
}

export interface AuthenticationResult {
  authorizationUrl: string;
  accessToken: string | null;
}

export interface AuthenticationError {
  message: string;
  error: boolean;
  code?: number;
  details?: unknown;
}

export type AuthenticationResponse = AuthenticationResult | AuthenticationError;

/**
 * @title Youtube Authentication
 * @description Autentica o usuário na API do YouTube, gerenciando o fluxo OAuth
 */
export default async function loader(
  props: AuthenticationOptions,
  req: Request,
  ctx: AppContext,
): Promise<AuthenticationResponse> {
  const urlParams = new URL(req.url).searchParams;
  const code = props.code || urlParams.get("code");
  const { authClient, authenticationConfig } = ctx;
  const { clientId, redirectUri, scopes, clientSecret } = authenticationConfig;
  const clientSecretString = typeof clientSecret === "string" ? clientSecret : clientSecret?.get?.() ?? "";
  const { url = DEFAULT_AUTH_URL } = authenticationConfig;

  // Validação dos parâmetros obrigatórios
  if (!clientId) {
    return createErrorResponse(400, "clientId é obrigatório");
  }
  if (!redirectUri) {
    return createErrorResponse(400, "redirectUri é obrigatório");
  }
  if (!scopes) {
    return createErrorResponse(400, "scopes é obrigatório");
  }

  // Tenta obter um token de acesso existente
  const initialAccessToken = props.accessToken || getAccessToken(req);
  
  // Cria a URL de autorização para o fluxo OAuth
  const authParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes,
    access_type: "offline",
    prompt: "consent"
  });
  const authorizationUrl = `${url}?${authParams.toString()}`;

  try {
    // Tenta obter ou gerar o token de acesso
    const accessToken = await getAccessTokenForRequest({
      initialAccessToken,
      code,
      ctx,
      authClient,
      clientId,
      clientSecret: clientSecretString,
      redirectUri
    });
    
    return {
      authorizationUrl,
      accessToken,
    };
  } catch (error) {
    return createErrorResponse(
      500, 
      "Erro durante o processo de autenticação", 
      error instanceof Error ? error.message : String(error)
    );
  }
}

async function getAccessTokenForRequest({
  initialAccessToken,
  code,
  ctx,
  authClient,
  clientId,
  clientSecret,
  redirectUri
}: {
  initialAccessToken: string | null;
  code: string | null;
  ctx: AppContext;
  authClient: AppContext["invoke"]["Youtube"];
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<string | null> {
  if (initialAccessToken) {
    return initialAccessToken;
  }

  if (code) {
    try {
      const tokenData = await exchangeCodeForToken({
        authClient,
        code,
        clientId,
        clientSecret,
        redirectUri
      });
      
      if ("error" in tokenData) {
        return null;
      }

      const newAccessToken = tokenData.access_token;
      setAccessTokenCookie(ctx.response, newAccessToken);
      return newAccessToken;
    } catch (_error) {
      return null;
    }
  }
  
  return null;
}

async function exchangeCodeForToken({
  authClient,
  code, 
  clientId, 
  clientSecret,
  redirectUri,
}: {
  authClient: AppContext["invoke"]["Youtube"],
  code: string, 
  clientId: string, 
  clientSecret: string,
  redirectUri: string
}): Promise<YoutubeTokenResponse | AuthenticationError> {
  try {
    const tokenResponse = await authClient[`POST /token`](
      {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }
    );
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return createErrorResponse(
        tokenResponse.status,
        "Falha ao obter token de acesso",
        errorText
      );
    }
    
    return await tokenResponse.json() as YoutubeTokenResponse;
  } catch (error) {
    return createErrorResponse(
      500,
      "Erro ao processar troca de código por token",
      error instanceof Error ? error.message : String(error)
    );
  }
}

function createErrorResponse(code: number, message: string, details?: unknown): AuthenticationError {
  return {
    message,
    error: true,
    code,
    details
  };
}