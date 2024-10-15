import {
  BaseProduct,
  Category,
  Order,
  OrderBy,
  Status,
  StockStatus,
} from "./types.ts";

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
      status?: Status;
      stock_status?: StockStatus;
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
      order?: Order;
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
