import type { AppContext } from "../../mod.ts";
import {
  COMMON_FIELDS,
  ERROR_FAILED_TO_CREATE_FILE,
  ERROR_MISSING_FILE_NAME,
  FIELDS,
} from "../../utils/constant.ts";
import { CreateFileParams, DriveFile } from "../../utils/types.ts";

export interface Props extends CreateFileParams {}

/**
 * @title Create File
 * @description Creates a new file in Google Drive
 */
export default async function createFile(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DriveFile> {
  const { name, mimeType, description, parents, properties, appProperties } =
    props;

  if (!name) {
    ctx.errorHandler.toHttpError(
      ERROR_MISSING_FILE_NAME,
      ERROR_MISSING_FILE_NAME,
    );
  }

  try {
    const response = await ctx.client["POST /files"](
      {
        [FIELDS]: COMMON_FIELDS,
      },
      {
        body: {
          name,
          mimeType,
          description,
          parents,
          properties,
          appProperties,
        },
      },
    );

    return await response.json();
  } catch (error) {
    ctx.errorHandler.toHttpError(error, ERROR_FAILED_TO_CREATE_FILE);
  }
}
