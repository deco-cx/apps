import { AppContext } from "../../mod.ts";
import { StartAuthentication } from "../../utils/types.ts";
import { getSegmentFromBag } from "../../utils/segment.ts";

export interface Props {
  callbackUrl?: string;
  returnUrl?: string;
  appStart?: boolean;
}

/**
 * @title VTEX Integration - Start Authentication
 * @description Initiates the authentication process with VTEX.
 */
export default async function loader(
  {
    callbackUrl = "/",
    returnUrl = "/",
    appStart = true,
  }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<StartAuthentication | null> {
  const { vcsDeprecated, account } = ctx;
  const segment = getSegmentFromBag(ctx);

  try {
    const response = await vcsDeprecated
      ["GET /api/vtexid/pub/authentication/start"]({
        locale: segment?.payload.cultureInfo ?? "pt-BR",
        scope: account,
        appStart,
        callbackUrl,
        returnUrl,
      });

    if (!response.ok) {
      console.error(
        `Failed to start authentication. HTTP status=${response.status}`,
      );
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error during authentication:", error);
    return null;
  }
}
