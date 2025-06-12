import { AppContext } from "../mod.ts";
import { Organization } from "../utils/client.ts";

export interface Props {
  term: string;
}

/**
 * @title Search Organizations
 * @description Searches for organizations with optional filtering and pagination
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Organization[]> => {
  const { client } = ctx;
  const { term } = props;

  const response = await client["GET /organizations"]({ term });

  const data = await response.json();

  return data.organizations;
};

export default loader;
