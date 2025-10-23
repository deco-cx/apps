import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface Props {
  /**
   * @title Limit
   * @description Maximum number of campaigns to return (default: 20, max: 100)
   */
  limit?: number;

  /**
   * @title Offset
   * @description Offset for pagination
   */
  offset?: number;

  /**
   * @title Application ID
   * @description Filter campaigns by application ID
   */
  applicationId?: number;
}

export interface Campaign {
  appId: number;
  appName: string;
  contentId: number;
  id: string;
  name: string;
  subject: string;
  counters: {
    delivered: number;
    open: number;
    processed: number;
    sent: number;
    bounce: number;
    click: number;
    deferred: number;
    dropped: number;
    suppressed: number;
    spamreport: number;
    unsubscribed: number;
  };
  numIncluded: number;
  numQueued: number;
  subType: string;
  type: string;
  lastProcessingFinishedAt: number;
  lastProcessingStartedAt: number;
  lastProcessingStateChangeAt: number;
  processingState: string;
}

export interface CampaignsResponse {
  campaigns: Campaign[];
  hasMore: boolean;
  offset: number;
  total: number;
}

/**
 * @title Get Marketing Campaigns
 * @description Retrieve marketing campaigns from HubSpot
 */
export default async function getCampaigns(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CampaignsResponse> {
  const { limit = 20, offset = 0, applicationId } = props;

  try {
    const client = new HubSpotClient(ctx);

    const searchParams: Record<string, string | number | boolean | undefined> =
      {
        limit: Math.min(limit, 100),
        offset,
      };

    if (applicationId) {
      searchParams.applicationId = applicationId;
    }

    const response = await client.get<CampaignsResponse>(
      "/marketing/v3/campaigns",
      searchParams,
    );

    return {
      campaigns: response.campaigns || [],
      hasMore: response.hasMore || false,
      offset: response.offset || 0,
      total: response.total || 0,
    };
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return {
      campaigns: [],
      hasMore: false,
      offset: 0,
      total: 0,
    };
  }
}
