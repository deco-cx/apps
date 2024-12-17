import type { PDPReview, WriteReview } from "./types.ts";

export interface API {
  "GET /:customer/:sku/summary": {
    response: PDPReview;
    searchParams: {
      page: number;
      pageSize: number;
    };
  };

  "POST /:customer/:sku/review": {
    searchParams: {
      sku: string;
      customer: string;
    };
    body: WriteReview;
  }
}
