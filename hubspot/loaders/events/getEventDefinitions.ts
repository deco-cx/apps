import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface EventDefinition {
  id: string;
  name: string;
  label: string;
  description?: string;
  primaryObject: string;
  properties: Array<{
    name: string;
    label: string;
    description?: string;
    type: string;
    options?: Array<{
      label: string;
      value: string;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface EventDefinitionsResponse {
  results: EventDefinition[];
}

/**
 * @title Get Event Definitions
 * @description Retrieve all custom event definitions configured in HubSpot
 */
export default async function getEventDefinitions(
  _props: Record<PropertyKey, never>,
  _req: Request,
  ctx: AppContext,
): Promise<EventDefinitionsResponse> {
  try {
    const client = new HubSpotClient(ctx);
    const response = await client.get<EventDefinitionsResponse>(
      "/events/v3/event-definitions",
    );

    return {
      results: response.results || [],
    };
  } catch (error) {
    console.error("Error fetching event definitions:", error);
    return {
      results: [],
    };
  }
}
