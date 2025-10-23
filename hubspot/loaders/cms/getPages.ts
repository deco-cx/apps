import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { CMSPagesResponse } from "../../utils/types.ts";

export interface Props {
  limit?: number;
  after?: string;
  archived?: boolean;
}

/**
 * @title Get CMS Pages
 * @description Retrieve CMS pages from HubSpot
 */
export default async function getPages(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CMSPagesResponse> {
  const { limit = 10, after, archived = false } = props;

  try {
    const client = new HubSpotClient(ctx);
    const searchParams: Record<string, string | number | boolean | undefined> =
      {
        limit: Math.min(limit, 100),
        archived,
      };

    if (after) searchParams.after = after;

    const response = await client.get<CMSPagesResponse>(
      "/cms/v3/pages",
      searchParams,
    );

    return {
      results: response.results || [],
      paging: response.paging,
    };
  } catch (error) {
    console.error("Error fetching CMS pages:", error);
    return { results: [] };
  }
}
