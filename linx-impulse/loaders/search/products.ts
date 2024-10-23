import type { Suggestion } from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import { getDeviceIdFromBag } from "../../utils/deviceId.ts";
import getSource from "../../utils/source.ts";
import { toProduct } from "../../utils/transform.ts";

interface Props {
  query?: string;
  /**
   * @description limit the number of products
   * @default 5
   */
  count?: number;
  categoryId?: string;
}

/**
 * @title Linx Impulse Autocomplete Products
 * @description Product Suggestion loader
 */
const loaders = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Suggestion | null> => {
  const { api, apiKey, origin, cdn } = ctx;
  const { query = "", count = 20, categoryId } = props;

  const search = await api["GET /engage/search/v3/autocompletes/products"]({
    terms: query,
    resultsProducts: count,
    categoryId,
    apiKey,
    origin,
    deviceId: getDeviceIdFromBag(ctx),
    salesChannel: ctx.salesChannel,
    source: getSource(ctx),
    productFormat: "complete",
  })
    .then((res) => res.json())
    .catch(() => null);

  if (!search) return null;

  const result = {
    searches: [],
    products: search.products.map((product) =>
      toProduct(product, new URL(req.url).origin, cdn)
    ),
  };

  return result;
};

export default loaders;
