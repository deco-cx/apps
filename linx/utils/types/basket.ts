import { LinxError } from "./common.ts";

export interface CartOperation {
  Errors: LinxError[];
  IsValid: boolean;
  RefreshBasket: boolean;
  ResponseCallBack: ResponseCallBack;
  SuccessMessage: null;
  Url: null;
  Warnings: unknown[];
}

export interface ResponseCallBack {
  Code: string;
  Parameters: unknown[];
  Value: string;
}

export interface Meta {
  PropertyMetadataID: number;
  PropertyName: string;
  Value: number;
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
