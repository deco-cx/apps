import { TokenBaseSalesforce } from "./types.ts";
import { AppContext } from "../mod.ts";
import { encode } from "std/encoding/base64.ts";

export interface Props {
  grantType: string;
  refreshToken?: string;
}

export default async function authApi(
  props: Props,
  ctx: AppContext,
): Promise<null | TokenBaseSalesforce> {
  const { grantType, refreshToken } = props;

  const { slc, organizationId, clientId, clientSecret } = ctx;

  const headers = new Headers({
    Authorization: `Basic ${encode(clientId + ":" + clientSecret)}`,
    "Content-Type": "application/x-www-form-urlencoded",
  });

  const params = new URLSearchParams();

  params.set("grant_type", grantType);
  if (refreshToken) {
    params.set("refresh_token", refreshToken);
  }

  const response = await slc
    ["POST /shopper/auth/v1/organizations/:organizationId/oauth2/token"](
      {
        organizationId,
      },
      {
        body: params,
        headers: headers,
      },
    );

  return response.json();
}
