import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { Order } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Order ID
   * @description The ID of the order to retrieve
   */
  orderId: string;

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
   * @description Whether to include archived orders
   */
  archived?: boolean;
}

/**
 * @title Get Order
 * @description Retrieve a specific order by ID from HubSpot CRM
 */
export default async function getOrder(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Order | null> {
  const {
    orderId,
    properties,
    propertiesWithHistory,
    associations,
    archived,
  } = props;

  try {
    const client = new HubSpotClient(ctx);
    const order = await client.getObject("orders", orderId, {
      properties,
      propertiesWithHistory,
      associations,
      archived,
    });

    return order;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}
