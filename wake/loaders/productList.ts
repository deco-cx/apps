import type { Product } from "../../commerce/types.ts";
import type { AppContext } from "../mod.ts";
import { getVariations } from "../utils/getVariations.ts";
import { GetProducts } from "../utils/graphql/queries.ts";
import {
  GetProductsQuery,
  GetProductsQueryVariables,
  ProductFragment,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";
import { toProduct } from "../utils/transform.ts";

export interface StockFilter {
  dcId?: number[];
  /** @description The distribution center names to match. */
  dcName?: string[];
  /**
   * @title Stock greater than or equal
   * @description The product stock must be greater than or equal to.
   */
  stock_gte?: number;
  /**
   * @title Stock less than or equal
   * @description The product stock must be lesser than or equal to.
   */
  stock_lte?: number;
}

export interface PriceFilter {
  /**
   * @title Discount greater than
   * @description The product discount must be greater than or equal to.
   */
  discount_gte?: number;
  /**
   * @title Discount lesser than
   * @description The product discount must be lesser than or equal to.
   */
  discount_lte?: number;
  /** @description Return only products where the listed price is more than the price. */
  discounted?: boolean;
  /**
   *  @title Price greater than
   *  @description The product price must be greater than or equal to.
   */
  price_gte?: number;
  /**
   * @title Price lesser than
   * @description The product price must be lesser than or equal to. */
  price_lte?: number;
}

export interface Filters {
  /** @description The set of attributes to filter. */
  attributes?: {
    id?: string[];
    name?: string[];
    type?: string[];
    value?: string[];
  };
  /** @description Choose if you want to retrieve only the available products in stock. */
  available?: boolean;
  /** @description The set of brand IDs which the result item brand ID must be included in. */
  brandId?: number[];
  /** @description The set of category IDs which the result item category ID must be included in. */
  categoryId?: number[];
  /** @description The set of EANs which the result item EAN must be included. */
  ean?: string[];
  /** @description Retrieve the product variant only if it contains images. */
  hasImages?: boolean;
  /** @description Retrieve the product variant only if it is the main product variant. */
  mainVariant?: boolean;

  /** @description The set of prices to filter. */
  prices?: PriceFilter;

  /** @description The product unique identifier (you may provide a list of IDs if needed). */
  productId?: number[];
  /** @description The product variant unique identifier (you may provide a list of IDs if needed). */
  productVariantId?: number[];
  /** @description A product ID or a list of IDs to search for other products with the same parent ID. */
  sameParentAs?: number[];
  /** @description The set of SKUs which the result item SKU must be included. */
  sku?: string[];
  /**
   *  @title Stock greater than
   *  @description Show products with a quantity of available products in stock greater than or equal to the given number. */
  stock_gte?: number;
  /**
   * @title Stock lesser than
   * @description Show products with a quantity of available products in stock less than or equal to the given number. */
  stock_lte?: number;
  /** @description The set of stocks to filter. */
  stocks?: StockFilter;
  /**
   * @title Upated after
   * @format date
   * @description Retrieve products which the last update date is greater than or equal to the given date.
   */
  updatedAt_gte?: string;
  /**
   * @title Upated before
   * @format date
   * @description Retrieve products which the last update date is less than or equal to the given date.
   */
  updatedAt_lte?: string;
}

export interface Props {
  /**
   * @title Count
   * @description Number of products to return
   * @maximum 50
   * @default 12
   */
  first: number;
  sortDirection: "ASC" | "DESC";
  sortKey:
    | "DISCOUNT"
    | "NAME"
    | "PRICE"
    | "RANDOM"
    | "RELEASE_DATE"
    | "SALES"
    | "STOCK";

  filters: Filters;

  /** @description Retrieve variantions for each product. */
  getVariations?: boolean;
}

/**
 * @title Wake Integration
 * @description Product List loader
 */
const productListLoader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  const url = new URL(req.url);
  const { storefront } = ctx;

  const headers = parseHeaders(req.headers);

  const data = await storefront.query<
    GetProductsQuery,
    GetProductsQueryVariables
  >({
    variables: props,
    ...GetProducts,
  }, {
    headers,
  });

  const products = data.products?.nodes;

  if (!Array.isArray(products)) {
    return null;
  }

  const productIDs = products.map((i) => i?.productId);

  const variations = props.getVariations
    ? await getVariations(storefront, productIDs, headers, url)
    : [];

  return products
    .filter((node): node is ProductFragment => Boolean(node))
    .map((node) => {
      const productVariations = variations?.filter((v) =>
        v.inProductGroupWithID === node.productId
      );

      return toProduct(node, { base: url }, productVariations);
    });
};

export default productListLoader;
