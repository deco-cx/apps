import { ProductFormat, Source } from "./types/linx.ts";
import { AutocompleteResponse } from "./types/search.ts";

export interface SearchAPI {
  "GET /engage/search/v3/autocompletes": {
    response: AutocompleteResponse;
    searchParams: {
      prefix: string;
      apiKey: string;
      secretKey: string;
      deviceId: string;
      resultsQueries?: number;
      resultsProducts?: number;
      productFormat?: ProductFormat;
      salesChannel?: string;
      userId?: string;
      source?: Source;
    };
  };
}
