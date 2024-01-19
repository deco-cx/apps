import { ProductFormat, Source } from "./types/linx.ts";
import { AutocompleteResponse, InteractionType } from "./types/search.ts";

export interface LinxAPI {
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

  "GET /engage/search/v3/clicks": {
    response: void;
    searchParams: {
      apiKey: string;
      secretKey: string;
      trackingId: string;
      deviceId: string;
      source: Source;
      userId?: string;
      interactionType?: InteractionType;
    };
  };
}
