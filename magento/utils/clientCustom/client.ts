import {
    ReviewsAmastyAPI,
    SubmitReviewAmastyAPI,
    SubmitReviewAmastyBody,
  } from "./types.ts";
  
  
  export interface CustomAPI {
    "GET /rest/:reviewUrl/:productId": {
      response: ReviewsAmastyAPI
      searchParams: {
        reviewUrl: string,
        productId: string
      };
    };
    
    "POST /rest/:reviewUrl": {
      response: SubmitReviewAmastyAPI
      searchParams: {
        reviewUrl: string,
      };
      body: SubmitReviewAmastyBody
    }

  }