import { setCookie } from "std/http/mod.ts";
import type { AppContext } from "../../mod.ts";

export interface Props {
  email: string;
}

export type SendEmailVerificationResult = boolean;

/**
 * @title VTEX Integration - Send Email Verification
 * @description Sends an email verification request via VTEX API
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SendEmailVerificationResult> {
  const { vcsDeprecated } = ctx;

  if (!props.email) {
    throw new Error("Email is missing");
  }

  try {
    const startAuthentication = await ctx.invoke.vtex.actions.authentication
      .startAuthentication({});

    if (!startAuthentication?.authenticationToken) {
      console.error(
        "No authentication token returned from startAuthentication.",
      );
      return false;
    }

    const authenticationToken = startAuthentication.authenticationToken;

    const formData = new FormData();
    formData.append("authenticationToken", authenticationToken);
    formData.append("email", props.email);

    const response = await vcsDeprecated[
      "POST /api/vtexid/pub/authentication/accesskey/send"
    ]({
      deliveryMethod: "email",
    }, {
      body: formData,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      console.error(
        "Authentication request failed",
        response.status,
        response.statusText,
      );
      return false;
    }

    const data = await response.json();
    if (data?.authStatus === "InvalidToken") {
      return false;
    }

    // VtexSessionToken is valid for 10 minutes
    const SESSION_TOKEN_EXPIRES = 600;
    setCookie(ctx.response.headers, {
      name: "VtexSessionToken",
      value: authenticationToken,
      httpOnly: true,
      maxAge: SESSION_TOKEN_EXPIRES,
      path: "/",
      secure: true,
    });

    return true;
  } catch (error) {
    console.error("Unexpected error during authentication", error);
    return false;
  }
}
