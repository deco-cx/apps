import { ClientOf, HttpError } from "../../utils/http.ts";
import { OAuthProvider, OAuthTokens } from "./types.ts";

export const isTokenExpiredByTime = (
  tokens: OAuthTokens,
  bufferSeconds = 300,
): boolean => {
  if (!tokens.expires_in || !tokens.tokenObtainedAt) return false;
  const now = Math.floor(Date.now() / 1000);
  const expirationTime = tokens.tokenObtainedAt + tokens.expires_in;
  return (now + bufferSeconds) >= expirationTime;
};

export const isRefreshTokenExpired = (error: HttpError): boolean => {
  return error.status === 400 && (
    error.message.toLowerCase().includes("invalid_grant") ||
    error.message.toLowerCase().includes("expired") ||
    error.message.toLowerCase().includes("revoked")
  );
};

export const generateAuthUrl = (
  provider: OAuthProvider,
  redirectUri: string,
  state?: string,
): string => {
  const params = new URLSearchParams({
    client_id: provider.clientId || "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: provider.scopes.join(" "),
    access_type: "offline",
    prompt: "consent",
    ...(state && { state }),
  });

  return `${provider.authUrl}?${params.toString()}`;
};

export const exchangeCodeForTokens = async <TAuthClient>(
  authClient: ClientOf<TAuthClient>,
  provider: OAuthProvider,
  code: string,
  redirectUri: string,
  tokenEndpoint: keyof TAuthClient,
): Promise<OAuthTokens> => {
  const response = await (authClient[tokenEndpoint] as unknown as (
    args: unknown,
  ) => Promise<Response>)({
    grant_type: "authorization_code",
    code,
    client_id: provider.clientId,
    client_secret: provider.clientSecret,
    redirect_uri: redirectUri,
  });

  const tokens = await response.json() as OAuthTokens;

  return {
    ...tokens,
    tokenObtainedAt: Math.floor(Date.now() / 1000),
  };
};
