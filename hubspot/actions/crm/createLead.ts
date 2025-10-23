import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { Lead, SimplePublicObjectInput } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Properties
   * @description Lead properties as key-value pairs
   */
  properties: Record<string, string>;

  /**
   * @title Associations
   * @description List of associations to create with this lead
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
 * @title Create Lead
 * @description Create a new lead in HubSpot CRM
 */
export default async function createLead(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Lead> {
  const client = new HubSpotClient(ctx);

  const leadInput: SimplePublicObjectInput = {
    properties: props.properties,
    associations: props.associations,
  };

  const response = await client.createObject("leads", leadInput);

  return response;
}
