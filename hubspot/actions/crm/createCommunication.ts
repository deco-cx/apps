import { logger } from "@deco/deco/o11y";
import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { SimplePublicObject } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Communication Channel Type
   * @description The type of communication channel
   */
  channelType: "WHATS_APP" | "LINKEDIN_MESSAGE" | "SMS";

  /**
   * @title Message Body
   * @description The text content of the message
   */
  messageBody: string;

  /**
   * @title HubSpot Owner ID
   * @description The ID of the HubSpot user who owns this communication
   */
  ownerId?: number;

  /**
   * @title Timestamp
   * @description The timestamp when the message was sent/received (Unix timestamp in milliseconds or UTC format)
   */
  timestamp?: string | number;

  /**
   * @title Associations
   * @description Objects to associate with this communication (contacts, companies, etc.)
   */
  associations?: Array<{
    to: {
      id: string | number;
    };
    types: Array<{
      associationCategory: string;
      associationTypeId: number;
    }>;
  }>;
}

/**
 * @title Create Communication
 * @description Create a new communication (WhatsApp, LinkedIn, or SMS message) in HubSpot CRM
 */
export default async function createCommunication(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject> {
  const { channelType, messageBody, ownerId, timestamp, associations } = props;

  const client = new HubSpotClient(ctx);

  const communicationData = {
    properties: {
      hs_communication_channel_type: channelType,
      hs_communication_logged_from: "CRM" as const,
      hs_communication_body: messageBody,
      ...(ownerId && { hubspot_owner_id: ownerId }),
      ...(timestamp && { hs_timestamp: timestamp }),
    },
    ...(associations && { associations }),
  };

  try {
    const communication = await client.createCommunication(communicationData);
    return communication;
  } catch (error) {
    logger.error(error);
    throw new Error("Failed to create communication");
  }
}
