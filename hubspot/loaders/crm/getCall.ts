import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { SimplePublicObject } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Call ID
   * @description The ID of the call to retrieve
   */
  callId: string;

  /**
   * @title Properties
   * @description A comma-separated list of call properties to return
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
   * @description Whether to return archived calls
   */
  archived?: boolean;
}

/**
 * @title Get Call
 * @description Retrieve a specific call record from HubSpot CRM by ID
 */
export default async function getCall(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject | null> {
  const { callId, properties, propertiesWithHistory, associations, archived } =
    props;

  try {
    const client = new HubSpotClient(ctx);
    const call = await client.getObject("calls", callId, {
      properties,
      propertiesWithHistory,
      associations,
      archived,
    });

    return call;
  } catch (error) {
    console.error("Error fetching call:", error);
    return null;
  }
}
