import { getCookies, getSetCookies } from "std/http/cookie.ts";
import { AppContext } from "../../mod.ts";
import { getSegmentFromBag } from "../../utils/segment.ts";
import { AuthResponse } from "../../utils/types.ts";
import setLoginCookies from "../../utils/login/setLoginCookies.ts";

export interface Props {
  email: string;
  newPassword: string;
  accessKey: string;
}

/**
 * @title Recovery Password
 * @description Recovery password
 */
export default async function action(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<AuthResponse> {
  const { vcsDeprecated, account } = ctx;
  const segment = getSegmentFromBag(ctx);

  if (!props.email || !props.accessKey || !props.newPassword) {
    throw new Error("Email, accessKey and/or newPassword is missing");
  }

  const cookies = getCookies(req.headers);
  const VtexSessionToken = cookies?.["VtexSessionToken"] ?? null;

  if (!VtexSessionToken) {
    throw new Error('"VtexSessionToken" cookie is missing');
  }

  const urlencoded = new URLSearchParams();
  urlencoded.append("login", props.email);
  urlencoded.append("accessKey", props.accessKey);
  urlencoded.append("newPassword", props.newPassword);
  urlencoded.append("authenticationToken", VtexSessionToken);

  const response = await vcsDeprecated
    ["POST /api/vtexid/pub/authentication/classic/setpassword"](
      {
        locale: segment?.payload.cultureInfo || "pt-BR",
        scope: account,
      },
      {
        body: urlencoded,
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

  if (!response.ok) {
    throw new Error(
      `Authentication request failed: ${response.status} ${response.statusText}`,
    );
  }

  const data: AuthResponse = await response.json();
  const setCookies = getSetCookies(response.headers);
  await setLoginCookies(data, ctx, setCookies);

  return data;
}
