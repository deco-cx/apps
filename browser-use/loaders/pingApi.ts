import { AppContext } from "../mod.ts";

/**
 * @title Ping API
 * @description Check if the Browser Use API is running and responsive
 */
const loader = async (
  _props: Record<string, never>,
  _req: Request,
  ctx: AppContext,
): Promise<boolean> => {
  try {
    await ctx.api["GET /api/v1/ping"]({});
    return true;
  } catch (error) {
    console.error("Error pinging API:", error);
    return false;
  }
};

export default loader;
