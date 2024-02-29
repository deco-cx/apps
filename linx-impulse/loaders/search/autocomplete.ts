import type { Suggestion } from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import { getDeviceIdFromBag } from "../../utils/deviceId.ts";
import getSource from "../../utils/source.ts";
import { toProduct, toSearch } from "../../utils/transform.ts";

export interface Props {
  query?: string;
  /**
   * @description limit the number of searches
   * @default 5
   */
  count?: number;
}

/**
 * @title Linx Impulse Autocomplete
 * @description Product Suggestion loader
 */
const loaders = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Suggestion | null> => {
  const { api, apiKey, origin, cdn } = ctx;
  const { query, count = 20 } = props;

  if (!query) return null;

  const search = await api["GET /engage/search/v3/autocompletes"]({
    apiKey,
    origin,
    prefix: query,
    deviceId: getDeviceIdFromBag(ctx),
    resultsProducts: count,
    resultsQueries: count,
    salesChannel: ctx.salesChannel,
    source: getSource(ctx),
    productFormat: "complete",
  })
    .then((res) => res.json())
    .catch(() => null);

  if (!search) return null;

  const result = {
    searches: search.queries.map(toSearch),
    products: search.products.map((product) =>
      toProduct(product, new URL(req.url).origin, cdn)
    ),
  };

  return result;
};

export default loaders;
