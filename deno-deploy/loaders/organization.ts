import { AppContext } from "../mod.ts";
import { Organization } from "../client.ts";

interface Props {
  /**
   * @title Organization ID
   * @description The ID of the organization to fetch
   */
  organizationId: string;
}

/**
 * @title Get Organization Details
 * @description Retrieves details of a Deno Deploy organization
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Organization> => {
  const { organizationId } = props;

  const response = await ctx.api["GET /organizations/:organizationId"]({
    organizationId,
  });

  const result = await response.json();

  return result;
};

export default loader;
