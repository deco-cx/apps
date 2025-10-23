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
import { buildQueryString } from "../../utils/query.ts";
import { FileList, SearchFilesParams } from "../../utils/types.ts";

export interface Props extends SearchFilesParams {}

/**
 * @title Search Files in Google Drive
 * @description Searches for files and folders in Google Drive using structured query conditions.
 * @see https://developers.google.com/drive/api/guides/search-files
 */
export default async function searchFiles(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<FileList> {
  const {
    queries,
    pageSize = DEFAULT_PAGE_SIZE,
    pageToken,
    fields = DEFAULT_FIELDS,
    spaces,
    corpora,
    orderBy,
    includeItemsFromAllDrives,
  } = props;

  if (!queries || queries.length === 0) {
    ctx.errorHandler.toHttpError(
      ERROR_INVALID_PARAMETERS,
      'At least one query condition is required. Example: [{ "term": "trashed", "operator": "=", "value": "false" }]',
    );
  }

  try {
    // Build the query string from the conditions array
    const queryString = buildQueryString(queries);

    const params: Record<string, string | number | boolean | undefined> = {
      [Q]: queryString,
      [PAGE_SIZE]: pageSize,
      [PAGE_TOKEN]: pageToken,
      [FIELDS]: fields,
      spaces,
      corpora,
      orderBy,
      includeItemsFromAllDrives,
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
