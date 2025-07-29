import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { Property } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Object Type
   * @description The CRM object type (contacts, companies, deals, etc.)
   */
  objectType:
    | "contacts"
    | "companies"
    | "deals"
    | "tickets"
    | "products"
    | "line_items"
    | "quotes";

  /**
   * @title Include Archived
   * @description Whether to include archived properties
   */
  archived?: boolean;
}

export interface PropertiesResponse {
  results: Property[];
}

/**
 * @title Get CRM Properties
 * @description Retrieve all properties for a specific CRM object type
 */
export default async function getProperties(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<PropertiesResponse> {
  const { objectType, archived = false } = props;

  try {
    const client = new HubSpotClient(ctx);
    const response = await client.get<PropertiesResponse>(
      `/crm/v3/properties/${objectType}`,
      {
        archived,
      },
    );

    return {
      results: response.results || [],
    };
  } catch (error) {
    console.error("Error fetching properties:", error);
    return {
      results: [],
    };
  }
}
