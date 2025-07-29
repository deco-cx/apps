import { AppContext } from "../mod.ts";

export interface Props {
  fileId: string;
}

export interface Result {
  success: boolean;
  message?: string;
}

/**
 * @title DELETE_FILE
 * @name DELETE_FILE
 * @description Deletes a file from the assistant
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Result> => {
  const response = await ctx.client
    ["DELETE /assistant/files/:assistant_name/:assistant_file_id"]({
      assistant_name: ctx.assistant,
      assistant_file_id: props.fileId,
    });

  if (response.status !== 200) {
    return {
      success: false,
      message: "Failed to delete file " + response.statusText,
    };
  }

  const result: Result = {
    success: true,
  };

  return result;
};

export default action;
