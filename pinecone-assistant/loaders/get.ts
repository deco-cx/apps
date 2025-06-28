import { AppContext } from "../mod.ts";

export interface Props {
  fileId: string;
  includeUrl?: boolean;
}

/**
 * @title Get File Upload
 * @name Get File Upload
 * @description Gets a file upload from the assistant
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
) => {
  const response = await ctx.client
    ["GET /assistant/files/:assistant_name/:assistant_file_id"]({
      assistant_name: ctx.assistant,
      assistant_file_id: props.fileId,
      include_url: props.includeUrl ?? true,
    });

  const result = await response.json();
  return {
    success: true,
    file: result,
  };
};

export default loader;
