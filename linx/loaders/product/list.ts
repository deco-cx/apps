import type { Product } from "../../../commerce/types.ts";
import { STALE } from "../../../utils/fetch.ts";
import { nullOnNotFound } from "../../../utils/http.ts";
import type { AppContext } from "../../mod.ts";
import { isGridProductsModel } from "../../utils/paths.ts";
import { toProduct } from "../../utils/transform.ts";

export interface Props {
  /** @description e.g.: /listas/vitrine-destaque */
  path: string;
}

/**
 * @title LINX Integration
 * @description Product List loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  const url = req.url;
  const { api, cdn } = ctx;
  const { path } = props;
  const splat = path?.[0] === "/" ? path.slice(1) : path;

  const params = {
    splat: splat.endsWith(".json") ? splat : `${splat}.json`,
    fc: "false",
  };

  const response = await api["GET /*splat"](params, STALE)
    .then((res) => res.json())
    .catch(nullOnNotFound);

  if (!response || !isGridProductsModel(response)) {
    return null;
  }

  const products = response?.Model?.Grid?.Products ?? [];

  return products.map((product) =>
    toProduct(product, product.ProductSelection?.SkuID, {
      cdn,
      url,
      currency: "BRL",
    })
  );
};

export default loader;
