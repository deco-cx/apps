import { LinxError, ResponseCallBack } from "./shared.ts";

export interface CartOperation {
  Errors: LinxError[];
  IsValid: boolean;
  RefreshBasket: boolean;
  ResponseCallBack: ResponseCallBack;
  SuccessMessage: null;
  Url: null;
  Warnings: unknown[];
}

export interface Meta {
  PropertyMetadataID: number;
  PropertyName: string;
  Value: string;
}

export interface CartProduct {
  ProductID: string;
  SkuID: string;
  Quantity: number;
  Metas?: Meta[];
  Name?: string;
  Url?: string;
  RetailPrice?: number;
}
