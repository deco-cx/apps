import { AppContext } from "../mod.ts";
import { GithubUser } from "../utils/types.ts";

interface Props {
  username: string;
}

/**
 * @title This name will appear on the admin
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<GithubUser> => {
  const response = await ctx.api[`POST /users/:username`]({
    username: props.username,
  }, { body: { filter: "filter" } });

  const result = await response.json();

  return result;
};

export default action;
