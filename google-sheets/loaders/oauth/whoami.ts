import { AppContext } from "../../mod.ts";
import { UserInfo } from "../../utils/types.ts";

/**
 * @title Get Current User
 * @description Retrieves the current user's information
 */
const loader = async (
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<UserInfo> => {
  try {
    const response = await ctx.client["GET /oauth2/v2/userinfo"]({});

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Sheets API error: ${response.status} - ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(
      `Erro interno: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export default loader;
