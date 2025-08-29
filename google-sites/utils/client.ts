// Cliente de autenticação OAuth
export interface AuthClient {
  "POST /token": {
    searchParams: {
      grant_type: string;
      code?: string;
      refresh_token?: string;
      client_id: string;
      client_secret: string;
      redirect_uri?: string;
    };
    response: {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      token_type?: string;
      scope?: string;
    };
  };
}

// Interface para resposta do Google Cloud Search
export interface CloudSearchResult {
  title: string;
  snippet: string;
  link: string;
  displayLink?: string;
  formattedUrl?: string;
}

export interface CloudSearchResponse {
  results?: Array<{
    title: string;
    snippet: string;
    link: string;
    displayLink?: string;
    formattedUrl?: string;
  }>;
  searchInformation?: {
    totalResults: string;
    searchTime: number;
  };
  error?: {
    code: number;
    message: string;
  };
}

// Interface para resposta do Google Custom Search API
export interface CustomSearchItem {
  title: string;
  snippet: string;
  link: string;
  displayLink?: string;
  formattedUrl?: string;
}

export interface CustomSearchResponse {
  items?: CustomSearchItem[];
  searchInformation?: {
    totalResults: string;
    searchTime: number;
  };
  error?: {
    code: number;
    message: string;
    details?: Array<{
      "@type": string;
      reason?: string;
      domain?: string;
    }>;
  };
}

// A interface do cliente para a API do Google Drive.
export interface GoogleSearchClient {
  /**
   * Google Custom Search API
   * @see https://developers.google.com/custom-search/v1/reference/rest/v1/cse/list
   */
  "GET /customsearch/v1": {
    response: CustomSearchResponse;
    searchParams: {
      key: string;
      cx: string;
      q: string;
      start?: number;
      num?: number;
      siteSearch?: string;
      siteSearchFilter?: "e" | "i"; // e = restrict to site, i = exclude site
    };
  };

  /**
   * Busca conteúdo usando Google Cloud Search API
   * @see https://developers.google.com/workspace/cloud-search/docs/reference/rest/v1/query/search
   */
  "POST /v1/query/search": {
    response: CloudSearchResponse;
    body: {
      requestOptions?: {
        searchApplicationId?: string;
        timeZone?: string;
      };
      query: string;
      pageSize?: number;
      start?: number;
      dataSourceRestrictions?: Array<{
        source: {
          name: string;
        };
        filterOptions?: Array<{
          filter: {
            valueFilter: {
              operatorType: string;
              value: {
                stringValue?: string;
              };
            };
          };
        }>;
      }>;
    };
  };
}
