import { Suggestion } from "../../commerce/types.ts";
import { handleAuthError } from "../utils/authError.ts";
import { AppContext } from "../mod.ts";
import { Autocomplete } from "../utils/graphql/queries.ts";
import {
  AutocompleteQuery,
  AutocompleteQueryVariables,
  ProductFragment,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";
import { getPartnerCookie } from "../utils/partner.ts";
import { toProduct } from "../utils/transform.ts";

export interface Props {
  query: string;
  limit?: number;
}

/**
 * @title Wake Integration
 * @description Product Suggestion loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Suggestion | null> => {
  const { storefront } = ctx;
  const { query, limit = 10 } = props;

  const partnerAccessToken = getPartnerCookie(req.headers);
  const headers = parseHeaders(req.headers);

  if (!query) return null;

  let data: AutocompleteQuery | undefined;
  try {
    data = await storefront.query<
      AutocompleteQuery,
      AutocompleteQueryVariables
    >({
      variables: { query, limit, partnerAccessToken },
      ...Autocomplete,
    }, {
      headers,
    });
  } catch (error: unknown) {
    handleAuthError(error, "load product suggestions");
  }

  const { products: wakeProducts, suggestions = [] } = data?.autocomplete ?? {};

  if (!wakeProducts?.length && !suggestions?.length) return null;

  const products = wakeProducts?.filter((node): node is ProductFragment =>
    Boolean(node)
  ).map((node) => toProduct(node, { base: req.url }));

  return {
    products: products,
    searches: suggestions?.filter(Boolean)?.map((suggestion) => ({
      term: suggestion!,
    })),
  };
};

export const cache = "no-cache";

export const cacheKey = (props: Props, req: Request): string | null => {
  // Avoid cross-tenant cache bleed when a partner token is present
  if (getPartnerCookie(req.headers)) {
    return null;
  }

  const params = new URLSearchParams([
    ["query", props.query],
    ["limit", String(props.limit ?? 10)],
  ]);

  const url = new URL(req.url);
  url.search = params.toString();
  return url.href;
};

export default loader;
