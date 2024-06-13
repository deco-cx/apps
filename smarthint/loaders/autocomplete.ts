import { Suggestion } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import { toProduct } from "../utils/transform.ts";
import { getSessionCookie } from "../utils/getSession.ts";

export interface Props {
  /**
   * @hide
   */
  query?: string;
  /**
   * @description number of terms that should be returned in autocomplete
   */
  sizeProducts?: number;
  /**
   * @description number of products that should be returned in autocomplete
   */
  sizeTerms?: number;
}

/**
 * @title Smarthint Integration - Autocomplete / Suggestion
 * @description Autocomplete Loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Suggestion | null> => {
  const { api, shcode, cluster } = ctx;
  const { query, sizeProducts, sizeTerms } = props;
  const anonymous = getSessionCookie(req.headers);

  const data = await api["GET /:cluster/Search/GetSuggestionTerms"]({
    cluster,
    shcode,
    sizeProducts: sizeProducts ? String(sizeProducts) : undefined,
    sizeTerms: sizeProducts ? String(sizeTerms) : undefined,
    term: query,
    anonymous,
  }).then((r) => r.json());

  if (!data) return null;

  const products = data.Products?.map((product) => toProduct(product));

  return {
    products: products,
    searches: data.Terms?.map((termItem) => ({
      term: termItem.TermSuggestion!,
      href: `/s?busca=${termItem.TermSuggestion}`,
      hits: termItem.Order,
    })),
  };
};

export default loader;
