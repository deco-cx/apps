import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { ObjectProperty } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Object Type
   * @description The custom object type identifier
   */
  objectType: string;

  /**
   * @title Include Archived
   * @description Whether to include archived properties
   */
  archived?: boolean;
}

export interface SchemaPropertiesResponse {
  results: ObjectProperty[];
}

/**
 * @title Get Schema Properties
 * @description Retrieve properties for a specific custom object schema
 */
export default async function getSchemaProperties(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SchemaPropertiesResponse> {
  const { objectType, archived = false } = props;

  try {
    const client = new HubSpotClient(ctx);

    const searchParams: Record<string, string | number | boolean | undefined> =
      {
        archived,
      };

    const response = await client.get<SchemaPropertiesResponse>(
      `/crm/v3/schemas/${objectType}/properties`,
      searchParams,
    );

    return {
      results: response.results || [],
    };
  } catch (error) {
    console.error(`Error fetching schema properties for ${objectType}:`, error);
    return {
      results: [],
    };
  }
}
