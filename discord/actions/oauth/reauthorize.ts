import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @title Force Re-authorization
   * @description Set to true to clear expired tokens and get new OAuth URL
   */
  forceReauth?: boolean;
}

/**
 * @name REAUTHORIZE_OAUTH
 * @title Re-authorize OAuth
 * @description Clears expired tokens and provides new OAuth URL for re-authorization
 */
export default async function reauthorize(
  { forceReauth }: Props,
  req: Request,
  ctx: AppContext,
): Promise<{
  message: string;
  oauthUrl?: string;
  needsReauth: boolean;
}> {
  const currentConfig = await ctx.getConfiguration();
  
  // Scopes necessários para usar OAuth em vez de Bot Token
  const scopes = [
    "identify",           // Informações básicas do usuário
    "guilds",             // Lista de servidores do usuário
    "guilds.members.read", // Membros dos servidores
    "messages.read",       // Ler mensagens
    "bot",                // Permissões de bot (se necessário)
  ].join("%20");
  
  const oauthUrl = `https://discord.com/oauth2/authorize?client_id=${currentConfig.clientId}&redirect_uri=${encodeURIComponent(new URL("/oauth/callback", req.url).href)}&response_type=code&scope=${scopes}`;
  
  if (forceReauth) {
    // Limpar tokens expirados
    await ctx.configure({
      ...currentConfig,
      tokens: undefined,
    });
    
    return {
      message: "OAuth tokens cleared. Please use the provided URL to re-authorize.",
      oauthUrl,
      needsReauth: true,
    };
  }
  
  // Verificar se precisa de re-autorização
  const hasValidTokens = currentConfig.tokens?.access_token && currentConfig.tokens?.refresh_token;
  
  if (!hasValidTokens) {
    return {
      message: "No valid OAuth tokens found. Re-authorization required.",
      oauthUrl,
      needsReauth: true,
    };
  }
  
  return {
    message: "OAuth tokens appear to be valid.",
    needsReauth: false,
  };
} 