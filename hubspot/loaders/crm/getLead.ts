import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { Lead } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Lead ID
   * @description The ID of the lead to retrieve
   */
  leadId: string;

  /**
   * @title Properties
   * @description List of properties to retrieve
   */
  properties?: string[];

  /**
   * @title Properties with History
   * @description List of properties to retrieve with history
   */
  propertiesWithHistory?: string[];

  /**
   * @title Associations
   * @description List of associations to retrieve
   */
  associations?: string[];

  /**
   * @title Include Archived
   * @description Whether to include archived leads
   */
  archived?: boolean;
}

/**
 * @title Get Lead
 * @description Retrieve a specific lead by ID from HubSpot CRM
 */
export default async function getLead(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Lead | null> {
  const {
    leadId,
    properties,
    propertiesWithHistory,
    associations,
    archived,
  } = props;

  try {
    const client = new HubSpotClient(ctx);
    const lead = await client.getObject("leads", leadId, {
      properties,
      propertiesWithHistory,
      associations,
      archived,
    });

    return lead;
  } catch (error) {
    console.error("Error fetching lead:", error);
    return null;
  }
}
