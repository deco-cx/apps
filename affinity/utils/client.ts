export interface Organization {
  id: number;
  name: string;
  domain: string;
  person_ids: number[];
  opportunity_ids: number[];
  created_at: string;
  updated_at: string;
}

export interface AffinityAPI {
  /**
   * Get a specific organization by ID
   * @see https://api-docs.affinity.co/#get-a-specific-organization
   */
  "GET /organizations/:organizationId": {
    response: Organization;
  };

  /**
   * Search for organizations
   * @see https://api-docs.affinity.co/#search-for-organizations
   */
  "GET /organizations": {
    searchParams?: {
      term: string;
    };
    response: {
      organizations: Organization[];
      next_page_token?: string;
    };
  };
}

