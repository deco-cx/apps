import type { ChaordicProduct, ChaordicSku } from "./chaordic.ts";
import type { ImpulseProduct, ImpulseSku } from "./impulse.ts";

export type Source = "desktop" | "mobile" | "app";
export type Product = ImpulseProduct | ChaordicProduct;
export type Sku = ImpulseSku | ChaordicSku;
export type ProductFormat = "onlyIds" | "complete" | "compact";
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

export interface Banner {
  position: string;
  content: string;
}
