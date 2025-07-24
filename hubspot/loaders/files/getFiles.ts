import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface Props {
  /**
   * @title Limit
   * @description Maximum number of files to return (default: 20, max: 100)
   */
  limit?: number;

  /**
   * @title Offset
   * @description Offset for pagination
   */
  offset?: number;

  /**
   * @title Folder ID
   * @description Filter files by parent folder ID
   */
  parentFolderId?: string;

  /**
   * @title Include Archived
   * @description Whether to include archived files
   */
  archived?: boolean;
}

export interface HubSpotFile {
  id: string;
  name: string;
  extension: string;
  type: string;
  size: number;
  url: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  parentFolderId?: string;
  access: "PUBLIC_INDEXABLE" | "PUBLIC_NOT_INDEXABLE" | "PRIVATE";
}

export interface FilesResponse {
  results: HubSpotFile[];
  total: number;
  hasMore: boolean;
  offset: number;
}

/**
 * @title Get Files
 * @description Retrieve a list of files from HubSpot Files API
 */
export default async function getFiles(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<FilesResponse> {
  const { limit = 20, offset = 0, parentFolderId, archived = false } = props;

  try {
    const client = new HubSpotClient(ctx);

    const searchParams: Record<string, string | number | boolean | undefined> =
      {
        limit: Math.min(limit, 100),
        offset,
        archived,
      };

    if (parentFolderId) {
      searchParams.parentFolderId = parentFolderId;
    }

    const response = await client.get<FilesResponse>(
      "/files/v3/files",
      searchParams,
    );

    return {
      results: response.results || [],
      total: response.total || 0,
      hasMore: response.hasMore || false,
      offset: response.offset || 0,
    };
  } catch (error) {
    console.error("Error fetching files:", error);
    return {
      results: [],
      total: 0,
      hasMore: false,
      offset: 0,
    };
  }
}
