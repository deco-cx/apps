import { AppContext } from "../../mod.ts";
import {
  CLIENT_ID,
  GITHUB_URL_OAUTH_ACCESS_TOKEN,
} from "../../utils/constant.ts";

/**
 * @name REFRESH_TOKEN
 * @title Refresh GitHub Token
 * @description Atualiza o token de acesso usando o refresh token existente
 */
export default async function refreshToken(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
) {
  const currentCtx = await ctx.getConfiguration();
  console.log("currentCtx ATUALIZAR TOKEN", currentCtx);
  console.log("refresh_token", currentCtx.refresh_token);
  if (!currentCtx.refresh_token) {
    return {
      success: false,
      message:
        "Não há refresh token disponível. É necessário autenticar novamente.",
    };
  }

  try {
    const response = await fetch(`${GITHUB_URL_OAUTH_ACCESS_TOKEN}`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: "9f15d6ad56ec05ffe64f17dcfa3ea0713c1c2d69",
        refresh_token: currentCtx.refresh_token,
        grant_type: "refresh_token",
      }),
    });

    const refreshResponse = await response.json();

    if (refreshResponse.access_token) {
      await ctx.configure({
        ...currentCtx,
        access_token: refreshResponse.access_token,
        refresh_token: refreshResponse.refresh_token ||
          currentCtx.refresh_token,
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
      throw new Error("Falha ao atualizar o token");
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
