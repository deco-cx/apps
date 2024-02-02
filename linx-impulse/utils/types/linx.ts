export type Source = "desktop" | "mobile" | "app";

interface Images {
  [key: string | "default"]: string;
}

interface Category {
  id: string;
  name: string;
  parents: string[];
  used: boolean;
}

interface Tag {
  id: string;
  name: string;
  parents: string[] | null;
}

export interface Sku {
  sku: string;
  specs: Record<string, string[]>;
  properties?: Properties;
  images?: Images;
  price?: number;
  oldPrice?: number;
  installment?: Installment;
  url?: string;
  status?: string;
}

interface Properties {
  name?: string;
  url: string;
  images: Images;
  status: string;
  price: number;
  installment: Installment;
  oldPrice: number;
  stock?: number;
  eanCode?: string;
  details?: Record<string, unknown>;
}

interface Installment {
  count: number;
  price: number;
}

interface Spec {
  id: string;
  label: string;
  properties: unknown;
}

export interface Product {
  id: string;
  collectInfo: {
    productId: string;
    skuList: string[];
  };
  clickUrl: string;
  name: string;
  price: number;
  oldPrice: number;
  url: string;
  images: Images;
  installment: Installment;
  status: string;
  cId?: string;
  iId?: string;
  categories: Category[];
  tags?: Tag[] | null;
  specs?: Record<string, Spec[]>;
  created: string;
  brand: string | null;
  selectedSku?: string;
  skus: Sku[];
  details: Record<string, string[]>;
  description?: string;
}

export type ProductFormat = "onlyIds" | "complete" | "compact";

interface ContinuousValue {
  size: number;
  unityId: number;
  unN: string;
  min: {
    value: number;
    unity: string;
    minN: number;
  };
  max: {
    value: number;
    unity: string;
    maxN: number;
  };
  applyLink: string;
}

export interface DiscreteValue {
  label: string;
  size: number;
  idO?: string;
  id: number;
  applyLink: string;
  filters?: DiscreteValue[];
}

interface FilterBase {
  id: number;
  attribute: string;
  fType?: number;
}

interface DiscreteFilter extends FilterBase {
  type: "discrete";
  values: DiscreteValue[];
}

interface ContinuousFilter extends FilterBase {
  type: "continuous";
  values: ContinuousValue[];
}

export type Filter = DiscreteFilter | ContinuousFilter;

export interface Sort {
  label: string;
  name: string;
  type: string;
  applyLink: string;
  selected?: boolean;
}

export type SortBy =
  | "relevance"
  | "pid"
  | "ascPrice"
  | "descPrice"
  | "descDate"
  | "ascSold"
  | "descSold"
  | "ascReview"
  | "descReview"
  | "descDiscount";

export interface Banner {
  position: string;
  content: string;
}
