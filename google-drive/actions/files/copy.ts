import type { AppContext } from "../../mod.ts";
import {
  COMMON_FIELDS,
  ERROR_FAILED_TO_CREATE_FILE,
  ERROR_MISSING_FILE_ID,
  FIELDS,
} from "../../utils/constant.ts";
import { CopyFileParams, DriveFile } from "../../utils/types.ts";

export interface Props extends CopyFileParams {}

/**
 * @title Copy File
 * @description Creates a copy of an existing file in Google Drive
 */
export default async function copyFile(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DriveFile> {
  const { fileId, name, parents } = props;

  if (!fileId) {
    ctx.errorHandler.toHttpError(ERROR_MISSING_FILE_ID, ERROR_MISSING_FILE_ID);
  }

  try {
    const response = await ctx.client["POST /files/:fileId/copy"](
      {
        fileId,
        [FIELDS]: COMMON_FIELDS,
      },
      {
        body: {
          name,
          parents,
        },
      },
    );
    return await response.json();
  } catch (error) {
    ctx.errorHandler.toHttpError(error, ERROR_FAILED_TO_CREATE_FILE);
  }
}
