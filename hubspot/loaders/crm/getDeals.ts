import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { Paging, SimplePublicObject } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Limit
   * @description Maximum number of deals to return (default: 10, max: 100)
   */
  limit?: number;

  /**
   * @title After
   * @description Cursor for pagination - get results after this cursor
   */
  after?: string;

  /**
   * @title Properties
   * @description Deal properties to return
   */
  properties?: string[];

  /**
   * @title Properties with History
   * @description Properties to return with their value history
   */
  propertiesWithHistory?: string[];

  /**
   * @title Associations
   * @description Object types to retrieve associated IDs for
   */
  associations?: string[];

  /**
   * @title Include Archived
   * @description Whether to return archived deals
   */
  archived?: boolean;
}

export interface DealsResponse {
  results: SimplePublicObject[];
  paging?: Paging;
}

/**
 * @title Get Deals
 * @description Retrieve a list of deals from HubSpot CRM with pagination support
 */
export default async function getDeals(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DealsResponse> {
  const {
    limit = 10,
    after,
    properties,
    propertiesWithHistory,
    associations,
    archived,
  } = props;

  try {
    const client = new HubSpotClient(ctx);
    const response = await client.listObjects("deals", {
      limit: Math.min(limit, 100),
      after,
      properties,
      propertiesWithHistory,
      associations,
      archived,
    });

    return {
      results: response.results || [],
      paging: response.paging,
    };
  } catch (error) {
    console.error("Error fetching deals:", error);
    return {
      results: [],
    };
  }
}
