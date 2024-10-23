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
  const { vcsDeprecated, account } = ctx;
  const baseUrl = `https://${account}.vteximg.com.br/arquivos/ids`;

  const brands = await vcsDeprecated["GET /api/catalog_system/pub/brand/list"](
    {},
  )
    .then((r) => r.json())
    .catch(() => null);

  if (!brands) {
    return null;
  }

  if (filterInactive) {
    return brands.filter((brand) => brand.isActive).map((brand) =>
      toBrand(brand, baseUrl)
    );
  }

  return brands.map((brand) => toBrand(brand, baseUrl));
};

export default loaders;

export const cache = "stale-while-revalidate";
export const cacheKey = (props: Props) =>
  props.filterInactive ? "brands-filtered" : "brands";
