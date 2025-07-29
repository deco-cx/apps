import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type {
  SimplePublicObject,
  SimplePublicObjectInput,
} from "../../utils/types.ts";

export interface Props {
  /**
   * @title Contact Properties
   * @description Key-value pairs of contact properties
   */
  properties: Record<string, string>;

  /**
   * @title Associations
   * @description Objects to associate with this contact
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
 * @title Create Contact
 * @description Create a new contact in HubSpot CRM
 */
export default async function createContact(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject> {
  const { properties, associations } = props;

  const client = new HubSpotClient(ctx);

  const contactInput: SimplePublicObjectInput = {
    properties,
    ...(associations && { associations }),
  };

  const contact = await client.createObject("contacts", contactInput);
  return contact;
}
