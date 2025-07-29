import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { SimplePublicObject } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Contact ID
   * @description The ID of the contact to retrieve
   */
  contactId: string;

  /**
   * @title Properties
   * @description A comma-separated list of contact properties to return
   */
  properties?: string[];

  /**
   * @title Properties with History
   * @description Properties to return with their value history
   */
  propertiesWithHistory?: string[];

  /**
   * @title Associations
   * @description Object types to retrieve associated IDs for
   */
  associations?: string[];

  /**
   * @title Include Archived
   * @description Whether to return archived contacts
   */
  archived?: boolean;
}

/**
 * @title Get Contact
 * @description Retrieve a specific contact from HubSpot CRM by ID
 */
export default async function getContact(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject | null> {
  const {
    contactId,
    properties,
    propertiesWithHistory,
    associations,
    archived,
  } = props;

  try {
    const client = new HubSpotClient(ctx);
    const contact = await client.getObject("contacts", contactId, {
      properties,
      propertiesWithHistory,
      associations,
      archived,
    });

    return contact;
  } catch (error) {
    console.error("Error fetching contact:", error);
    return null;
  }
}
