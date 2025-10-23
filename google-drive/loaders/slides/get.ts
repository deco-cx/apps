import type { AppContext } from "../../mod.ts";
import {
  DEFAULT_FIELDS_SLIDES,
  ERROR_FAILED_TO_GET_FILE,
  ERROR_MISSING_FILE_ID,
  FIELDS,
} from "../../utils/constant.ts";
import { DriveFile, GetFileParams } from "../../utils/types.ts";

export interface Props extends GetFileParams {}

/**
 * @title Get Presentation
 * @description Retrieves metadata for a specific Google Slides presentation
 */
export default async function getPresentation(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DriveFile> {
  const { fileId, fields = DEFAULT_FIELDS_SLIDES } = props;

  if (!fileId) {
    ctx.errorHandler.toHttpError(ERROR_MISSING_FILE_ID, ERROR_MISSING_FILE_ID);
  }

  try {
    const response = await ctx.client["GET /files/:fileId"]({
      fileId,
      [FIELDS]: fields,
    });
    return await response.json();
  } catch (error) {
    ctx.errorHandler.toHttpError(error, ERROR_FAILED_TO_GET_FILE);
  }
}
