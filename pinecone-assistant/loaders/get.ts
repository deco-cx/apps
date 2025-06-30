import { AppContext } from "../mod.ts";
import { GetFileUploadResponse } from "../utils/types.ts";

export interface Props {
  fileId: string;
  includeUrl?: boolean;
}

export interface Result {
  success: boolean;
  file: GetFileUploadResponse | null;
  message?: string;
}

/**
 * @title GET_FILE_UPLOAD
 * @name GET_FILE_UPLOAD
 * @description Gets a file upload from the assistant
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Result> => {
  try {
    const response = await ctx.client
      ["GET /assistant/files/:assistant_name/:assistant_file_id"]({
        assistant_name: ctx.assistant,
        assistant_file_id: props.fileId,
        include_url: props.includeUrl ?? true,
      });

    const data = await response.json();

    const result: Result = {
      success: true,
      file: data,
    };

    return result;
  } catch (error) {
    return {
      success: false,
      file: null,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export default loader;
