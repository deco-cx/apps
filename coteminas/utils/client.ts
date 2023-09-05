import {ProductCategoryResult} from "./types.ts"

export interface API{
    "GET /api/product-catalog/resolve-route?path=/vm/:category": {
        response: ProductCategoryResult;
        searchParams: { page: string }
    };
}