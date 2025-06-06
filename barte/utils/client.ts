import { GetChargesResponse, PartialRefundResponse } from "./types.ts";
import { Props as GetChargesProps } from "../loaders/getCharges.ts";

export interface Client {
  "PATCH /charges/partial-refund/:uuid": {
    response: PartialRefundResponse;
    body: {
      value: number;
    };
  };
  "GET /charges": {
    response: GetChargesResponse;
    searchParams: GetChargesProps;
  };
}
