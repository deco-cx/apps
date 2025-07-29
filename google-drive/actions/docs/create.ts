import type { AppContext } from "../../mod.ts";
import {
  COMMON_FIELDS,
  DOCUMENT_MIME_TYPE,
  ERROR_FAILED_TO_CREATE_FILE,
  ERROR_MISSING_FILE_NAME,
  FIELDS,
} from "../../utils/constant.ts";
import { CreateFileParams, DriveFile } from "../../utils/types.ts";

export interface Props extends Omit<CreateFileParams, "mimeType"> {}

/**
 * @title Create Document
 * @description Creates a new Google Docs document
 */
export default async function createDocument(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DriveFile> {
  const { name, description, parents, properties, appProperties } = props;

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
          mimeType: DOCUMENT_MIME_TYPE,
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
