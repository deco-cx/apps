import { AppContext } from "../../mod.ts";
import type { Backlink, DataForSeoTaskResponse } from "../../client.ts";

interface Props {
  /**
   * @title Target
   * @description Target domain or URL to retrieve backlinks for
   */
  target: string;

  /**
   * @title Limit
   * @description Maximum number of backlinks to return
   * @default 100
   */
  limit?: number;

  /**
   * @title Offset
   * @description Starting position for pagination
   * @default 0
   */
  offset?: number;

  /**
   * @title Order By
   * @description Sort order (e.g., "rank desc", "backlinks desc")
   * @default rank desc
   */
  order_by?: string;
}

/**
 * @title Get Backlinks
 * @description Get a detailed list of backlinks for a domain or URL
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Backlink[]> {
  const {
    target,
    limit = 100,
    offset = 0,
    order_by = "rank desc",
  } = props;

  if (!target) {
    throw new Error("Target domain or URL is required");
  }

  const response = await ctx.client["POST /backlinks/backlinks/live"](
    {},
    {
      body: [{
        target,
        limit,
        offset,
        order_by: [order_by],
      }],
    },
  );

  const data = await response.json() as DataForSeoTaskResponse;

  if (data.status_code !== 20000 || !data.tasks?.[0]?.result?.[0]) {
    throw new Error(data.status_message || "Failed to fetch backlinks");
  }

  const result = data.tasks[0].result[0] as {
    items?: Array<{
      type: string;
      domain_from: string;
      url_from: string;
      url_from_https?: boolean;
      domain_to: string;
      url_to: string;
      url_to_https?: boolean;
      tld_from: string;
      is_new?: boolean;
      is_lost?: boolean;
      backlink_spam_score?: number;
      rank?: number;
      page_from_rank?: number;
      domain_from_rank?: number;
      domain_from_external_links?: number;
      domain_from_internal_links?: number;
      page_from_external_links?: number;
      page_from_internal_links?: number;
      page_from_size?: number;
      page_from_encoding?: string;
      page_from_language?: string;
      page_from_title?: string;
      page_from_status_code?: number;
      first_seen?: string;
      prev_seen?: string;
      last_seen?: string;
      item_type?: string;
      dofollow?: boolean;
      anchor?: string;
      text_from?: string;
      alt?: string;
      image_url?: string;
    }>;
  };

  if (!result.items || result.items.length === 0) {
    return [];
  }

  return result.items.map((item) => ({
    type: item.type,
    domain_from: item.domain_from,
    url_from: item.url_from,
    url_from_https: item.url_from_https || false,
    domain_to: item.domain_to,
    url_to: item.url_to,
    url_to_https: item.url_to_https || false,
    tld_from: item.tld_from,
    is_new: item.is_new || false,
    is_lost: item.is_lost || false,
    backlink_spam_score: item.backlink_spam_score || 0,
    rank: item.rank || 0,
    page_from_rank: item.page_from_rank || 0,
    domain_from_rank: item.domain_from_rank || 0,
    domain_from_external_links: item.domain_from_external_links || 0,
    domain_from_internal_links: item.domain_from_internal_links || 0,
    page_from_external_links: item.page_from_external_links || 0,
    page_from_internal_links: item.page_from_internal_links || 0,
    page_from_size: item.page_from_size || 0,
    page_from_encoding: item.page_from_encoding || "",
    page_from_language: item.page_from_language || "",
    page_from_title: item.page_from_title || "",
    page_from_status_code: item.page_from_status_code || 0,
    first_seen: item.first_seen || "",
    prev_seen: item.prev_seen || "",
    last_seen: item.last_seen || "",
    item_type: item.item_type || "",
    dofollow: item.dofollow || false,
    anchor: item.anchor,
    text_from: item.text_from,
    alt: item.alt,
    image_url: item.image_url,
  }));
}
