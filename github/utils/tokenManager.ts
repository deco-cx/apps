import { AppContext } from "../mod.ts";

export async function ensureValidToken(ctx: AppContext): Promise<boolean> {
  const config = await ctx.getConfiguration();

  if (!config.access_token) {
    return false;
  }

  const tokenExpiration = config.expires_in || 0;
  const tokenObtainedAt = config.tokenObtainedAt || 0;
  const currentTime = Math.floor(Date.now() / 1000);
  const timeElapsed = currentTime - tokenObtainedAt;

  if (tokenExpiration > 0 && timeElapsed < tokenExpiration - 300) {
    return true;
  }

  try {
    const { default: refreshToken } = await import(
      "../actions/oauth/refreshToken.ts"
    );
    const result = await refreshToken(
      {},
      new Request("https://placeholder"),
      ctx,
    );

    return result.success === true;
  } catch (error) {
    console.error("Erro ao atualizar o token:", error);
    return false;
  }
}
