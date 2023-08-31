import type { Navbar } from "../../commerce/types.ts";
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
): Promise<Navbar[] | null> => {
  const { vcs } = ctx;
  const { levels = 2 } = props;

  const response = await vcs
    ["GET /api/catalog_system/pub/category/tree/:level"]({
      level: levels,
    }, {
      deco: { cache: "stale-while-revalidate" },
    });

  const tree = await response.json();

  return categoryTreeToNavbar(tree);
};

export default loader;
