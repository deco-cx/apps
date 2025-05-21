import { createHttpClient } from "../../utils/http.ts";
import { GoogleAuthClient } from "./client.ts";
import { AppContext } from "../mod.ts";
import { ensureValidToken } from "./tokenManager.ts";
import { fetchSafe } from "../../utils/fetch.ts";
import { GOOGLE_OAUTH_URL } from "./constant.ts";

export function createClientWithAutoRefresh(ctx: AppContext) {
  const fetchWithTokenRefresh = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => {
    const isValid = await ensureValidToken(ctx);

    if (!isValid) {
      throw new Error("failed to get a valid token");
    }

    const config = await ctx.getConfiguration();

    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${config.access_token}`);

    return fetchSafe(input, {
      ...init,
      headers,
    });
  };

  return createHttpClient<GoogleAuthClient>({
    base: GOOGLE_OAUTH_URL,
    headers: new Headers({
      "Accept": "application/json",
      "Content-Type": "application/json",
    }),
    fetcher: fetchWithTokenRefresh,
  });
}
