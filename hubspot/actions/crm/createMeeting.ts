import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type {
  SimplePublicObject,
  SimplePublicObjectInput,
} from "../../utils/types.ts";

export interface Props {
  /**
   * @title Meeting Properties
   * @description Key-value pairs of meeting properties
   */
  properties: Record<string, string>;

  /**
   * @title Associations
   * @description Objects to associate with this meeting
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
 * @title Create Meeting
 * @description Create a new meeting in HubSpot CRM
 */
export default async function createMeeting(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject> {
  const { properties, associations } = props;

  const client = new HubSpotClient(ctx);

  const meetingInput: SimplePublicObjectInput = {
    properties,
    ...(associations && { associations }),
  };

  const meeting = await client.createObject("meetings", meetingInput);
  return meeting;
}
