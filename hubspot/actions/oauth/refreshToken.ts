import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { TokenResponse } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Refresh Token
   * @description The refresh token to use for generating a new access token
   */
  refreshToken: string;
}

/**
 * @title Refresh OAuth Access Token
 * @description Use a refresh token to generate a new access token
 */
export default async function refreshToken(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<TokenResponse> {
  const { refreshToken } = props;
  const { clientId, clientSecret } = ctx;

  // `clientSecret` comes as a Secret loader result – extract the raw value
  const clientSecretValue = clientSecret?.get() ?? "";

  if (!clientId || !clientSecretValue) {
    throw new Error(
      "OAuth credentials (clientId, clientSecret) are required for token refresh",
    );
  }

  const client = new HubSpotClient(ctx);

  const tokenData = await client.postFormEncoded<TokenResponse>(
    "/oauth/v1/token",
    {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecretValue,
    },
  );

  return tokenData;
}
