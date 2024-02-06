import { Suggestion } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import { Autocomplete } from "../utils/graphql/queries.ts";
import {
  AutocompleteQuery,
  AutocompleteQueryVariables,
  ProductFragment,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";
import { toProduct } from "../utils/transform.ts";

export interface Props {
  query: string;
  limit?: number;
}

/**
 * @title Wake Integration
 * @description Product Suggestion loader
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Suggestion | null> => {
  const { storefront } = ctx;
  const { query, limit = 10 } = props;

  const headers = parseHeaders(req.headers);

  if (!query) return null;

  const data = await storefront.query<
    AutocompleteQuery,
    AutocompleteQueryVariables
  >({
    variables: { query, limit },
    ...Autocomplete,
  }, {
    headers,
  });

  const { products: wakeProducts, suggestions = [] } = data.autocomplete ?? {};

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

export default action;
