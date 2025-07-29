import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface WebhookSubscription {
  id: string;
  eventType: string;
  propertyName?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebhooksResponse {
  results: WebhookSubscription[];
}

/**
 * @title Get Webhooks
 * @description Retrieve all webhook subscriptions configured for this app
 */
export default async function getWebhooks(
  _props: Record<PropertyKey, never>,
  _req: Request,
  ctx: AppContext,
): Promise<WebhooksResponse> {
  try {
    const client = new HubSpotClient(ctx);
    const response = await client.get<WebhooksResponse>(
      "/webhooks/v3/subscriptions",
    );

    return {
      results: response.results || [],
    };
  } catch (error) {
    console.error("Error fetching webhooks:", error);
    return {
      results: [],
    };
  }
}
