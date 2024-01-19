import type { Suggestion } from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import getDeviceId from "../../utils/deviceId.ts";
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
  const { searchApi, apiKey, secretKey } = ctx;
  const { query, count = 20 } = props;

  if (!query) return null;

  const search = await searchApi["GET /engage/search/v3/autocompletes"]({
    apiKey,
    secretKey,
    prefix: query,
    deviceId: getDeviceId(req, ctx),
    resultsProducts: count,
    resultsQueries: count,
    salesChannel: ctx.salesChannel,
    source: ctx.device === "desktop" ? "desktop" : "mobile",
    productFormat: "complete",
  })
    .then((res) => res.json())
    .catch(() => null);

  if (!search) return null;

  const origin = new URL(req.url).origin;
  const result = {
    searches: search.queries.map(toSearch),
    products: search.products.map((product) =>
      toProduct(product, product.id, origin)
    ),
  };

  await Deno.writeTextFile("raw_search.json", JSON.stringify(search, null, 2));
  await Deno.writeTextFile("search.json", JSON.stringify(result, null, 2));

  return result;
};

export default loaders;
