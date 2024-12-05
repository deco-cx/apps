import type { Product } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import {
  CustomFields,
  FilterProps,
  ProductSearchInputs,
  ProductShelfGraphQL,
  ProductSort,
} from "../../utils/clientGraphql/types.ts";
import { GetProduct } from "../../utils/clientGraphql/queries.ts";
import {
  filtersFromLoaderGraphQL,
  formatUrlSuffix,
  getCustomFields,
} from "../../utils/graphql.ts";
import { STALE } from "../../../utils/fetch.ts";
import { toProductGraphQL } from "../../utils/transform.ts";
import { transformSortGraphQL, typeChecker } from "../../utils/graphql.ts";

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
   * @title Include product custom attributes
   */
  customFields: CustomFields;

  /** @title Sort options */
  sort?: ProductSort;

  /** @title Filters */
  filter?: Array<FilterProps>;
}

export interface TermProps extends CommomProps {
  /** @title Term */
  search: string;
}

export interface CategoryProps extends CommomProps {
  /** @title Categories IDs */
  categories: Array<string>;

  /**
   * @title Use "category_uid" instead of "category_id"
   * @description If enabled, the "Categories IDs" fiels must be in Base64.
   */
  useCategoryUid: boolean;
}

export interface ProductSkuProps extends Omit<CommomProps, "filter"> {
  /** @title SKUs */
  skus: Array<string>;
}

export interface CustomProps extends Omit<CommomProps, "filter"> {
  /** @title Custom Props */
  customProps: Array<FilterProps>;
}

export type SuggestionsFromUrl = CommomProps;

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
  urlSuffix?: string,
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
        ]),
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
          ]),
        )
        : undefined,
    } as const;
  }

  throw new Error(`Unknown props: ${JSON.stringify(props)}`);
};

/**
 * @title Magento Integration - Product Shelves
 * @description Product Shelves loader
 */
async function loader(
  { props }: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> {
  const {
    clientGraphql,
    imagesQtd,
    site,
    useSuffix,
    enableCache,
    minInstallmentValue,
    maxInstallments,
  } = ctx;
  const { customFields } = props;
  const url = new URL(req.url);
  const formatedProps = fromProps({ props }, url, useSuffix ? site : undefined);
  const customAttributes = getCustomFields(customFields, ctx.customAttributes);

  const { products } = await clientGraphql.query<
    ProductShelfGraphQL,
    ProductSearchInputs
  >(
    {
      variables: { ...formatedProps },
      ...GetProduct(customAttributes),
    },
    enableCache ? STALE : undefined,
  );

  if (!products.items || products.items?.length === 0) {
    return null;
  }

  return products.items.map((p) =>
    toProductGraphQL(p, {
      originURL: url,
      imagesQtd,
      defaultPath: useSuffix ? formatUrlSuffix(site) : undefined,
      customAttributes,
      minInstallmentValue,
      maxInstallments,
    })
  );
}

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, req: Request, _ctx: AppContext) => {
  const url = new URL(req.url);
  const inputs = fromProps(props, url);
  return `${JSON.stringify(inputs)}-SHELVES`;
};

export default loader;
