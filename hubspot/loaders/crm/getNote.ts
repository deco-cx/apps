import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { SimplePublicObject } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Note ID
   * @description The ID of the note to retrieve
   */
  noteId: string;

  /**
   * @title Properties
   * @description A comma-separated list of note properties to return
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
   * @description Whether to return archived notes
   */
  archived?: boolean;
}

/**
 * @title Get Note
 * @description Retrieve a specific note from HubSpot CRM by ID
 */
export default async function getNote(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject | null> {
  const { noteId, properties, propertiesWithHistory, associations, archived } =
    props;

  try {
    const client = new HubSpotClient(ctx);
    const note = await client.getObject("notes", noteId, {
      properties,
      propertiesWithHistory,
      associations,
      archived,
    });

    return note;
  } catch (error) {
    console.error("Error fetching note:", error);
    return null;
  }
}
