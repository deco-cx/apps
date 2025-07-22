import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type {
  SimplePublicObject,
  SimplePublicObjectInput,
} from "../../utils/types.ts";

export interface Props {
  /**
   * @title Deal ID
   * @description The ID of the deal to update
   */
  dealId: string;

  /**
   * @title Deal Properties
   * @description Key-value pairs of deal properties to update
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
 * @title Update Deal
 * @description Update an existing deal in HubSpot CRM
 */
export default async function updateDeal(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject> {
  const { dealId, properties, associations } = props;

  const client = new HubSpotClient(ctx);

  const dealInput: SimplePublicObjectInput = {
    properties,
    ...(associations && { associations }),
  };

  const deal = await client.updateObject("deals", dealId, dealInput);
  return deal;
}
