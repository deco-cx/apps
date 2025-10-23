import { AppContext } from "../../mod.ts";
import { getSegmentFromBag } from "../../utils/segment.ts";
import { AuthResponse } from "../../utils/types.ts";
import setLoginCookies from "../../utils/login/setLoginCookies.ts";
import { getSetCookies } from "std/http/cookie.ts";

export interface Props {
  email: string;
  currentPassword: string;
  newPassword: string;
}

/**
 * @title Redefine Password
 * @description Redefine password
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<AuthResponse> {
  const { vcsDeprecated, account } = ctx;
  const segment = getSegmentFromBag(ctx);

  if (!props.email || !props.currentPassword || !props.newPassword) {
    throw new Error("Email and/or password is missing");
  }

  const startAuthentication = await ctx.invoke.vtex.actions.authentication
    .startAuthentication({});

  if (!startAuthentication?.authenticationToken) {
    throw new Error(
      "No authentication token returned from startAuthentication",
    );
  }

  const authenticationToken = startAuthentication.authenticationToken;

  const urlencoded = new URLSearchParams();
  urlencoded.append("login", props.email);
  urlencoded.append("currentPassword", props.currentPassword);
  urlencoded.append("newPassword", props.newPassword);
  urlencoded.append("authenticationToken", authenticationToken);

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
