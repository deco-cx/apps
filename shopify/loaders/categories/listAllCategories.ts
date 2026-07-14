import { AppContext } from "../../../shopify/mod.ts";
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

export interface Category {
  id: string;
  name: string;
  url: string;
  image?: string;
}

export interface ListAllCategories extends Array<Category> {}

/**
 * @title Shopify Integration
 * @description List All Categories
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ListAllCategories> => {
  const { storefront } = ctx;
  const { after, before, first, last, query, reverse, sortKey } = props;
  const variables = { after, before, first, last, query, reverse, sortKey };

  if (first === undefined && last === undefined) {
    variables.first = 250;
  }

  const data = await storefront.query<
    QueryRoot,
    QueryRootCollectionsArgs
  >({
    variables,
    ...ListAllCategories,
  }) as QueryRoot;

  const collections = (data?.collections?.nodes ?? []) as Collection[];
  const baseUrl = new URL(req.url).origin;

  const { hasNextPage, hasPreviousPage, endCursor, startCursor } =
    data?.collections?.pageInfo ?? {};

  return collections.map((collection) => ({
    id: collection.handle,
    name: collection.title,
    url: `${baseUrl}/collections/${collection.handle}`,
    image: collection.image?.url,
    pageInfo: {
      hasNextPage,
      hasPreviousPage,
      endCursor,
      startCursor,
    },
  }));
};

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, req: Request): string => {
  const url = new URL(req.url);

  const propsParams = new URLSearchParams();
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) {
      propsParams.set(key, String(value));
    }
  }

  propsParams.sort();
  return `${url.origin}::${propsParams.toString()}`;
};

export default loader;
