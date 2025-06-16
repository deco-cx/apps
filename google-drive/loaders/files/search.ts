import type { AppContext } from "../../mod.ts";
import {
  DEFAULT_FIELDS,
  DEFAULT_PAGE_SIZE,
  ERROR_FAILED_TO_LIST_FILES,
  ERROR_INVALID_PARAMETERS,
  FIELDS,
  PAGE_SIZE,
  PAGE_TOKEN,
  Q,
} from "../../utils/constant.ts";
import { FileList, SearchFilesParams } from "../../utils/types.ts";

export interface Props extends SearchFilesParams {}

/**
 * @title Search Files
 * @description Searches for files in Google Drive by name or content
 */
export default async function searchFiles(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<FileList> {
  const {
    query,
    pageSize = DEFAULT_PAGE_SIZE,
    pageToken,
    fields = DEFAULT_FIELDS,
  } = props;

  if (!query) {
    ctx.errorHandler.toHttpError(
      ERROR_INVALID_PARAMETERS,
      ERROR_INVALID_PARAMETERS,
    );
  }

  try {
    const params: Record<string, string | number | undefined> = {
      [Q]: query,
      [PAGE_SIZE]: pageSize,
      [PAGE_TOKEN]: pageToken,
      [FIELDS]: fields,
    };

    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });

    const response = await ctx.client["GET /files"](params);
    return await response.json();
  } catch (error) {
    ctx.errorHandler.toHttpError(error, ERROR_FAILED_TO_LIST_FILES);
  }
}
