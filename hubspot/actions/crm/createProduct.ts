import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type {
  SimplePublicObject,
  SimplePublicObjectInput,
} from "../../utils/types.ts";

export interface Props {
  /**
   * @title Product Properties
   * @description Key-value pairs of product properties
   */
  properties: Record<string, string>;

  /**
   * @title Associations
   * @description Objects to associate with this product
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
 * @title Create Product
 * @description Create a new product in HubSpot CRM
 */
export default async function createProduct(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject> {
  const { properties, associations } = props;

  const client = new HubSpotClient(ctx);

  const productInput: SimplePublicObjectInput = {
    properties,
    ...(associations && { associations }),
  };

  const product = await client.createObject("products", productInput);
  return product;
}
