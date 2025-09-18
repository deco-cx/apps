import type { AppContext } from "../../mod.ts";
import { SlackFile, SlackResponse } from "../../client.ts";

export interface Props {
  /**
   * @description The ID of the user whose files to list
   */
  userId: string;

  /**
   * @description Maximum number of files to return
   * @default 20
   */
  count?: number;

  /**
   * @description Page number for pagination
   * @default 1
   */
  page?: number;

  /**
   * @description Filter by file type (e.g., 'images', 'pdfs', 'all')
   * @default 'all'
   */
  types?: string;
}

/**
 * @name FILES_LIST
 * @title List User Files
 * @description Lists files uploaded by a specific user
 */
export default async function listUserFiles(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<
  SlackResponse<{
    files: SlackFile[];
    paging: {
      count: number;
      total: number;
      page: number;
      pages: number;
    };
  }>
> {
  try {
    return await ctx.slack.listUserFiles(
      props.userId,
      props.count || 20,
      props.page || 1,
      props.types || "all",
    );
  } catch (error) {
    console.error("Error listing user files:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: {
        files: [],
        paging: { count: 0, total: 0, page: 1, pages: 0 },
      },
    };
  }
}
