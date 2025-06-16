import type { AppContext } from "../../mod.ts";
import {
  COMMON_FIELDS,
  ERROR_FAILED_TO_UPDATE_FILE,
  ERROR_MISSING_FILE_ID,
  FIELDS,
} from "../../utils/constant.ts";
import { DriveFile, UpdateFileParams } from "../../utils/types.ts";

export interface Props extends UpdateFileParams {}

/**
 * @title Update File
 * @description Updates metadata for an existing file in Google Drive
 */
export default async function updateFile(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DriveFile> {
  const {
    fileId,
    name,
    description,
    starred,
    trashed,
    properties,
    appProperties,
  } = props;

  if (!fileId) {
    ctx.errorHandler.toHttpError(ERROR_MISSING_FILE_ID, ERROR_MISSING_FILE_ID);
  }

  try {
    const response = await ctx.client["PATCH /files/:fileId"](
      {
        fileId,
        [FIELDS]: COMMON_FIELDS,
      },
      {
        body: {
          name,
          description,
          starred,
          trashed,
          properties,
          appProperties,
        },
      },
    );

    return await response.json();
  } catch (error) {
    ctx.errorHandler.toHttpError(error, ERROR_FAILED_TO_UPDATE_FILE);
  }
}
