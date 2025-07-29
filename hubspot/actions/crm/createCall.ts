import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type {
  SimplePublicObject,
  SimplePublicObjectInput,
} from "../../utils/types.ts";

export interface Props {
  /**
   * @title Call Properties
   * @description Key-value pairs of call properties
   */
  properties: Record<string, string>;

  /**
   * @title Associations
   * @description Objects to associate with this call
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
 * @title Create Call
 * @description Create a new call record in HubSpot CRM
 */
export default async function createCall(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject> {
  const { properties, associations } = props;

  const client = new HubSpotClient(ctx);

  const callInput: SimplePublicObjectInput = {
    properties,
    ...(associations && { associations }),
  };

  const call = await client.createObject("calls", callInput);
  return call;
}
