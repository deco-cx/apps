import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { Form } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Limit
   * @description Maximum number of forms to return (default: 20, max: 50)
   */
  limit?: number;

  /**
   * @title Offset
   * @description Offset for pagination
   */
  offset?: number;

  /**
   * @title Form Types
   * @description Filter by form types
   */
  formTypes?: Array<
    "hubspot" | "embedded_hubspot" | "captured_external" | "offline"
  >;
}

export interface FormsResponse {
  results: Form[];
  offset?: number;
  hasMore?: boolean;
  total?: number;
}

/**
 * @title Get Marketing Forms
 * @description Retrieve marketing forms from HubSpot
 */
export default async function getForms(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<FormsResponse> {
  const { limit = 20, offset = 0, formTypes } = props;

  try {
    const client = new HubSpotClient(ctx);

    const searchParams: Record<string, string | number | boolean | undefined> =
      {
        limit: Math.min(limit, 50),
        offset,
      };

    if (formTypes && formTypes.length > 0) {
      searchParams.formTypes = formTypes.join(",");
    }

    const response = await client.get<FormsResponse>(
      "/marketing/v3/forms",
      searchParams,
    );

    return {
      results: response.results || [],
      offset: response.offset,
      hasMore: response.hasMore,
      total: response.total,
    };
  } catch (error) {
    console.error("Error fetching forms:", error);
    return {
      results: [],
      offset: 0,
      hasMore: false,
    };
  }
}
