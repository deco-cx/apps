import type { Suggestion } from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import getDeviceId from "../../utils/deviceId.ts";
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
  const { api, apiKey, secretKey } = ctx;
  const { query = "", count = 20, categoryId } = props;

  const search = await api["GET /engage/search/v3/autocompletes/products"]({
    terms: query,
    resultsProducts: count,
    categoryId,
    apiKey,
    secretKey,
    deviceId: getDeviceId(req, ctx),
    salesChannel: ctx.salesChannel,
    source: ctx.device === "desktop" ? "desktop" : "mobile",
    productFormat: "complete",
  })
    .then((res) => res.json())
    .catch(() => null);

  if (!search) return null;

  const origin = new URL(req.url).origin;
  const result = {
    searches: [],
    products: search.products.map((product) => toProduct(product, origin)),
  };

  return result;
};

export default loaders;
