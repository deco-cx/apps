import { CLIENT_ID } from "./constant.ts";
import type { AppContext } from "../mod.ts";

/**
 * Função utilitária para executar loaders/actions com refresh automático de token.
 * Se o token expirar, faz o refresh e reexecuta a função original.
 */
export async function withAutoRefresh<T>(
  fn: (props: any, req: Request, ctx: AppContext) => Promise<T>,
  props: any,
  req: Request,
  ctx: AppContext,
): Promise<T> {
  let result = await fn(props, req, ctx);

  // Detecta token expirado pelo status ou header
  const tokenExpired = (result && (result as any).status === 401) ||
    req.headers.get("X-Token-Expired") === "true";

  if (tokenExpired) {
    const currentConfig = await ctx.getConfiguration();
    const { authClient } = ctx;

    // Faz o refresh do token
    const refreshResponse = await authClient["POST /token"]({
      client_id: CLIENT_ID,
      client_secret: "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", // TODO: Coloque o client_secret correto e seguro
      grant_type: "refresh_token",
      refresh_token: currentConfig.refresh_token,
    });
    const newTokens = await refreshResponse.json();

    // Atualiza o contexto com os novos tokens
    await ctx.configure({
      ...currentConfig,
      access_token: newTokens.access_token,
      refresh_token: newTokens.refresh_token,
      expires_in: newTokens.expires_in,
      scope: newTokens.scope,
      token_type: newTokens.token_type,
    });

    // Reexecuta a função original com o novo token
    result = await fn(props, req, ctx);
  }

  return result;
} 