import { Product } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { search } from "../../utils/product.ts";

interface Props {
  /**
   * @title Count
   * @description Max number of products to return
   */
  hitsPerPage: number;

  /**
   * @title Query
   * @description Full text search query
   */
  q?: string;

  /**
   * @title Filter by facets
   * @description https://typesense.org/docs/0.25.1/api/search.html#filter-parameters
   */
  filterBy?: string;
}

/**
 * @title Typesense Integration
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  const index = await ctx.products();

  const { products } = await search(
    {
      q: props.q || "*",
      filter_by: props.filterBy,
      per_page: props.hitsPerPage,
    },
    index,
    req.url,
  );

  return products;
};

export default loader;
