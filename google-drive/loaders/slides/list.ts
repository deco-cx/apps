import type { AppContext } from "../../mod.ts";
import {
  CORPORA,
  DEFAULT_FIELDS,
  DEFAULT_PAGE_SIZE,
  ERROR_FAILED_TO_LIST_FILES,
  FIELDS,
  INCLUDE_ITEMS_FROM_ALL_DRIVES,
  ORDER_BY,
  PAGE_SIZE,
  PAGE_TOKEN,
  PRESENTATION_MIME_TYPE,
  Q,
  SPACES,
} from "../../utils/constant.ts";
import { FileList, ListFilesParams } from "../../utils/types.ts";

export interface Props extends Omit<ListFilesParams, "q"> {
  /**
   * @description Additional search query to filter presentations
   */
  q?: string;
}

/**
 * @title List Presentations
 * @description Lists Google Slides presentations with pagination and filtering options
 */
export default async function listPresentations(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<FileList> {
  const {
    pageSize = DEFAULT_PAGE_SIZE,
    pageToken,
    q,
    orderBy,
    fields = DEFAULT_FIELDS,
    includeItemsFromAllDrives,
    spaces,
    corpora,
  } = props;

  try {
    const query = q
      ? `mimeType='${PRESENTATION_MIME_TYPE}' and (${q})`
      : `mimeType='${PRESENTATION_MIME_TYPE}'`;

    const params: Record<string, string | number | boolean | undefined> = {
      [PAGE_SIZE]: pageSize,
      [PAGE_TOKEN]: pageToken,
      [Q]: query,
      [ORDER_BY]: orderBy,
      [FIELDS]: fields,
      [INCLUDE_ITEMS_FROM_ALL_DRIVES]: includeItemsFromAllDrives,
      [SPACES]: spaces,
      [CORPORA]: corpora,
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
