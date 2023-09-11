import type { Product } from "../../commerce/types.ts";
import { gql } from "../../utils/graphql.ts";
import type { AppContext } from "../mod.ts";
import { fragment } from "../utils/graphql/fragments/product.ts";
import {
  GetProductsQuery,
  GetProductsQueryVariables,
  ProductFragment,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { toProduct } from "../utils/transform.ts";

export interface Props {
  /**
   * @title Count
   * @description Number of products to return
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
  filters: {
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
    brandId?: string[];
    /** @description The set of category IDs which the result item category ID must be included in. */
    categoryId?: string[];
    /** @description The set of EANs which the result item EAN must be included. */
    ean?: string[];
    /** @description Retrieve the product variant only if it contains images. */
    hasImages?: boolean;
    /** @description Retrieve the product variant only if it is the main product variant. */
    mainVariant?: boolean;
    /** @description The set of prices to filter. */
    prices?: {
      /** @description The product discount must be greater than or equal to. */
      discount_gte?: number;
      /** @description The product discount must be lesser than or equal to. */
      discount_lte?: number;
      /** @description Return only products where the listed price is more than the price. */
      discounted?: boolean;
      /** @description The product price must be greater than or equal to. */
      price_gte?: number;
      /** @description The product price must be lesser than or equal to. */
      price_lte?: number;
    };
    /** @description The product unique identifier (you may provide a list of IDs if needed). */
    productId?: number[];
    /** @description The product variant unique identifier (you may provide a list of IDs if needed). */
    productVariantId?: number[];
    /** @description A product ID or a list of IDs to search for other products with the same parent ID. */
    sameParentAs?: number[];
    /** @description The set of SKUs which the result item SKU must be included. */
    sku?: string[];
    /** @description Show products with a quantity of available products in stock greater than or equal to the given number. */
    stock_gte?: number;
    /** @description Show products with a quantity of available products in stock less than or equal to the given number. */
    stock_lte?: number;
    /** @description The set of stocks to filter. */
    stocks?: {
      dcId?: number[];
      /** @description The distribution center names to match. */
      dcName?: string[];
      /** @description The product stock must be greater than or equal to. */
      stock_gte?: number;
      /** @description The product stock must be lesser than or equal to. */
      stock_lte?: number;
    };
    /** @description Retrieve products which the last update date is greater than or equal to the given date. */
    updatedAt_gte?: string;
    /** @description Retrieve products which the last update date is less than or equal to the given date. */
    updatedAt_lte?: string;
  };
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

  const data = await storefront.query<
    GetProductsQuery,
    GetProductsQueryVariables
  >({
    variables: props,
    fragments: [fragment],
    query:
      gql`query GetProducts($filters: ProductExplicitFiltersInput!, $first: Int!, $sortDirection: SortDirection!, $sortKey: ProductSortKeys) { products(filters: $filters, first: $first, sortDirection: $sortDirection, sortKey: $sortKey) { nodes { ...Product } }}`,
  });

  const products = data.products?.nodes;

  if (!Array.isArray(products)) {
    return null;
  }

  return products
    .filter((node): node is ProductFragment => Boolean(node))
    .map((node) => toProduct(node, { base: url }));
};

export default productListLoader;
