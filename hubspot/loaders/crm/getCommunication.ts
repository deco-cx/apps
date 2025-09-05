import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { SimplePublicObject } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Communication ID
   * @description The ID of the communication to retrieve
   */
  communicationId: string;

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
}

/**
 * @title Get Communication
 * @description Retrieve a specific communication from HubSpot CRM by ID
 */
export default async function getCommunication(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject | null> {
  const { communicationId, properties, associations } = props;

  try {
    const client = new HubSpotClient(ctx);
    const communication = await client.getCommunication(communicationId, {
      properties,
      associations,
    });

    return communication;
  } catch (error) {
    console.error("Error fetching communication:", error);
    return null;
  }
}
