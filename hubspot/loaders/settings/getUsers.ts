import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { UsersResponse } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Limit
   * @description Maximum number of users to return (default: 10, max: 100)
   */
  limit?: number;

  /**
   * @title After
   * @description Pagination cursor token
   */
  after?: string;
}

/**
 * @title Get Users
 * @description Retrieve a list of users from HubSpot Settings
 */
export default async function getUsers(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<UsersResponse> {
  const { limit = 10, after } = props;

  try {
    const client = new HubSpotClient(ctx);

    const searchParams: Record<string, string | number | boolean | undefined> =
      {
        limit: Math.min(limit, 100),
      };

    if (after) {
      searchParams.after = after;
    }

    const response = await client.get<UsersResponse>(
      "/settings/v3/users",
      searchParams,
    );

    return {
      results: response.results || [],
      paging: response.paging,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      results: [],
    };
  }
}
