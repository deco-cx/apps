import type { AppContext } from "../../mod.ts";
import {
  COMMON_FIELDS,
  ERROR_FAILED_TO_CREATE_FILE,
  ERROR_MISSING_FILE_NAME,
  FIELDS,
  PRESENTATION_MIME_TYPE,
} from "../../utils/constant.ts";
import { CreateFileParams, DriveFile } from "../../utils/types.ts";

export interface Props extends Omit<CreateFileParams, "mimeType"> {}

/**
 * @title Create Presentation
 * @description Creates a new Google Slides presentation
 */
export default async function createPresentation(
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
          mimeType: PRESENTATION_MIME_TYPE,
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
