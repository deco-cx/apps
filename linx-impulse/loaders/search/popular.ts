import type { Suggestion } from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import getDeviceId from "../../utils/deviceId.ts";
import getSource from "../../utils/source.ts";
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
  const { api, apiKey, secretKey, origin, cdn } = ctx;

  const search = await api["GET /engage/search/v3/autocompletes/popular"]({
    apiKey,
    secretKey,
    origin,
    deviceId: getDeviceId(req, ctx),
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
