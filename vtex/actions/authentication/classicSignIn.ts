import { setCookie } from "std/http/mod.ts";
import safeParse from "../../../utils/safeParse.ts";
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
): Promise<AuthResponse | null> {
  const { vcsDeprecated } = ctx;

  if (!props.email || !props.password) {
    console.error("Email and/or password is missing:", props);
    return null;
  }

  try {
    const startAuthentication = await ctx.invoke.vtex.actions.authentication
      .startAuthentication({});

    if (!startAuthentication?.authenticationToken) {
      console.error(
        "No authentication token returned from startAuthentication.",
      );
      return null;
    }

    const authenticationToken = startAuthentication.authenticationToken;

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
      console.error(
        "Authentication request failed",
        response.status,
        response.statusText,
      );
      return null;
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
  } catch (error) {
    console.error("Unexpected error during authentication", error);
    if (error instanceof Error) {
      return safeParse<AuthResponse>(error.message);
    }
    return null;
  }
}
