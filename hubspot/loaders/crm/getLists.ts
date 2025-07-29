import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface Props {
  /**
   * @title Limit
   * @description Maximum number of lists to return (default: 20, max: 100)
   */
  limit?: number;

  /**
   * @title Offset
   * @description Offset for pagination
   */
  offset?: number;

  /**
   * @title List Type
   * @description Filter by list type
   */
  listType?: "STATIC" | "DYNAMIC";
}

export interface ContactList {
  listId: number;
  name: string;
  listType: "STATIC" | "DYNAMIC";
  size: number;
  createdAt: number;
  updatedAt: number;
  portalId: number;
  authorId: number;
  filters?: Array<{
    operator: string;
    property: string;
    value: string;
    type: string;
  }>;
  metaData: {
    processing: string;
    size: number;
    error: string;
    lastProcessingStateChangeAt: number;
    lastSizeChangeAt: number;
  };
}

export interface ListsResponse {
  lists: ContactList[];
  hasMore: boolean;
  offset: number;
}

/**
 * @title Get Contact Lists
 * @description Retrieve contact lists from HubSpot CRM
 */
export default async function getLists(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ListsResponse> {
  const { limit = 20, offset = 0, listType } = props;

  try {
    const client = new HubSpotClient(ctx);

    const searchParams: Record<string, string | number | boolean | undefined> =
      {
        count: Math.min(limit, 100),
        offset,
      };

    if (listType) {
      searchParams.listType = listType;
    }

    const response = await client.get<ListsResponse>(
      "/contacts/v1/lists",
      searchParams,
    );

    return {
      lists: response.lists || [],
      hasMore: response.hasMore || false,
      offset: response.offset || 0,
    };
  } catch (error) {
    console.error("Error fetching lists:", error);
    return {
      lists: [],
      hasMore: false,
      offset: 0,
    };
  }
}
