import { ProductBaseNuvemShop } from "./types.ts";

export interface NuvemShopAPI {
  "GET /products": {
    response: ProductBaseNuvemShop[];
    searchParams: {
      handle?: string;
      q?: string;
      sort_by?: string;
      per_page?: number;
      page?: number;
      price_max?: string | null;
      price_min?: string | null;
    };
  };
  "GET /carts/:id": {
    response: any;
  };
}
