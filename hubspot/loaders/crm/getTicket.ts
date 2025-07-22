import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { SimplePublicObject } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Ticket ID
   * @description The ID of the ticket to retrieve
   */
  ticketId: string;

  /**
   * @title Properties
   * @description A comma-separated list of ticket properties to return
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
   * @description Whether to return archived tickets
   */
  archived?: boolean;
}

/**
 * @title Get Ticket
 * @description Retrieve a specific support ticket from HubSpot CRM by ID
 */
export default async function getTicket(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject | null> {
  const {
    ticketId,
    properties,
    propertiesWithHistory,
    associations,
    archived,
  } = props;

  try {
    const client = new HubSpotClient(ctx);
    const ticket = await client.getObject("tickets", ticketId, {
      properties,
      propertiesWithHistory,
      associations,
      archived,
    });

    return ticket;
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return null;
  }
}
