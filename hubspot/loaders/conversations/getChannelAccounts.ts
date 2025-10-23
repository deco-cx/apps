import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface Props {
  /**
   * @title Limit
   * @description Maximum number of channel accounts to return (default: 20, max: 100)
   */
  limit?: number;

  /**
   * @title After
   * @description Cursor for pagination - use the 'after' value from the previous response
   */
  after?: string;
  /**
   * @title Channel ID
   * @description The ID of the channel to get channel accounts for
   */
  channelId?: string;
}

export interface DeliveryIdentifier {
  type: string;
  value: string;
}

export interface ChannelAccount {
  createdAt: string;
  archivedAt?: string;
  archived: boolean;
  authorized: boolean;
  name: string;
  active: boolean;
  deliveryIdentifier: DeliveryIdentifier;
  id: string;
  inboxId: string;
  channelId: string;
}

export interface ChannelAccountsResponse {
  total: number;
  paging: {
    next?: {
      link: string;
      after: string;
    };
  };
  results: ChannelAccount[];
}

/**
 * @title Get Channel Accounts
 * @description Retrieve a list of channel accounts from HubSpot Conversations API
 */
export default async function getChannelAccounts(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ChannelAccountsResponse> {
  const { limit = 20, after, channelId } = props;

  try {
    const client = new HubSpotClient(ctx);

    const searchParams: Record<
      string,
      string | number | boolean | undefined
    > = {};

    if (limit) {
      searchParams.limit = Math.min(limit, 100);
    }
    if (after) {
      searchParams.after = after;
    }
    if (channelId) {
      searchParams.channelId = channelId;
    }

    const response = await client.get<ChannelAccountsResponse>(
      "/conversations/v3/conversations/channel-accounts",
      searchParams,
    );

    return {
      total: response.total || 0,
      paging: response.paging || { next: undefined },
      results: response.results || [],
    };
  } catch (error) {
    console.error("Error fetching channel accounts:", error);
    return {
      total: 0,
      paging: { next: undefined },
      results: [],
    };
  }
}
