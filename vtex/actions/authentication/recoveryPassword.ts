import { getCookies } from "std/http/cookie.ts";
import { setCookie } from "std/http/mod.ts";
import safeParse from "../../../utils/safeParse.ts";
import { AppContext } from "../../mod.ts";
import { getSegmentFromBag } from "../../utils/segment.ts";
import { AuthResponse } from "../../utils/types.ts";

export interface Props {
  email: string;
  newPassword: string;
  accessKey: string;
}

/**
 * @title VTEX Integration - Recovery password
 * @description
 */
export default async function action(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<AuthResponse | null> {
  const { vcsDeprecated, account } = ctx;
  const segment = getSegmentFromBag(ctx);

  if (!props.email || !props.accessKey || !props.newPassword) {
    console.error("Email, accessKey and/or newPassword is missing:", props);
    return null;
  }

  try {
    const cookies = getCookies(req.headers);
    const VtexSessionToken = cookies?.["VtexSessionToken"] ?? null;

    if (!VtexSessionToken) {
      console.error("VtexSessionToken is missing");
      return null;
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
