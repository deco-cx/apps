import { AuthResponse } from "../../utils/types.ts";
import { AppContext } from "../../mod.ts";
import { setCookie } from "std/http/mod.ts";

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

  console.log("executou a action");

  if (!props.email || !props.password) {
    console.error("Email and/or password is missing:", props);
    return null;
  }

  try {
    const startAuthentication = await ctx.invoke(
      "vtex/loaders/login/startAuthentication.ts",
    );

    if (!startAuthentication?.authenticationToken) {
      console.error("Error during startAuthentication", startAuthentication);
      return null;
    }

    console.log({ startAuthentication });
    const { authenticationToken } = startAuthentication;

    const myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

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
            ...myHeaders,
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
    console.log({ data });
    if (data.authStatus === "Success") {
      const VTEXID_EXPIRES = data.expiresIn;

      setCookie(ctx.response.headers, {
        name: data.authCookie.Name,
        value: data.authCookie.Value,
        httpOnly: true,
        maxAge: VTEXID_EXPIRES,
        path: "/",
        secure: true,
      });

      setCookie(ctx.response.headers, {
        name: data.accountAuthCookie.Name,
        value: data.accountAuthCookie.Value,
        httpOnly: true,
        maxAge: VTEXID_EXPIRES,
        path: "/",
        secure: true,
      });
    }

    return data;
  } catch (error) {
    console.error("Unexpected error during authentication", error);
    return null;
  }
}
