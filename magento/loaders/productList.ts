import type { Product } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import {
  ProductSearchInputs,
  ProductShelfGraphQL,
  ProductSort,
  FilterProps,
} from "../utils/clientGraphql/types.ts";
import { GetProduct } from "../utils/clientGraphql/queries.ts";
import {
  transformSortGraphQL,
  typeChecker,
  filtersFromLoaderGraphQL,
} from "../utils/utilsGraphQL.ts";
import { toProductGraphQL } from "../utils/transform.ts";

export interface CommomProps {
  /**
   * @title Set size
   * @default 8
   */
  pageSize: number;

  /**
   * @title Set index
   * @default 1
   */
  currentPage: number;

  /**
   * @title Default URL Path suffix
   */
  urlSuffix?: string;

  /** @title Sorting */
  sort?: ProductSort;

  /** @title Filter */
  filter?: Array<FilterProps>;
}

export interface TermProps extends CommomProps {
  /** @title Term */
  search: string;
}

export interface CategoryProps extends CommomProps {
  /** @title Categories IDs */
  categories: Array<string>;

  /** @title Use Uid for mapping category */
  useCategoryUid: boolean;
}

export interface ProductSkuProps extends Omit<CommomProps, "filter"> {
  skus: Array<string>;
}

export interface CustomProps extends Omit<CommomProps, "filter"> {
  /** @title Custom Props */
  customProps: Array<FilterProps>;
}

export interface SuggestionsFromUrl extends CommomProps {}

/**
 * @title Magento Integration - Product List
 */
export interface Props {
  props:
    | TermProps
    | CategoryProps
    | ProductSkuProps
    | CustomProps
    | SuggestionsFromUrl;
}

const fromProps = (
  { props }: Props,
  url: URL,
  urlSuffix?: string
): ProductSearchInputs => {
  const { sort } = props;
  if (typeChecker<TermProps>(props as TermProps, "search")) {
    const { search, filter } = props as TermProps;
    return {
      search,
      pageSize: props.pageSize,
      currentPage: props.currentPage,
      sort: transformSortGraphQL({ sortBy: sort?.sortBy, order: sort?.order }),
      filter: filtersFromLoaderGraphQL(filter),
    } as const;
  }

  if (typeChecker<CategoryProps>(props as CategoryProps, "categories")) {
    const { filter, categories, useCategoryUid } = props as CategoryProps;
    return {
      pageSize: props.pageSize,
      currentPage: props.currentPage,
      sort: transformSortGraphQL({ sortBy: sort?.sortBy, order: sort?.order }),
      filter: filtersFromLoaderGraphQL(
        filter?.concat([
          {
            name: useCategoryUid ? "category_uid" : "category_id",
            type: {
              in: categories,
            },
          },
        ])
      ),
    } as const;
  }

  if (typeChecker<ProductSkuProps>(props as ProductSkuProps, "skus")) {
    const { skus } = props as ProductSkuProps;
    return {
      pageSize: props.pageSize,
      currentPage: props.currentPage,
      sort: transformSortGraphQL({ sortBy: sort?.sortBy, order: sort?.order }),
      filter: filtersFromLoaderGraphQL([
        {
          name: "sku",
          type: {
            in: skus,
          },
        },
      ]),
    } as const;
  }

  if (typeChecker<CustomProps>(props as CustomProps, "customProps")) {
    const { customProps } = props as CustomProps;
    return {
      pageSize: props.pageSize,
      currentPage: props.currentPage,
      sort: transformSortGraphQL({ sortBy: sort?.sortBy, order: sort?.order }),
      filter: filtersFromLoaderGraphQL(customProps),
    } as const;
  }

  if (typeChecker<ProductSkuProps>(props as ProductSkuProps, "skus")) {
    const { skus } = props as ProductSkuProps;
    return {
      pageSize: props.pageSize,
      currentPage: props.currentPage,
      sort: transformSortGraphQL({ sortBy: sort?.sortBy, order: sort?.order }),
      filter: filtersFromLoaderGraphQL([
        {
          name: "sku",
          type: {
            in: skus,
          },
        },
      ]),
    } as const;
  }

  if (
    typeChecker<SuggestionsFromUrl>(props as SuggestionsFromUrl, "pageSize")
  ) {
    const { filter } = props as SuggestionsFromUrl;
    const regex = new RegExp("/(" + (urlSuffix ?? "") + "/)", "g");
    const slug = url.pathname.toString().replace(regex, "");
    return {
      pageSize: props.pageSize,
      currentPage: props.currentPage,
      sort: transformSortGraphQL({ sortBy: sort?.sortBy, order: sort?.order }),
      filter: slug
        ? filtersFromLoaderGraphQL(
            filter?.concat([
              {
                name: "name",
                type: { match: slug },
              },
            ])
          )
        : undefined,
    } as const;
  }

  throw new Error(`Unknown props: ${JSON.stringify(props)}`);
};

/**
 * @title Magento Integration - Product Listing loader
 */
async function loader(
  { props }: Props,
  req: Request,
  ctx: AppContext
): Promise<Product[] | null> {
  const { clientGraphql, imagesQtd } = ctx;
  const url = new URL(req.url);
  const { urlSuffix } = props;
  const formatedProps = fromProps({ props }, url, urlSuffix);
  console.log(formatedProps)

  const { products } = await clientGraphql.query<
    ProductShelfGraphQL,
    ProductSearchInputs
  >({
    variables: { ...formatedProps },
    ...GetProduct,
  });

  if (!products.items || products.items?.length === 0) {
    return null;
  }

  return products.items.map((p) =>
    toProductGraphQL(
      p,
      url,
      imagesQtd,
      urlSuffix ? formatUrlSuffix(urlSuffix) : undefined
    )
  );
}

const formatUrlSuffix = (str: string) => {
  str = str.startsWith("/") ? str.slice(0, -1) : str;
  str = str.endsWith("/") ? str : str + "/";
  return str;
};

export default loader;
