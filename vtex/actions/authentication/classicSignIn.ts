import { AppContext } from "../../mod.ts";
import { AuthResponse } from "../../utils/types.ts";
import setLoginCookies from "../../utils/login/setLoginCookies.ts";
import { getSetCookies } from "std/http/cookie.ts";

export interface Props {
  email: string;
  password: string;
}

/**
 * @title Authenticate with Email and Password
 * @description This function authenticates a user using their email and password.
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<AuthResponse> {
  const { vcsDeprecated } = ctx;

  if (!props.email || !props.password) {
    throw new Error("Email and/or password is missing");
  }

  const startAuthentication = await ctx.invoke.vtex.actions.authentication
    .startAuthentication({});

  const authenticationToken = startAuthentication?.authenticationToken;

  if (!authenticationToken) {
    throw new Error(
      "No authentication token returned from startAuthentication",
    );
  }

  const urlencoded = new URLSearchParams();
  urlencoded.append("email", props.email);
  urlencoded.append("password", props.password);
  urlencoded.append("authenticationToken", authenticationToken);

  const response = await vcsDeprecated
    ["POST /api/vtexid/pub/authentication/classic/validate"](
      {},
      {
        body: urlencoded,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
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
