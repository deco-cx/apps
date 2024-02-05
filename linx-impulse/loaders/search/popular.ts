import type { Suggestion } from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import getDeviceId from "../../utils/deviceId.ts";
import { toProduct, toSearch } from "../../utils/transform.ts";

/**
 * @title Linx Impulse Autocomplete Popular
 * @description Product Suggestion loader
 */
const loaders = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<Suggestion | null> => {
  const { api, apiKey, secretKey } = ctx;

  const search = await api["GET /engage/search/v3/autocompletes/popular"]({
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
    searches: search.queries.map(toSearch),
    products: search.products.map((product) => toProduct(product, origin)),
  };

  return result;
};

export default loaders;
