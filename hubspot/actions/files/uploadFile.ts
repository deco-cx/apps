import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface Props {
  /**
   * @title File
   * @description The file to upload (base64 encoded)
   */
  file: string;

  /**
   * @title File Name
   * @description Name of the file including extension
   */
  fileName: string;

  /**
   * @title Folder ID
   * @description ID of the folder to upload to (optional)
   */
  folderId?: string;

  /**
   * @title Access Level
   * @description Access level for the uploaded file
   */
  access?: "PUBLIC_INDEXABLE" | "PUBLIC_NOT_INDEXABLE" | "PRIVATE";

  /**
   * @title Overwrite
   * @description Whether to overwrite existing file with same name
   */
  overwrite?: boolean;
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
 * @title Upload File
 * @description Upload a file to HubSpot Files API
 */
export default async function uploadFile(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<HubSpotFile> {
  const { file, fileName, folderId, access = "PRIVATE", overwrite = false } =
    props;

  const client = new HubSpotClient(ctx);

  // Convert base64 to blob
  const binaryString = atob(file);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes]);

  // Create form data
  const formData = new FormData();
  formData.append("file", blob, fileName);
  formData.append(
    "options",
    JSON.stringify({
      access,
      overwrite,
      ...(folderId && { folderId }),
    }),
  );

  // Upload with special handling for multipart/form-data
  const response = await client.post<HubSpotFile>("/files/v3/files", formData, {
    "Content-Type": "multipart/form-data",
  });

  return response;
}
