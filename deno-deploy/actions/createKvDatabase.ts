import { AppContext } from "../mod.ts";
import { CreateKvDatabaseRequest, KvDatabase } from "../client.ts";

interface Props extends CreateKvDatabaseRequest {
  /**
   * @title Organization ID
   * @description The ID of the organization to create the KV database in
   */
  organizationId: string;
}

/**
 * @title Create KV Database
 * @description Creates a new KV database in Deno Deploy
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<KvDatabase> => {
  const { organizationId, ...dbData } = props;

  const response = await ctx.api
    ["POST /organizations/:organizationId/databases"](
      { organizationId },
      { body: dbData },
    );

  const result = await response.json();

  return result;
};

export default action;
