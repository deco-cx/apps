import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { SimplePublicObject } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Meeting ID
   * @description The ID of the meeting to retrieve
   */
  meetingId: string;

  /**
   * @title Properties
   * @description A comma-separated list of meeting properties to return
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
   * @description Whether to return archived meetings
   */
  archived?: boolean;
}

/**
 * @title Get Meeting
 * @description Retrieve a specific meeting from HubSpot CRM by ID
 */
export default async function getMeeting(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject | null> {
  const {
    meetingId,
    properties,
    propertiesWithHistory,
    associations,
    archived,
  } = props;

  try {
    const client = new HubSpotClient(ctx);
    const meeting = await client.getObject("meetings", meetingId, {
      properties,
      propertiesWithHistory,
      associations,
      archived,
    });

    return meeting;
  } catch (error) {
    console.error("Error fetching meeting:", error);
    return null;
  }
}
