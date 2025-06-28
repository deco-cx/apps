import { AppContext } from "../mod.ts";

export interface Props {
  fileId: string;
}

/**
 * @title Delete File
 * @name Delete File
 * @description Deletes a file from the assistant
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
) => {
  const response = await ctx.client
    ["DELETE /assistant/files/:assistant_name/:assistant_file_id"]({
      assistant_name: ctx.assistant,
      assistant_file_id: props.fileId,
    });

  if (response.status !== 200) {
    return {
      success: false,
      error: "Failed to delete file " + response.statusText,
    };
  }

  return {
    success: true,
  };
};

export default action;
