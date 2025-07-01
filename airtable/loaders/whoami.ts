import { unauthorized } from "@deco/deco";
import type { AppContext } from "../mod.ts";
import type { WhoamiResponse } from "../utils/types.ts";
import { OverrideAuthHeaderProps } from "../../mcp/oauth.ts";
import { OAUTH_CLIENT_OVERRIDE_AUTH_HEADER_NAME } from "../../mcp/utils/httpClient.ts";

/**
 * @title Get Current User
 * @description Fetches the current user's information.
 */
const loader = async (
  props: OverrideAuthHeaderProps,
  _req: Request,
  ctx: AppContext,
): Promise<WhoamiResponse> => {
  if (!ctx.client) {
    throw unauthorized({
      message: "OAuth authentication is required",
    });
  }

  const opts: RequestInit = {};
  if (props.accessToken) {
    opts.headers = new Headers({
      [OAUTH_CLIENT_OVERRIDE_AUTH_HEADER_NAME]: `Bearer ${props.accessToken}`,
    });
  }
  const response = await ctx.client["GET /v0/meta/whoami"]({}, opts);

  if (!response.ok) {
    throw new Error(`Error getting user: ${response.statusText}`);
  }

  return response.json();
};

export default loader;
