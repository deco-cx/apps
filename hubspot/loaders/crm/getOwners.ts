import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { OwnersResponse } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Limit
   * @description Maximum number of owners to return (default: 10, max: 100)
   */
  limit?: number;

  /**
   * @title After
   * @description Pagination cursor token
   */
  after?: string;

  /**
   * @title Email
   * @description Filter by owner email address
   */
  email?: string;

  /**
   * @title Include Archived
   * @description Whether to include archived owners
   */
  archived?: boolean;
}

/**
 * @title Get CRM Owners
 * @description Retrieve a list of CRM owners from HubSpot
 */
export default async function getOwners(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<OwnersResponse> {
  const { limit = 10, after, email, archived = false } = props;

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

    if (email) {
      searchParams.email = email;
    }

    const response = await client.get<OwnersResponse>(
      "/crm/v3/owners",
      searchParams,
    );

    return {
      results: response.results || [],
      paging: response.paging,
    };
  } catch (error) {
    console.error("Error fetching owners:", error);
    return {
      results: [],
    };
  }
}
