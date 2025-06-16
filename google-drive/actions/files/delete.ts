import type { AppContext } from "../../mod.ts";
import {
  ERROR_FAILED_TO_DELETE_FILE,
  ERROR_MISSING_FILE_ID,
} from "../../utils/constant.ts";
import { DeleteFileParams } from "../../utils/types.ts";

export interface Props extends DeleteFileParams {}

/**
 * @title Delete File
 * @description Permanently deletes a file from Google Drive
 */
export default async function deleteFile(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<boolean> {
  const { fileId } = props;

  if (!fileId) {
    console.error(ERROR_MISSING_FILE_ID);
    return false;
  }

  try {
    await ctx.client["DELETE /files/:fileId"]({
      fileId,
    });

    return true;
  } catch (error) {
    console.error(ERROR_FAILED_TO_DELETE_FILE, error);

    return false;
  }
}
