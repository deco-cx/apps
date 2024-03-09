import type { SiteNavigationElement } from "../../commerce/types.ts";
import { STALE } from "../../utils/fetch.ts";
import { AppContext } from "../mod.ts";
import { categoryTreeToNavbar } from "../utils/transform.ts";

export interface Props {
  /**
   * @description Number of levels of categories to be returned
   *  @default 2
   */
  levels?: number;
}

const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SiteNavigationElement[] | null> => {
  const { vcsDeprecated } = ctx;
  const { levels = 2 } = props;

  const tree = await vcsDeprecated
    ["GET /api/catalog_system/pub/category/tree/:level"](
      { level: levels },
      STALE,
    ).then((res) => res.json());

  return categoryTreeToNavbar(tree);
};

export default loader;
