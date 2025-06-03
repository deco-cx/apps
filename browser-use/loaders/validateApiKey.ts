import { AppContext } from "../mod.ts";

/**
 * @title Validate API Key
 * @description Check if your Browser Use API key is valid
 */
const loader = async (
  _props: Record<string, never>,
  _req: Request,
  ctx: AppContext,
): Promise<boolean> => {
  const response = await ctx.api["GET /api/v1/me"]({});

  const result = await response.json();
  return result;
};

export default loader;
