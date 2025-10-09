import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

export interface Props {
  /**
   * @description Promotion name to search for
   */
  byName: string;
}

export const defaultVisibility = "private";

/**
 * @title Search Promotions By Name
 * @description Search for promotions by name
 */
export default async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<unknown[]> {
  const { vcs } = ctx;
  const { byName } = props;
  const { cookie } = parseCookie(req.headers, ctx.account);

  const promotions = await vcs
    ["GET /api/rnb/pvt/calculatorconfiguration/_search"](
      { byName },
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

