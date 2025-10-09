import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

export const defaultVisibility = "private";

/**
 * @title List All Promotions
 * @description Get all promotions and taxes configured in your store
 */
export default async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<unknown[]> {
  const { vcs } = ctx;
  const { cookie } = parseCookie(req.headers, ctx.account);

  const promotions = await vcs
    ["GET /api/rnb/pvt/calculatorconfiguration"](
      {},
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          cookie,
        },
      },
    ).then((response: Response) => response.json());

  return promotions;
}

