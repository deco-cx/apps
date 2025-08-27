import { logger } from "@deco/deco/o11y";
import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type {
  SimplePublicObject,
  SimplePublicObjectInput,
} from "../../utils/types.ts";

export interface Props {
  /**
   * @title Contact required data
   * @description Required data for creating a contact
   */
  requiredData: {
    /**
     * @title First name
     * @description First name of the contact
     */
    firstname: string;
    /**
     * @title Last name
     * @description Last name of the contact
     */
    lastname: string;
    /**
     * @title Email
     * @description Email of the contact
     */
    email: string;
    /**
     * @title Phone
     * @description Phone number of the contact
     */
    phone: string;
  };

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
  const { requiredData, properties, associations } = props;

  const client = new HubSpotClient(ctx);

  const contactInput: SimplePublicObjectInput = {
    properties: {
      ...requiredData,
      ...properties,
    },
    ...(associations && { associations }),
  };

  try {
    const contact = await client.createObject("contacts", contactInput);
    return contact;
  } catch (error) {
    logger.error(error);
    throw new Error("Failed to create contact");
  }
}
