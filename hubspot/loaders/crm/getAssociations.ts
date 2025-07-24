import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface Props {
  /**
   * @title From Object Type
   * @description The source object type
   */
  fromObjectType:
    | "contacts"
    | "companies"
    | "deals"
    | "tickets"
    | "calls"
    | "meetings"
    | "notes"
    | "tasks";

  /**
   * @title From Object ID
   * @description The ID of the source object
   */
  fromObjectId: string;

  /**
   * @title To Object Type
   * @description The target object type
   */
  toObjectType:
    | "contacts"
    | "companies"
    | "deals"
    | "tickets"
    | "calls"
    | "meetings"
    | "notes"
    | "tasks";

  /**
   * @title Limit
   * @description Maximum number of associations to return
   */
  limit?: number;

  /**
   * @title After
   * @description Cursor for pagination
   */
  after?: string;
}

export interface Association {
  id: string;
  type: string;
}

export interface AssociationsResponse {
  results: Association[];
  paging?: {
    next?: {
      after: string;
    };
  };
}

/**
 * @title Get Associations
 * @description Retrieve associations between CRM objects
 */
export default async function getAssociations(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<AssociationsResponse> {
  const { fromObjectType, fromObjectId, toObjectType, limit = 100, after } =
    props;

  try {
    const client = new HubSpotClient(ctx);

    const searchParams: Record<string, string | number | boolean | undefined> =
      {
        limit,
      };

    if (after) {
      searchParams.after = after;
    }

    const response = await client.get<AssociationsResponse>(
      `/crm/v4/objects/${fromObjectType}/${fromObjectId}/associations/${toObjectType}`,
      searchParams,
    );

    return {
      results: response.results || [],
      paging: response.paging,
    };
  } catch (error) {
    console.error("Error fetching associations:", error);
    return {
      results: [],
    };
  }
}
