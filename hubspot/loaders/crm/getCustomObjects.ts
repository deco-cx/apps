import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { Paging, SimplePublicObject } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Object Type
   * @description The custom object type identifier
   */
  objectType: string;

  /**
   * @title Limit
   * @description Maximum number of objects to return (default: 10, max: 100)
   */
  limit?: number;

  /**
   * @title After
   * @description Pagination cursor token
   */
  after?: string;

  /**
   * @title Properties
   * @description List of properties to retrieve
   */
  properties?: string[];

  /**
   * @title Properties with History
   * @description List of properties to retrieve with history
   */
  propertiesWithHistory?: string[];

  /**
   * @title Associations
   * @description List of associations to retrieve
   */
  associations?: string[];

  /**
   * @title Include Archived
   * @description Whether to include archived objects
   */
  archived?: boolean;
}

export interface CustomObjectsResponse {
  results: SimplePublicObject[];
  paging?: Paging;
}

/**
 * @title Get Custom Objects
 * @description Retrieve custom objects of a specific type from HubSpot CRM
 */
export default async function getCustomObjects(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CustomObjectsResponse> {
  const {
    objectType,
    limit = 10,
    after,
    properties,
    propertiesWithHistory,
    associations,
    archived,
  } = props;

  try {
    const client = new HubSpotClient(ctx);
    const response = await client.listObjects(objectType, {
      limit: Math.min(limit, 100),
      after,
      properties,
      propertiesWithHistory,
      associations,
      archived,
    });

    return {
      results: response.results || [],
      paging: response.paging,
    };
  } catch (error) {
    console.error(
      `Error fetching custom objects of type ${objectType}:`,
      error,
    );
    return {
      results: [],
    };
  }
}
