export type Sort =
  | "relevance"
  | "topRated"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc";

export type FieldsList = "BASIC" | "DEFAULT" | "FULL";

export interface Facet {
  key: string;
  value: string;
}

export interface VariantOptionQualifier {
  qualifier: string;
  value: string;
  image?: {
    format: string;
    imageType: string;
    url: string;
  };
}

export interface VariantOption {
  code: string;
  priceData: {
    currencyIso: string;
    value: number;
  };
  url: string;
  variantOptionQualifiers: VariantOptionQualifier[];
}

export interface Product {
  availableForPickup: boolean;
  averageRating: number;
  baseProduct: string;
  code: string;
  configurable: boolean;
  firstVariantImage: string;
  name: string;
  price: {
    currencyIso: string;
    formattedValue: string;
    priceType: string;
    value: number;
  };
  // priceRange: {}
  stock: {
    isValueRounded: boolean;
    stockLevelStatus: string;
  };
  summary: string;
  url: string;
  volumePricesFlag: string;
}

export interface SearchSort {
  code: string;
  name: string;
  selected: boolean;
}

export interface SearchResponse {
  type: string;
  currentQuery: {
    query: {
      value: string;
    };
    url: string;
  };
  freeTextSearch: string;
  pagination: {
    currentPage: number;
    pageSize: number;
    sort: string;
    totalPages: number;
    totalResults: number;
  };
  products: Product[];
  sorts: SearchSort[];
}

export interface Brand {
  id: string;
  name: string;
  url: string;
}

export interface Category extends Brand {
  subcategories: Category[];
}

export interface Collection extends Category {}

export interface CatalogVersion {
  categories: Category[];
  id: "Staged" | "Online";
  url: string;
}

export interface Catalogs {
  catalogVersions: CatalogVersion[];
  id: string;
  name: string;
  url: string;
}
