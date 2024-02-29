import type { ProductFormat, SortBy, Source } from "./types/linx.ts";
import type {
  AutocompleteResponse,
  HotsiteResponse,
  InteractionType,
  NavigateResponse,
  SearchResponse,
} from "./types/search.ts";

export interface LinxAPI {
  "GET /engage/search/v3/autocompletes": {
    response: AutocompleteResponse;
    searchParams: {
      prefix: string;
      apiKey: string;
      origin?: string;
      deviceId: string;
      resultsQueries?: number;
      resultsProducts?: number;
      productFormat?: ProductFormat;
      salesChannel?: string;
      userId?: string;
      source?: Source;
    };
  };

  "GET /engage/search/v3/autocompletes/popular": {
    response: AutocompleteResponse;
    searchParams: {
      apiKey: string;
      origin?: string;
      deviceId: string;
      productFormat?: ProductFormat;
      salesChannel?: string;
      userId?: string;
      source?: Source;
    };
  };

  "GET /engage/search/v3/autocompletes/products": {
    response: Omit<AutocompleteResponse, "queries">;
    searchParams: {
      terms: string;
      apiKey: string;
      origin?: string;
      deviceId: string;
      categoryId?: string;
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
      origin?: string;
      trackingId: string;
      deviceId: string;
      source: Source;
      userId?: string;
      interactionType?: InteractionType;
    };
  };

  "GET /engage/search/v3/navigates": {
    response: NavigateResponse;
    searchParams: {
      fields?: string[];
      category?: string[];
      multicategory?: string[];
      page?: number;
      resultsPerPage?: number;
      sortBy?: SortBy;
      showOnlyAvailable?: boolean;
      allowRedirect?: boolean;
      filter?: string[];
      apiKey: string;
      origin?: string;
      deviceId: string;
      salesChannel?: string;
      productFormat?: ProductFormat;
      userId?: string;
      source?: Source;
    };
  };

  "GET /engage/search/v3/search": {
    response: SearchResponse;
    searchParams: {
      terms: string;
      pids?: string[];
      page?: number;
      resultsPerPage?: number;
      sortBy?: SortBy;
      showOnlyAvailable?: boolean;
      allowRedirect?: boolean;
      filter?: string[];
      apiKey: string;
      origin?: string;
      deviceId: string;
      salesChannel?: string;
      productFormat?: ProductFormat;
      userId?: string;
      source?: Source;
    };
  };

  "GET /engage/search/v3/hotsites": {
    response: HotsiteResponse;
    searchParams: {
      name: string;
      page?: number;
      resultsPerPage?: number;
      sortBy?: SortBy;
      showOnlyAvailable?: boolean;
      filter?: string[];
      apiKey: string;
      origin?: string;
      deviceId: string;
      salesChannel?: string;
      productFormat?: ProductFormat;
      userId?: string;
      source?: Source;
    };
  };
}
