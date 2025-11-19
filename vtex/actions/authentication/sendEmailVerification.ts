import { setCookie } from "std/http/mod.ts";
import type { AppContext } from "../../mod.ts";

export interface Props {
  email: string;
  locale?: string;
  parentAppId?: string;
}

export type SendEmailVerificationResult = boolean;

/**
 * @title Send Email Verification
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

  const startAuthentication = await ctx.invoke.vtex.actions.authentication
    .startAuthentication({});

  if (!startAuthentication?.authenticationToken) {
    throw new Error(
      "No authentication token returned from startAuthentication",
    );
  }

  const authenticationToken = startAuthentication.authenticationToken;

  const formData = new FormData();
  formData.append("authenticationToken", authenticationToken);
  formData.append("email", props.email);
  if (props.locale) {
    formData.append("locale", props.locale);
  }
  if (props.parentAppId) {
    formData.append("parentAppId", props.parentAppId);
  }

  try {
    const response = await vcsDeprecated[
      "POST /api/vtexid/pub/authentication/accesskey/send"
    ]({
      deliveryMethod: "email",
    }, {
      body: formData,
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Authentication request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    if (data?.authStatus === "InvalidToken") {
      throw new Error('"Authentication Token" is invalid');
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
    console.error(error);
    return false;
  }
}
