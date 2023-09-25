import {
  ContextInformation,
  PageReview,
  ReviewForm,
  ReviewFormField,
} from "./types.ts";

export interface PowerReviews {
  "GET /m/:merchantId/l/:locale/product/:pageId/reviews": {
    response: PageReview;
    searchParams: {
      _noconfig: string;
      image_only: boolean;
      sort?: string;
      filters?: string;
      "paging.from": number;
      "paging.size": number;
    };
  };

  "GET /war/writereview": {
    response: ReviewForm;
    searchParams: {
      "merchant_id": string;
      "page_id": string;
    };
  };

  "POST /war/writereview": {
    searchParams: {
      "merchant_id": string;
      "page_id": string;
    };
    body: {
      fields: ReviewFormField[];
      context_information: ContextInformation;
    };
  };
}
