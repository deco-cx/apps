import { PageReview } from "./types.ts";

export interface YourViews {
    "GET /api/v2/pub/review/:productId": {
      response: PageReview;
      searchParams: {
        page?: number;
        count?: number;
        orderBy?: number;
      };
    };
}
