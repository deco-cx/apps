import { AppContext } from "../mod.ts";
import { GithubUser } from "../utils/types.ts";

interface Props {
  username: string;
}

/**
 * @title This name will appear on the admin
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<GithubUser> => {
  const response = await ctx.api[`GET /users/:username`]({
    username: props.username,
  });

  const result = await response.json();

  return result;
};

export default loader;
