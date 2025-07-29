import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface Props {
  /**
   * @title File ID
   * @description The ID of the file to retrieve
   */
  fileId: string;
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

/**
 * @title Get File
 * @description Retrieve file metadata from HubSpot Files API
 */
export default async function getFile(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<HubSpotFile | null> {
  const { fileId } = props;

  try {
    const client = new HubSpotClient(ctx);
    const file = await client.get<HubSpotFile>(`/files/v3/files/${fileId}`);

    return file;
  } catch (error) {
    console.error("Error fetching file:", error);
    return null;
  }
}
