import { AppContext } from "../mod.ts";
import { Organization } from "../utils/client.ts";

export interface Props {
  organizationId: string;
}

/**
 * @title Get Organization
 * @description Gets a specific organization by ID
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Organization> => {
  const { client } = ctx;
  const { organizationId } = props;

  const response = await client["GET /organizations/:organizationId"]({
    organizationId,
  });

  const data = await response.json();

  return data;
};

export default loader;
