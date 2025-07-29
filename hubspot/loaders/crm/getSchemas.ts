import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { SchemasResponse } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Limit
   * @description Maximum number of schemas to return (default: 10, max: 100)
   */
  limit?: number;

  /**
   * @title After
   * @description Pagination cursor token
   */
  after?: string;

  /**
   * @title Include Archived
   * @description Whether to include archived schemas
   */
  archived?: boolean;
}

/**
 * @title Get Custom Object Schemas
 * @description Retrieve all custom object schemas (definitions) from HubSpot CRM
 */
export default async function getSchemas(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SchemasResponse> {
  const { limit = 10, after, archived = false } = props;

  try {
    const client = new HubSpotClient(ctx);

    const searchParams: Record<string, string | number | boolean | undefined> =
      {
        limit: Math.min(limit, 100),
        archived,
      };

    if (after) {
      searchParams.after = after;
    }

    const response = await client.get<SchemasResponse>(
      "/crm/v3/schemas",
      searchParams,
    );

    return {
      results: response.results || [],
      paging: response.paging,
    };
  } catch (error) {
    console.error("Error fetching schemas:", error);
    return {
      results: [],
    };
  }
}
