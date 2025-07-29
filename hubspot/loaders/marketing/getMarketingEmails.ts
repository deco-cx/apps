import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface Props {
  /**
   * @title Limit
   * @description Maximum number of emails to return (default: 20, max: 100)
   */
  limit?: number;

  /**
   * @title Offset
   * @description Offset for pagination
   */
  offset?: number;

  /**
   * @title State
   * @description Filter emails by state
   */
  state?: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "PROCESSING" | "SENT";
}

export interface MarketingEmail {
  id: string;
  name: string;
  subject: string;
  htmlTitle: string;
  fromName: string;
  replyTo: string;
  created: string;
  updated: string;
  publishedAt?: string;
  publishedBy?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  state: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "PROCESSING" | "SENT";
  ab: boolean;
  abHoursToWait?: number;
  abSampleSizeDefault?: string;
  abSamplingDefault?: string;
  abSuccessMetric?: string;
  abTestId?: string;
  abVariation?: boolean;
  absoluteUrl: string;
  archived: boolean;
  audienceAccess: string;
  authorAt: string;
  authorEmail: string;
  authorUserId: number;
}

export interface MarketingEmailsResponse {
  objects: MarketingEmail[];
  hasMore: boolean;
  offset: number;
  total: number;
}

/**
 * @title Get Marketing Emails
 * @description Retrieve marketing emails from HubSpot
 */
export default async function getMarketingEmails(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<MarketingEmailsResponse> {
  const { limit = 20, offset = 0, state } = props;

  try {
    const client = new HubSpotClient(ctx);

    const searchParams: Record<string, string | number | boolean | undefined> =
      {
        limit: Math.min(limit, 100),
        offset,
      };

    if (state) {
      searchParams.state = state;
    }

    const response = await client.get<MarketingEmailsResponse>(
      "/marketing/v3/marketing-emails",
      searchParams,
    );

    return {
      objects: response.objects || [],
      hasMore: response.hasMore || false,
      offset: response.offset || 0,
      total: response.total || 0,
    };
  } catch (error) {
    console.error("Error fetching marketing emails:", error);
    return {
      objects: [],
      hasMore: false,
      offset: 0,
      total: 0,
    };
  }
}
