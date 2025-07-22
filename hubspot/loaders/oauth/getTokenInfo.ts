import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { AccessTokenInfo } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Access Token
   * @description The access token to retrieve information about
   */
  token?: string;
}

/**
 * @title Get OAuth Token Information
 * @description Retrieve metadata about an OAuth access token, including user info and scopes
 */
export default async function getTokenInfo(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<AccessTokenInfo | null> {
  const { token } = props;

  if (!token) {
    return null;
  }

  try {
    const client = new HubSpotClient(ctx);
    const tokenInfo = await client.get<{
      token: string;
      user_id: number;
      hub_id: number;
      app_id: number;
      expires_at: number;
      user: string;
      scopes: string[];
    }>(`/oauth/v1/access-tokens/${token}`);

    return tokenInfo;
  } catch (error) {
    console.error("Error fetching token info:", error);
    return null;
  }
}
