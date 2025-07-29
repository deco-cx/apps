import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type {
  SimplePublicObject,
  SimplePublicObjectInput,
} from "../../utils/types.ts";

export interface Props {
  /**
   * @title Deal Properties
   * @description Key-value pairs of deal properties
   */
  properties: Record<string, string>;

  /**
   * @title Associations
   * @description Objects to associate with this deal
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
 * @title Create Deal
 * @description Create a new deal in HubSpot CRM
 */
export default async function createDeal(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject> {
  const { properties, associations } = props;

  const client = new HubSpotClient(ctx);

  const dealInput: SimplePublicObjectInput = {
    properties,
    ...(associations && { associations }),
  };

  const deal = await client.createObject("deals", dealInput);
  return deal;
}
