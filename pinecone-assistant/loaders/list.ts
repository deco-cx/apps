import { AppContext } from "../mod.ts";

export interface Props {
  filter?: string;
}

/**
 * @title List Files
 * @name List Files
 * @description Lists all files in the assistant
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
) => {
  const response = await ctx.client["GET /assistant/files/:assistant_name"]({
    assistant_name: ctx.assistant,
    filter: props.filter,
  });

  const result = await response.json();
  return {
    success: true,
    files: result.files,
  };
};

export default loader;
