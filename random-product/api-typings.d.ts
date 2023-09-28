export interface Beer {
  id:      number;
  uid:     string;
  brand:   string;
  name:    string;
  style:   string;
  hop:     string;
  yeast:   string;
  malts:   string;
  ibu:     string;
  alcohol: string;
  blg:     string;
}

export interface RandomDataApi {
  /**
   * Random beers
   */
  "GET /api/v2/beers": {
    response: Beer[];
    searchParams: {
      size?: number;
    };
  };
}
