import { BaseProduct, Category, OrderBy } from "./types.ts";

export interface WooCommerceAPI {
  "GET /wc/v3/products": {
    response: BaseProduct[];
    searchParams: {
      search?: string;
      order?: "asc" | "desc";
      orderby?: OrderBy;
      per_page?: number;
      page?: number;
      slug?: string;
      parent?: string;
      parent_exclude?: string[];
      status?: "any" | "draft" | "pending" | "private" | "publish";
      stock_status?: "instock" | "outofstock" | "onbackorder";
      type?: "simple" | "grouped" | "external" | "variable";
      featured?: boolean;
      tag?: string;
      sku?: string;
      category?: string;
      attribute?: string;
      attribute_term?: string;
      include?: string[];
      exclude?: string[];
      min_price?: string;
      max_price?: string;
    };
  };
  "GET /wc/v3/products/categories": {
    response: Category[];
    searchParams: {
      page?: number;
      per_page?: number;
      order?: "asc" | "desc";
      orderby?: OrderBy;
      hide_empty?: boolean;
      parent?: number;
      search?: string;
      include?: string[];
      exclude?: string[];
      product?: number;
      slug?: string;
    };
  };
}
