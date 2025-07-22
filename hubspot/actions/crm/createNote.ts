import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type {
  SimplePublicObject,
  SimplePublicObjectInput,
} from "../../utils/types.ts";

export interface Props {
  /**
   * @title Note Properties
   * @description Key-value pairs of note properties
   */
  properties: Record<string, string>;

  /**
   * @title Associations
   * @description Objects to associate with this note
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
 * @title Create Note
 * @description Create a new note in HubSpot CRM
 */
export default async function createNote(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject> {
  const { properties, associations } = props;

  const client = new HubSpotClient(ctx);

  const noteInput: SimplePublicObjectInput = {
    properties,
    ...(associations && { associations }),
  };

  const note = await client.createObject("notes", noteInput);
  return note;
}
