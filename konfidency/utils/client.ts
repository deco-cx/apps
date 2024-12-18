import type { PDPReview, WriteReview, ResponseWriteReview } from "./types.ts";

export interface API {
  "GET /:customer/:sku/summary": {
    response: PDPReview;
    searchParams: {
      page: number;
      pageSize: number;
    };
  };

  "POST /:customer/:sku/review": {
    response: ResponseWriteReview
    body: WriteReview;
  }
}
