import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { Paging, SimplePublicObject } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Limit
   * @description The maximum number of communications to return (max 100)
   */
  limit?: number;

  /**
   * @title After
   * @description The paging cursor token of the last successfully read resource will be returned as the paging.next.after JSON property of a paged response containing more results
   */
  after?: string;

  /**
   * @title Properties
   * @description A comma-separated list of communication properties to return
   */
  properties?: string[];

  /**
   * @title Associations
   * @description Object types to retrieve associated IDs for
   */
  associations?: string[];

  /**
   * @title Include Archived
   * @description Whether to return archived communications
   */
  archived?: boolean;
}

export interface CommunicationsResponse {
  results: SimplePublicObject[];
  paging?: Paging;
}

/**
 * @title Get Communications
 * @description Retrieve a list of communications from HubSpot CRM
 */
export default async function getCommunications(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CommunicationsResponse> {
  const { limit = 10, after, properties, associations, archived } = props;

  try {
    const client = new HubSpotClient(ctx);
    const response = await client.listCommunications({
      limit: Math.min(limit, 100), // Ensure we don't exceed API limits
      after,
      properties,
      associations,
      archived,
    });

    return {
      results: response.results || [],
      paging: response.paging,
    };
  } catch (error) {
    console.error("Error fetching communications:", error);
    return {
      results: [],
    };
  }
}
