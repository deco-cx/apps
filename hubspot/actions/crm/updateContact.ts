import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type {
  SimplePublicObject,
  SimplePublicObjectInput,
} from "../../utils/types.ts";

export interface Props {
  /**
   * @title Contact ID
   * @description The ID of the contact to update
   */
  contactId: string;

  /**
   * @title Contact Properties
   * @description Key-value pairs of contact properties to update
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
 * @title Update Contact
 * @description Update an existing contact in HubSpot CRM
 */
export default async function updateContact(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject> {
  const { contactId, properties, associations } = props;

  const client = new HubSpotClient(ctx);

  const contactInput: SimplePublicObjectInput = {
    properties,
    ...(associations && { associations }),
  };

  const contact = await client.updateObject(
    "contacts",
    contactId,
    contactInput,
  );
  return contact;
}
