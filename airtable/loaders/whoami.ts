import { unauthorized } from "@deco/deco";
import type { AppContext } from "../mod.ts";
import type { WhoamiResponse } from "../utils/types.ts";

/**
 * @title Get Current User
 * @description Fetches the current user's information.
 */
const loader = async (
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<WhoamiResponse> => {
  if (!ctx.client) {
    throw unauthorized({
      message: "OAuth authentication is required",
    });
  }

  const response = await ctx.client["GET /v0/meta/whoami"]({});

  if (!response.ok) {
    throw new Error(`Error getting user: ${response.statusText}`);
  }

  return response.json();
};

export default loader;
