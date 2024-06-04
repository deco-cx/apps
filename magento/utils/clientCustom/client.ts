import {
    ReviewsAmastyAPI,
  } from "./types.ts";
  
  
  export interface CustomAPI {
    "GET /rest/:reviewUrl/:productId": {
      response: ReviewsAmastyAPI
      searchParams: {
        reviewUrl: string,
        productId: string
      };
    };

  }