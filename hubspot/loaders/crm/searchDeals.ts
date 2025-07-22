import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { SearchRequest, SearchResponse } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Search Query
   * @description Free text search query
   */
  query?: string;

  /**
   * @title Filter Groups
   * @description Advanced filter criteria for the search
   */
  filterGroups?: Array<{
    filters: Array<{
      propertyName: string;
      operator:
        | "EQ"
        | "NEQ"
        | "LT"
        | "LTE"
        | "GT"
        | "GTE"
        | "BETWEEN"
        | "IN"
        | "NOT_IN"
        | "HAS_PROPERTY"
        | "NOT_HAS_PROPERTY"
        | "CONTAINS_TOKEN"
        | "NOT_CONTAINS_TOKEN";
      value?: string | number;
      values?: Array<string | number>;
      highValue?: string | number;
    }>;
  }>;

  /**
   * @title Sort By
   * @description How to sort the results
   */
  sorts?: Array<{
    propertyName: string;
    direction: "ASCENDING" | "DESCENDING";
  }>;

  /**
   * @title Properties
   * @description Deal properties to return in the results
   */
  properties?: string[];

  /**
   * @title Limit
   * @description Maximum number of results to return (default: 10, max: 100)
   */
  limit?: number;

  /**
   * @title After
   * @description Cursor for pagination
   */
  after?: string;
}

/**
 * @title Search Deals
 * @description Search for deals using advanced filters and criteria
 */
export default async function searchDeals(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SearchResponse> {
  const {
    query,
    filterGroups,
    sorts,
    properties,
    limit = 10,
    after,
  } = props;

  try {
    const client = new HubSpotClient(ctx);

    const searchRequest: SearchRequest = {
      ...(query && { query }),
      ...(filterGroups && { filterGroups }),
      ...(sorts && { sorts }),
      ...(properties && { properties }),
      limit: Math.min(limit, 100),
      ...(after && { after }),
    };

    const response = await client.searchObjects("deals", searchRequest);

    return {
      total: response.total || 0,
      results: response.results || [],
      paging: response.paging,
    };
  } catch (error) {
    console.error("Error searching deals:", error);
    return {
      total: 0,
      results: [],
    };
  }
}
