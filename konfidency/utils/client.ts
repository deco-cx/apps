import type { PDPReview } from "./types.ts";

export interface API {
  "GET /:customer/:sku/summary": {
    response: PDPReview;
    searchParams: {
      page: number;
      pageSize: number;
    };
  };
}
