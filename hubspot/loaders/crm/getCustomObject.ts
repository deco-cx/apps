import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { SimplePublicObject } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Object Type
   * @description The custom object type identifier
   */
  objectType: string;

  /**
   * @title Object ID
   * @description The ID of the custom object to retrieve
   */
  objectId: string;

  /**
   * @title Properties
   * @description List of properties to retrieve
   */
  properties?: string[];

  /**
   * @title Properties with History
   * @description List of properties to retrieve with history
   */
  propertiesWithHistory?: string[];

  /**
   * @title Associations
   * @description List of associations to retrieve
   */
  associations?: string[];

  /**
   * @title Include Archived
   * @description Whether to include archived objects
   */
  archived?: boolean;
}

/**
 * @title Get Custom Object
 * @description Retrieve a specific custom object by ID and type
 */
export default async function getCustomObject(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject | null> {
  const {
    objectType,
    objectId,
    properties,
    propertiesWithHistory,
    associations,
    archived,
  } = props;

  try {
    const client = new HubSpotClient(ctx);
    const object = await client.getObject(objectType, objectId, {
      properties,
      propertiesWithHistory,
      associations,
      archived,
    });

    return object;
  } catch (error) {
    console.error(
      `Error fetching custom object ${objectId} of type ${objectType}:`,
      error,
    );
    return null;
  }
}
