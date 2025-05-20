import { CLIENT_ID } from "../../utils/constant.ts";
import type { AppContext } from "../../mod.ts";

/**
 * @title Refresh Token
 * @description Gera um novo access_token usando o refresh_token salvo no contexto.
 */
export default async function refreshToken(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
) {
  const { authClient } = ctx;
  const currentConfig = await ctx.getConfiguration();

  if (!currentConfig.refresh_token) {
    return {
      error: true,
      message: "Nenhum refresh_token encontrado no contexto."
    };
  }

  const response = await authClient["POST /token"]({
    client_id: CLIENT_ID,
    client_secret: "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", 
    grant_type: "refresh_token",
    refresh_token: currentConfig.refresh_token,
  } as any); 

  if (!response.ok) {
    return {
      error: true,
      status: response.status,
      message: "Erro ao tentar renovar o token.",
      details: await response.text(),
    };
  }

  const tokens = await response.json();

  await ctx.configure({
    ...currentConfig,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_in: tokens.expires_in,
    scope: tokens.scope,
    token_type: tokens.token_type,
  });

  return {
    success: true,
    ...tokens,
  };
} 