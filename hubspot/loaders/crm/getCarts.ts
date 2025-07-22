import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { CartsResponse } from "../../utils/types.ts";

export interface Props {
  limit?: number;
  after?: string;
  properties?: string[];
  associations?: string[];
  archived?: boolean;
}

/**
 * @title Get Carts
 * @description Retrieve shopping carts from HubSpot CRM
 */
export default async function getCarts(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CartsResponse> {
  const { limit = 10, after, properties, associations, archived } = props;

  try {
    const client = new HubSpotClient(ctx);
    const response = await client.listObjects("carts", {
      limit: Math.min(limit, 100),
      after,
      properties,
      associations,
      archived,
    });

    return {
      results: response.results || [],
      paging: response.paging,
    };
  } catch (error) {
    console.error("Error fetching carts:", error);
    return { results: [] };
  }
}
