import { StartAuthentication } from "../../utils/types.ts";
import { AppContext } from "../../mod.ts";

/**
 * @title VTEX Integration - Start Authentication
 * @description
 */
export default async function loader(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<StartAuthentication | null> {
  const { vcsDeprecated } = ctx;

  try {
    const response = await vcsDeprecated
      ["GET /api/vtexid/pub/authentication/start"]({
        locale: ctx.locale,
        scope: ctx.account,
      });

    const data = await response.json();
    return data;
  } catch (_) {
    return null;
  }
}
