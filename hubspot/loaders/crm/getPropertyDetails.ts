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
   * @title Property Name
   * @description The name of the property to retrieve details for
   */
  propertyName: string;

  /**
   * @title Include Archived
   * @description Whether to include archived properties
   */
  archived?: boolean;
}

export interface PropertyDetailsResponse extends Property {}

/**
 * @title Get CRM Property Details
 * @description Retrieve details for a specific CRM property
 */
export default async function getPropertyDetails(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<PropertyDetailsResponse> {
  const { objectType, propertyName, archived = false } = props;

  try {
    const client = new HubSpotClient(ctx);
    const response = await client.get<PropertyDetailsResponse>(
      `/crm/v3/properties/${objectType}/${propertyName}`,
      {
        archived,
      },
    );

    return response;
  } catch (error) {
    console.error("Error fetching property details:", error);
    throw error;
  }
}
