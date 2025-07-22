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
   * @description The ID of the custom object to update
   */
  objectId: string;

  /**
   * @title Properties
   * @description Object properties to update as key-value pairs
   */
  properties: Record<string, string>;
}

/**
 * @title Update Custom Object
 * @description Update an existing custom object in HubSpot CRM
 */
export default async function updateCustomObject(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject> {
  const client = new HubSpotClient(ctx);

  const response = await client.updateObject(props.objectType, props.objectId, {
    properties: props.properties,
  });

  return response;
}
