import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type {
  SimplePublicObject,
  SimplePublicObjectInput,
} from "../../utils/types.ts";

export interface Props {
  /**
   * @title Ticket Properties
   * @description Key-value pairs of ticket properties
   */
  properties: Record<string, string>;

  /**
   * @title Associations
   * @description Objects to associate with this ticket
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
 * @title Create Ticket
 * @description Create a new support ticket in HubSpot CRM
 */
export default async function createTicket(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject> {
  const { properties, associations } = props;

  const client = new HubSpotClient(ctx);

  const ticketInput: SimplePublicObjectInput = {
    properties,
    ...(associations && { associations }),
  };

  const ticket = await client.createObject("tickets", ticketInput);
  return ticket;
}
