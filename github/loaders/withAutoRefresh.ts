import { AppContext } from "../mod.ts";
import { ensureValidToken } from "../utils/tokenManager.ts";
import { createClientWithAutoRefresh } from "../utils/clientWithAutoRefresh.ts";
import type { SimpleUser } from "../utils/types.ts";

interface Props {
  forceRefresh?: boolean;
}

/**
 * @name WITH_AUTO_REFRESH
 * @title Get User with Auto Refresh
 * @description Exemplo de loader que demonstra o uso do auto-refresh de token.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ user: SimpleUser; tokenStatus: string }> => {
  if (props.forceRefresh) {
    const refreshed = await ensureValidToken(ctx);
    if (!refreshed) {
      throw new Error("Não foi possível atualizar o token");
    }
  }

  const clientWithRefresh = createClientWithAutoRefresh(ctx);

  const response = await clientWithRefresh["GET /user"]({});
  const user = await response.json();

  const config = await ctx.getConfiguration();
  const tokenObtainedAt = config.tokenObtainedAt || 0;
  const currentTime = Math.floor(Date.now() / 1000);
  const elapsedTime = currentTime - tokenObtainedAt;
  const expiresIn = config.expires_in || 0;
  const remainingTime = expiresIn - elapsedTime;

  const tokenStatus =
    `Token válido por mais ${remainingTime} segundos. Obtido há ${elapsedTime} segundos.`;
  console.log("tokenStatus", tokenStatus);
  return { user, tokenStatus };
};

export default loader;
