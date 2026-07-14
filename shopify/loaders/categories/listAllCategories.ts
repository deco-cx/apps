import { AppContext } from "../../../shopify/mod.ts";
import type { Category } from "../../../commerce/types.ts";
import {
  Collection,
  QueryRoot,
  QueryRootCollectionsArgs,
} from "../../utils/storefront/storefront.graphql.gen.ts";
import type { CollectionSortKeys } from "../../utils/storefront/storefront.graphql.gen.ts";
import { ListAllCategories } from "../../utils/storefront/queries.ts";

export interface Props {
  /**
   * @title After
   * @description Returns the elements that come after the specified cursor.
   */
  after?: string;
  /**
   * @title Before
   * @description Returns the elements that come before the specified cursor.
   */
  before?: string;
  /**
   * @title First
   * @description Returns up to the first n elements from the list.
   */
  first?: number;
  /**
   * @title Last
   * @description Returns up to the last n elements from the list.
   */
  last?: number;
  /**
   * @title Query
   * @description Apply one or multiple filters to the query. Refer to the detailed search syntax for more information about using filters.
   */
  query?: string;
  /**
   * @title Reverse
   * @description Reverse the order of the underlying list.
   * @default false
   */
  reverse?: boolean;
  /**
   * @title Sort Key
   * @description Sort the underlying list by the given key.
   * @default ID
   */
  sortKey?: CollectionSortKeys;
}

/**
 * @title Shopify Integration
 * @description List All Categories
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Category[]> => {
  const { storefront } = ctx;
  const { after, before, first, last, query, reverse, sortKey } = props;
  const count = first ?? 250;

  const data = await storefront.query<
    QueryRoot,
    QueryRootCollectionsArgs
  >({
    variables: { first: count, after, before, last, query, reverse, sortKey },
    ...ListAllCategories,
  });

  const collections = (data?.collections?.nodes ?? []) as Collection[];
  const baseUrl = new URL(req.url).origin;

  return collections.map((collection) => ({
    id: collection.handle,
    name: collection.title,
    url: collection.onlineStoreUrl ??
      `${baseUrl}/collections/${collection.handle}`,
    image: collection.image?.url,
  }));
};

export const cache = "stale-while-revalidate";

export const cacheKey = (_props: Props, req: Request): string => {
  const url = new URL(req.url);
  url.searchParams.sort();
  return url.href;
};

export default loader;
