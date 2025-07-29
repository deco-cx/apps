import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { SimplePublicObject } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Deal ID
   * @description The ID of the deal to retrieve
   */
  dealId: string;

  /**
   * @title Properties
   * @description A comma-separated list of deal properties to return
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

/**
 * @title Get Deal
 * @description Retrieve a specific deal from HubSpot CRM by ID
 */
export default async function getDeal(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject | null> {
  const { dealId, properties, propertiesWithHistory, associations, archived } =
    props;

  try {
    const client = new HubSpotClient(ctx);
    const deal = await client.getObject("deals", dealId, {
      properties,
      propertiesWithHistory,
      associations,
      archived,
    });

    return deal;
  } catch (error) {
    console.error("Error fetching deal:", error);
    return null;
  }
}
