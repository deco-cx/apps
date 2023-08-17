import { categoryTreeToNavbar } from "apps/vtex/utils/transform.ts";
import { paths } from "apps/vtex/utils/paths.ts";
import type { Navbar } from "apps/commerce/types.ts";
import { AppContext } from "apps/vtex/mod.ts";
import type { Category } from "apps/vtex/utils/types.ts";
import { fetchAPI } from "apps/utils/fetch.ts";

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
