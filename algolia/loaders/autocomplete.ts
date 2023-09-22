import type { AppContext } from "../mod.ts";

interface Props {
  query?: string;

  count?: {
    /** @description number of suggested terms to return */
    suggestions?: number;
    /** @description number of suggested products to return */
    products?: number;
  };

  /** @description Enable to highlight matched terms */
  highlight?: boolean;
}

const loader = async (
  { query, count, highlight }: Props,
  _req: Request,
  ctx: AppContext,
) => {
  const client = await ctx.getClient();

  const { results } = await client.search([
    {
      indexName: "products_query_suggestions",
      params: { hitsPerPage: count?.suggestions },
      query,
    },
    {
      indexName: "products",
      params: { hitsPerPage: count?.products },
      query,
    },
  ]);

  return results;
};

export default loader;
