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

export interface ImpulseSku {
  sku: string;
  specs: Record<string, string[]>;
  properties: Properties;
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

export interface ImpulseProduct {
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
  skus: ImpulseSku[];
  details: Record<string, string[] | string>;
  description?: string;
}
