import { createHttpClient } from "../../utils/http.ts";
import { Client } from "./client.ts";
import { AppContext } from "../mod.ts";
import { ensureValidToken } from "./tokenManager.ts";
import { GITHUB_URL } from "./constant.ts";
import { fetchSafe } from "../../utils/fetch.ts";

export function createClientWithAutoRefresh(ctx: AppContext) {
  const fetchWithTokenRefresh = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => {
    const isValid = await ensureValidToken(ctx);

    if (!isValid) {
      throw new Error("Não foi possível obter um token válido");
    }

    const config = await ctx.getConfiguration();

    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${config.access_token}`);

    return fetchSafe(input, {
      ...init,
      headers,
    });
  };

  return createHttpClient<Client>({
    base: GITHUB_URL,
    headers: new Headers({
      "Accept": "application/json",
      "Content-Type": "application/json",
    }),
    fetcher: fetchWithTokenRefresh,
  });
}
