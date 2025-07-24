import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { ObjectSchema } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Object Type
   * @description The custom object type identifier
   */
  objectType: string;
}

/**
 * @title Get Custom Object Schema
 * @description Retrieve a specific custom object schema by object type
 */
export default async function getSchema(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ObjectSchema | null> {
  const { objectType } = props;

  try {
    const client = new HubSpotClient(ctx);
    const schema = await client.get<ObjectSchema>(
      `/crm/v3/schemas/${objectType}`,
    );

    return schema;
  } catch (error) {
    console.error("Error fetching schema:", error);
    return null;
  }
}
