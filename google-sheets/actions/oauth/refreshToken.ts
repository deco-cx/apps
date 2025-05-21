import { AppContext } from "../../mod.ts";
import { CLIENT_ID } from "../../utils/constant.ts";


/**
 * @name REFRESH_TOKEN
 * @title Refresh GitHub Token
 * @description Atualiza o token de acesso usando o refresh token existente
 */
export default async function refreshToken(
  _: unknown,
  _req: Request,
  ctx: AppContext,
) {
  const { authClient, refresh_token: _refresh_token } = ctx;
  const currentCtx = await ctx.getConfiguration();
    
  const refresh_token = _refresh_token || currentCtx.refresh_token;
  
  if (!refresh_token) {
    return {
      success: false,
      message:
        "Não há refresh token disponível. É necessário autenticar novamente.",
    };
  }

  try {
    const response = await authClient [`POST /token`]({
      client_id: CLIENT_ID,
      client_secret: "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",
      refresh_token: refresh_token,
      redirect_uri: new URL("/oauth/callback", _req.url).href,
      grant_type: "refresh_token",
    });

    const refreshResponse = await response.json();

    if (refreshResponse.access_token) {
      const new_refresh_token = refreshResponse.refresh_token || refresh_token;
      
      await ctx.configure({
        ...currentCtx,
        access_token: refreshResponse.access_token,
        refresh_token: new_refresh_token,
        expires_in: refreshResponse.expires_in,
        scope: refreshResponse.scope || currentCtx.scope,
        token_type: refreshResponse.token_type || currentCtx.token_type,
        tokenObtainedAt: Math.floor(Date.now() / 1000),
      });

      console.log("refreshResponse", refreshResponse);

      return {
        success: true,
        message: "Token atualizado com sucesso",
        expires_in: refreshResponse.expires_in,
      };
    } else {
      return {
        success: false,
        message: "Falha ao atualizar o token",
      };
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: `Erro ao atualizar o token: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}