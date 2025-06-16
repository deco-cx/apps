import type { AppContext } from "../../mod.ts";
import {
  DEFAULT_FIELDS,
  ERROR_FAILED_TO_GET_FILE,
  ERROR_MISSING_FILE_ID,
  FIELDS,
} from "../../utils/constant.ts";
import { DriveFile, GetFileParams } from "../../utils/types.ts";

export interface Props extends GetFileParams {}

/**
 * @title Get Document
 * @description Retrieves metadata for a specific Google Docs document
 */
export default async function getDocument(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DriveFile> {
  const { fileId, fields = DEFAULT_FIELDS } = props;

  if (!fileId) {
    console.error(ERROR_MISSING_FILE_ID);
    return {};
  }

  try {
    const response = await ctx.client["GET /files/:fileId"]({
      fileId,
      [FIELDS]: fields,
    });

    return await response.json();
  } catch (error) {
    console.error(ERROR_FAILED_TO_GET_FILE, error);

    return {};
  }
}
