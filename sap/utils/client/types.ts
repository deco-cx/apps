export type Sort = "desc" | "asc";

export interface ProductGroup {
  exemple: string;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
}

export interface Brand {
  id: string;
  name: string;
  url: string;
}

export interface Category {
  id: string;
  name: string;
  url: string;
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
