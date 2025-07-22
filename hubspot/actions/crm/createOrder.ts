import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { Order, SimplePublicObjectInput } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Properties
   * @description Order properties as key-value pairs
   */
  properties: Record<string, string>;

  /**
   * @title Associations
   * @description List of associations to create with this order
   */
  associations?: Array<{
    to: {
      id: string;
    };
    types: Array<{
      associationCategory: string;
      associationTypeId: number;
    }>;
  }>;
}

/**
 * @title Create Order
 * @description Create a new order in HubSpot CRM
 */
export default async function createOrder(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Order> {
  const client = new HubSpotClient(ctx);

  const orderInput: SimplePublicObjectInput = {
    properties: props.properties,
    associations: props.associations,
  };

  const response = await client.createObject("orders", orderInput);

  return response;
}
