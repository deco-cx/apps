import type { Navbar } from "../../commerce/types.ts";
import { fetchAPI } from "../../utils/fetch.ts";
import { AppContext } from "../mod.ts";
import { paths } from "../utils/paths.ts";
import { categoryTreeToNavbar } from "../utils/transform.ts";
import type { Category } from "../utils/types.ts";

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
  const { levels = 2 } = props;

  const tree = await fetchAPI<Category[]>(
    paths(ctx).api.catalog_system.pub.category.tree.level(levels),
    { withProxyCache: true },
  );

  return categoryTreeToNavbar(tree);
};

export default loader;
