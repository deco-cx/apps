import type { Person, Suggestion } from "../../../commerce/types.ts";
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

  /**
   * @title User
   * @description Used to sync user data with linx impulse
   */
  user?: Person | null;
  /**
   * @title Force Source
   * @description Force the source of the request
   */
  forceSource?: "desktop" | "mobile";

  /**
   * @ignore
   */
  userId?: string;
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
  const { query, count = 20, user, userId: _userId, forceSource } = props;
  const userId = _userId ?? user?.["@id"];

  if (!query) return null;

  const search = await api["GET /engage/search/v3/autocompletes"]({
    apiKey,
    origin,
    prefix: query,
    deviceId: getDeviceIdFromBag(ctx),
    resultsProducts: count,
    resultsQueries: count,
    salesChannel: ctx.salesChannel,
    source: forceSource ?? getSource(ctx),
    productFormat: "complete",
    userId,
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
