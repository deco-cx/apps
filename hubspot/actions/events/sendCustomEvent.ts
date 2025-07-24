import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface Props {
  /**
   * @title Event Name
   * @description The name of the custom event
   */
  eventName: string;

  /**
   * @title Email
   * @description Email address of the contact associated with this event
   */
  email?: string;

  /**
   * @title Contact ID
   * @description HubSpot contact ID (alternative to email)
   */
  contactId?: string;

  /**
   * @title Properties
   * @description Custom properties for the event
   */
  properties?: Record<string, string | number | boolean>;

  /**
   * @title Occurred At
   * @description When the event occurred (ISO timestamp)
   */
  occurredAt?: string;
}

export interface EventResponse {
  completedAt: string;
  requestedAt: string;
  startedAt: string;
  links?: {
    results?: string;
  };
}

/**
 * @title Send Custom Event
 * @description Send a custom behavioral event to HubSpot for analytics and automation
 */
export default async function sendCustomEvent(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<EventResponse> {
  const { eventName, email, contactId, properties, occurredAt } = props;

  if (!email && !contactId) {
    throw new Error("Either email or contactId must be provided");
  }

  const client = new HubSpotClient(ctx);

  const eventData = {
    eventName,
    ...(email && { email }),
    ...(contactId && { objectId: contactId }),
    ...(properties && { properties }),
    ...(occurredAt && { occurredAt }),
  };

  const response = await client.post<EventResponse>(
    "/events/v3/send",
    eventData,
  );
  return response;
}
