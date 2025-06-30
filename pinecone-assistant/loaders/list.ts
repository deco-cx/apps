import { AppContext } from "../mod.ts";
import { FileReference } from "../utils/types.ts";
export interface Props {
  filter?: string;
}

export interface Result {
  success: boolean;
  files: FileReference[];
}

/**
 * @title LIST_FILES
 * @name LIST_FILES
 * @description Lists all files in the assistant
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Result> => {
  const response = await ctx.client["GET /assistant/files/:assistant_name"]({
    assistant_name: ctx.assistant,
    filter: props.filter,
  });

  const data = await response.json();
  const result: Result = {
    success: true,
    files: data.files,
  };

  return result;
};

export default loader;
