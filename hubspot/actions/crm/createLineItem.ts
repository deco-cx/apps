import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type {
  SimplePublicObject,
  SimplePublicObjectInput,
} from "../../utils/types.ts";

export interface Props {
  /**
   * @title Line Item Properties
   * @description Key-value pairs of line item properties
   */
  properties: Record<string, string>;

  /**
   * @title Associations
   * @description Objects to associate with this line item
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
 * @title Create Line Item
 * @description Create a new line item in HubSpot CRM for e-commerce
 */
export default async function createLineItem(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject> {
  const { properties, associations } = props;

  const client = new HubSpotClient(ctx);

  const lineItemInput: SimplePublicObjectInput = {
    properties,
    ...(associations && { associations }),
  };

  const lineItem = await client.createObject("line_items", lineItemInput);
  return lineItem;
}
