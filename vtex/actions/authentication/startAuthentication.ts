import { AppContext } from "../../mod.ts";
import { getSegmentFromBag } from "../../utils/segment.ts";
import { StartAuthentication } from "../../utils/types.ts";

export interface Props {
  callbackUrl?: string;
  returnUrl?: string;
  appStart?: boolean;
}

/**
 * @title Start Authentication
 * @description Initiates the authentication process with VTEX.
 */
export default async function action(
  {
    callbackUrl = "/",
    returnUrl = "/",
    appStart = true,
  }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<StartAuthentication> {
  const { vcsDeprecated, account } = ctx;
  const segment = getSegmentFromBag(ctx);

  const response = await vcsDeprecated
    ["GET /api/vtexid/pub/authentication/start"]({
      locale: segment?.payload.cultureInfo ?? "pt-BR",
      scope: account,
      appStart,
      callbackUrl,
      returnUrl,
    });

  if (!response.ok) {
    throw new Error(
      `Failed to start authentication. ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  return data;
}
