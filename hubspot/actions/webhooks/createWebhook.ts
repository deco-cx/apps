import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface Props {
  /**
   * @title Event Type
   * @description The type of event to subscribe to
   */
  eventType:
    | "contact.creation"
    | "contact.deletion"
    | "contact.propertyChange"
    | "company.creation"
    | "company.deletion"
    | "company.propertyChange"
    | "deal.creation"
    | "deal.deletion"
    | "deal.propertyChange"
    | "ticket.creation"
    | "ticket.deletion"
    | "ticket.propertyChange"
    | "conversation.newMessage"
    | "conversation.privacyComplianceFinished";

  /**
   * @title Property Name
   * @description For propertyChange events, specify which property to monitor
   */
  propertyName?: string;

  /**
   * @title Active
   * @description Whether the webhook should be active immediately
   */
  active?: boolean;
}

export interface WebhookSubscription {
  id: string;
  eventType: string;
  propertyName?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * @title Create Webhook
 * @description Create a new webhook subscription to receive real-time notifications
 */
export default async function createWebhook(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<WebhookSubscription> {
  const { eventType, propertyName, active = true } = props;

  const client = new HubSpotClient(ctx);

  const webhookData = {
    eventType,
    ...(propertyName && { propertyName }),
    active,
  };

  const webhook = await client.post<WebhookSubscription>(
    "/webhooks/v3/subscriptions",
    webhookData,
  );
  return webhook;
}
