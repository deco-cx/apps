import { logger } from "@deco/deco/o11y";
import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { SimplePublicObject } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Ticket ID
   * @description The unique ID of the ticket to update, or a unique property value if using idProperty
   */
  ticketId: string;

  /**
   * @title ID Property
   * @description The name of a property whose values are unique for this object (optional)
   */
  idProperty?: string;

  /**
   * @title Ticket Properties
   * @description Key-value pairs of ticket properties to update. Provided values will be overwritten. Pass empty string to clear a property.
   */
  properties: Record<string, string>;
}

/**
 * @title Update Ticket
 * @description Perform a partial update of a ticket in HubSpot CRM
 */
export default async function updateTicket(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject> {
  const { ticketId, idProperty, properties } = props;

  const client = new HubSpotClient(ctx);

  try {
    // Build endpoint with optional idProperty query param
    let endpoint = `/crm/v3/objects/tickets/${ticketId}`;
    if (idProperty) {
      endpoint += `?idProperty=${encodeURIComponent(idProperty)}`;
    }

    const ticket = await client.patch<SimplePublicObject>(endpoint, {
      properties,
    });
    return ticket;
  } catch (error) {
    logger.error(error);
    throw new Error("Failed to update ticket");
  }
}
