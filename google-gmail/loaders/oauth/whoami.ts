import { GoogleUserInfo } from "../../../mcp/utils/google/userInfo.ts";
import { AppContext } from "../../mod.ts";

interface Props {
  accessToken?: string;
}

/**
 * @title Get Current User
 * @description Retrieves the current user's information
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<GoogleUserInfo> => {
  try {
    const opts: RequestInit = {};

    if (props.accessToken) {
      opts.headers = {
        Authorization: `Bearer ${props.accessToken}`,
      };
    }

    const response = await ctx.userInfoClient["GET /oauth2/v2/userinfo"](
      {},
      opts,
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Gmail API error: ${response.status} - ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(
      `Erro interno: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export default loader;
