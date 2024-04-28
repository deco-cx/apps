import { Categoria, FieldsFilter, MagentoProduct } from "./types.ts";

interface searchParams {
  [key: string]: string | number | FieldsFilter;
}

export interface API {
  /** @docs https://developer.adobe.com/commerce/webapi/rest/quick-reference/ */
  "POST /V1/guest-carts": {
    response: string;
  };

  /** @docs https://adobe-commerce.redoc.ly/2.4.7-guest/tag/products-render-info */
  "GET /rest/granado/V1/products-render-info": {
    response: {
      items: MagentoProduct[];
    };
    searchParams: searchParams;
  };

  /** @docs https://adobe-commerce.redoc.ly/2.4.7-admin/tag/productssku#operation/GetV1ProductsSku */
  "GET /rest/granado/V1/products/:sku": {
    response: MagentoProduct;
    searchParams: searchParams;
  };

  /** @docs https://adobe-commerce.redoc.ly/2.4.7-admin/tag/products#operation/GetV1Products */
  "GET /rest/granado/V1/products": {
    response: {
      items: MagentoProduct[];
    };
    searchParams: searchParams;
  };

  /** @docs https://adobe-commerce.redoc.ly/2.4.7-admin/tag/categoriescategoryId#operation/GetV1CategoriesCategoryId */
  "GET /rest/granado/V1/categories/:categoryId": {
    response: Categoria;
    searchParams: {
      categoryId: string;
      fields?: string;
    };
  };
}
