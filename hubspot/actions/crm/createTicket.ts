import { logger } from "@deco/deco/o11y";
import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type {
  SimplePublicObject,
  SimplePublicObjectInput,
} from "../../utils/types.ts";

export interface Props {
  /**
   * @title Ticket required data
   * @description Required data for creating a ticket
   */
  requiredData: {
    subject: string;
    hs_pipeline_stage: string;
  };

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
  const { requiredData, properties, associations } = props;

  const client = new HubSpotClient(ctx);

  const ticketInput: SimplePublicObjectInput = {
    properties: {
      ...requiredData,
      ...properties,
    },
    ...(associations && { associations }),
  };

  try {
    const ticket = await client.createObject("tickets", ticketInput);
    return ticket;
  } catch (error) {
    logger.error(error);
    throw new Error("Failed to create ticket");
  }
}
