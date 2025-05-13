import { setCookie } from "std/http/mod.ts";
import { AppContext } from "../../mod.ts";
import { AuthResponse } from "../../utils/types.ts";

export interface Props {
  email: string;
  password: string;
}

/**
 * @title VTEX Integration - Authenticate with Email and Password
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
  if (data.authStatus === "Success") {
    const VTEXID_EXPIRES = data.expiresIn;

    if (data.authCookie) {
      setCookie(ctx.response.headers, {
        name: data.authCookie.Name,
        value: data.authCookie.Value,
        httpOnly: true,
        maxAge: VTEXID_EXPIRES,
        path: "/",
        secure: true,
      });
    }

    if (data.accountAuthCookie) {
      setCookie(ctx.response.headers, {
        name: data.accountAuthCookie.Name,
        value: data.accountAuthCookie.Value,
        httpOnly: true,
        maxAge: VTEXID_EXPIRES,
        path: "/",
        secure: true,
      });
    }
  }

  await ctx.invoke.vtex.actions.session.editSession({});

  return data;
}
