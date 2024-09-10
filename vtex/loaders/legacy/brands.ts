import { Brand } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { toBrand } from "../../utils/transform.ts";

interface Props {
  /**
   * @description Indicates whether to filter inactive brands
   */
  filterInactive?: boolean;
}

/**
 * @title VTEX Brand List - Legacy
 */
const loaders = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Brand[] | null> => {
  const { filterInactive = false } = props;
  const { vcsDeprecated } = ctx;

  const brands = await vcsDeprecated["GET /api/catalog_system/pub/brand/list"](
    {},
  )
    .then((r) => r.json())
    .catch(() => null);

  if (!brands) {
    return null;
  }

  if (filterInactive) {
    return brands.filter((brand) => brand.isActive).map(toBrand);
  }

  return brands.map(toBrand);
};

export default loaders;
