import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { Cart, SimplePublicObjectInput } from "../../utils/types.ts";

export interface Props {
  properties: Record<string, string>;
  associations?: Array<{
    to: { id: string };
    types: Array<{
      associationCategory: string;
      associationTypeId: number;
    }>;
  }>;
}

/**
 * @title Create Cart
 * @description Create a new shopping cart in HubSpot CRM
 */
export default async function createCart(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Cart> {
  const client = new HubSpotClient(ctx);

  const cartInput: SimplePublicObjectInput = {
    properties: props.properties,
    associations: props.associations,
  };

  const response = await client.createObject("carts", cartInput);
  return response;
}
