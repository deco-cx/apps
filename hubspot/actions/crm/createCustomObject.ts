import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type {
  SimplePublicObject,
  SimplePublicObjectInput,
} from "../../utils/types.ts";

export interface Props {
  /**
   * @title Object Type
   * @description The custom object type identifier
   */
  objectType: string;

  /**
   * @title Properties
   * @description Object properties as key-value pairs
   */
  properties: Record<string, string>;

  /**
   * @title Associations
   * @description List of associations to create with this object
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
 * @title Create Custom Object
 * @description Create a new custom object instance in HubSpot CRM
 */
export default async function createCustomObject(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject> {
  const client = new HubSpotClient(ctx);

  const objectInput: SimplePublicObjectInput = {
    properties: props.properties,
    associations: props.associations,
  };

  const response = await client.createObject(props.objectType, objectInput);

  return response;
}
