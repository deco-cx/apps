import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { Paging, SimplePublicObject } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Limit
   * @description Maximum number of contacts to return (default: 10, max: 100)
   */
  limit?: number;

  /**
   * @title After
   * @description Cursor for pagination - get results after this cursor
   */
  after?: string;

  /**
   * @title Properties
   * @description Contact properties to return
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
   * @description Whether to return archived contacts
   */
  archived?: boolean;
}

export interface ContactsResponse {
  results: SimplePublicObject[];
  paging?: Paging;
}

/**
 * @title Get Contacts
 * @description Retrieve a list of contacts from HubSpot CRM with pagination support
 */
export default async function getContacts(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ContactsResponse> {
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
    const response = await client.listObjects("contacts", {
      limit: Math.min(limit, 100), // Ensure we don't exceed API limits
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
    console.error("Error fetching contacts:", error);
    return {
      results: [],
    };
  }
}
