import { getCookies } from "std/http/cookie.ts";
import { setCookie } from "std/http/mod.ts";
import safeParse from "../../../utils/safeParse.ts";
import { AppContext } from "../../mod.ts";
import { AuthResponse } from "../../utils/types.ts";

export interface Props {
  email: string;
  accessKey: string;
}

/**
 * @title VTEX Integration - Authenticate with Email and AcessKey
 * @description Return authStatus that show if user is logged or something wrong happens.
 */
export default async function action(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<AuthResponse | null> {
  const { vcsDeprecated } = ctx;

  if (!props.email || !props.accessKey) {
    console.error("Email and/or password is missing:", props);
    return null;
  }

  try {
    const cookies = getCookies(req.headers);
    const VtexSessionToken = cookies?.["VtexSessionToken"] ?? null;

    if (!VtexSessionToken) {
      console.error("VtexSessionToken cookie is missing", VtexSessionToken);
      return null;
    }

    const body = new URLSearchParams();
    body.append("login", props.email);
    body.append("accessKey", props.accessKey);
    body.append("authenticationToken", VtexSessionToken);

    const response = await vcsDeprecated
      ["POST /api/vtexid/pub/authentication/accesskey/validate"](
        {},
        {
          body,
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
