import { AppContext } from "../mod.ts";
import { ObterInfoContaModelResponse } from "../types.ts";

/**
 * @title Get Company Information
 * @description Retrieves information about the company account
 */
const loader = async (
  _props: Record<string, never>,
  _req: Request,
  ctx: AppContext,
): Promise<ObterInfoContaModelResponse> => {
  try {
    const response = await ctx.api["GET /info"]({});
    return await response.json();
  } catch (error) {
    console.error("Error fetching company info:", error);
    throw error;
  }
};

export default loader;
