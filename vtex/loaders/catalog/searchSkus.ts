import { AppContext } from "../../mod.ts";
import { LegacyProduct } from "../../utils/types.ts";
import { STALE } from "../../../utils/fetch.ts";

export interface Props {
  /**
   * @description Search term to find SKUs/Products
   */
  term: string;
  /**
   * @description Filter by category ID
   */
  category?: string;
  /**
   * @description Filter by brand ID
   */
  brand?: string;
  /**
   * @description Page number for pagination
   * @default 0
   */
  page?: number;
  /**
   * @description Number of items per page
   * @default 50
   */
  count?: number;
}

/**
 * @title Search SKUs/Products
 * @description Search for SKUs and Products using fulltext search
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<LegacyProduct[]> {
  const { vcsDeprecated } = ctx;
  const { term, category, brand, page = 0, count = 50 } = props;

  // Build search parameters
  const _from = page * count;
  const _to = _from + count - 1;

  const searchParams: Record<string, unknown> = {
    _from,
    _to,
    ft: term, // fulltext search
  };

  // Add filters if provided
  const filters: string[] = [];
  if (category) {
    filters.push(`C:/${category}/`);
  }
  if (brand) {
    filters.push(`B:${brand}`);
  }

  if (filters.length > 0) {
    searchParams.fq = filters;
  }

  const products = await vcsDeprecated[
    "GET /api/catalog_system/pub/products/search/:term?"
  ](
    {
      term: "",
    },
    {
      ...STALE,
      searchParams,
    },
  ).then((res: Response) => res.json());

  return products;
}

