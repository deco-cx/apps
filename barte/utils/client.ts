import { PartialRefundResponse } from "./types.ts";

export interface Client {
  "PATCH /charges/partial-refund/:uuid": {
    response: PartialRefundResponse;
    body: {
      value: number;
    };
  };
}
