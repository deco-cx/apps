export interface City {
  territory_id: string;
  territory_name: string;
  state_code: string;
  publication_urls: string[];
  level: string;
}

export interface Gazette {
  territory_id: string;
  date: string;
  url: string;
  territory_name: string;
  state_code: string;
  highlight: string;
  edition: string;
  is_extra_edition: boolean;
  scraped_at: string;
  power: string;
}

export interface GazetteContent extends Gazette {
  content: string;
  entities: Record<string, unknown>[];
}

export interface QueridoDiarioClient {
  "GET /cities": {
    response: {
      cities: City[];
    };
    searchParams: {
      city_name?: string;
      state_code?: string;
    };
  };
  "GET /gazettes": {
    response: {
      total_gazettes: number;
      gazettes: Gazette[];
    };
    searchParams: {
      territory_ids?: string[];
      published_since?: string;
      published_until?: string;
      querystring?: string;
      excerpt_size?: number;
      number_of_excerpts?: number;
      pre_tags?: string;
      post_tags?: string;
      offset?: number;
      size?: number;
      sort_by?: "relevance" | "descending_date" | "ascending_date";
    };
  };
  "GET /gazettes/:gazette_id": {
    response: GazetteContent;
  };
}
