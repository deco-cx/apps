import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { SimplePublicObject } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Company ID
   * @description The ID of the company to retrieve
   */
  companyId: string;

  /**
   * @title Properties
   * @description A comma-separated list of company properties to return
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
   * @description Whether to return archived companies
   */
  archived?: boolean;
}

/**
 * @title Get Company
 * @description Retrieve a specific company from HubSpot CRM by ID
 */
export default async function getCompany(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject | null> {
  const {
    companyId,
    properties,
    propertiesWithHistory,
    associations,
    archived,
  } = props;

  try {
    const client = new HubSpotClient(ctx);
    const company = await client.getObject("companies", companyId, {
      properties,
      propertiesWithHistory,
      associations,
      archived,
    });

    return company;
  } catch (error) {
    console.error("Error fetching company:", error);
    return null;
  }
}
