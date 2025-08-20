
// deno-fmt-ignore-file
// deno-lint-ignore-file no-explicit-any ban-types ban-unused-ignore

export type Maybe<T> = T | null;

export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  ARN: { input: any; output: any };
  Date: { input: any; output: any };
  DateTime: { input: any; output: any };
  Decimal: { input: any; output: any };
  FormattedString: { input: any; output: any };
  HTML: { input: any; output: any };
  JSON: { input: any; output: any };
  Money: { input: any; output: any };
  StorefrontID: { input: any; output: any };
  URL: { input: any; output: any };
  UnsignedInt64: { input: any; output: any };
  UtcOffset: { input: any; output: any };
};

/** Return type for `draftOrderCalculate` mutation. */
export type DraftOrderCalculatePayload = {
  /** The calculated properties for a draft order. */
  calculatedDraftOrder?: Maybe<CalculatedDraftOrder>;
};

export interface CalculatedDraftOrder {
  /** The available shipping rates for the draft order. Requires a customer with a valid shipping address and at least one line item. */
  availableShippingRates: Array<ShippingRate>;
}

export type ShippingRate = {
  /** Human-readable unique identifier for this shipping rate. */
  handle: Scalars["String"]["output"];
  /** The cost associated with the shipping rate. */
  price: MoneyV2;
  /** The name of the shipping rate. */
  title: Scalars["String"]["output"];
};

export type MoneyV2 = {
  /** Decimal money amount. */
  amount: Scalars["Decimal"]["output"];
  /** Currency of the money. */
  currencyCode: CurrencyCode;
};

export enum CurrencyCode {
  CAD = "CAD",
  Usd = "USD",
}
