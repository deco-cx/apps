import type { AppContext } from "../../mod.ts";
import {
  COMMON_FIELDS,
  ERROR_FAILED_TO_DOWNLOAD_FILE,
  ERROR_INVALID_OUTPUT_FORMAT,
  ERROR_MISSING_FILE_ID,
  FIELDS,
  WEB_CONTENT_LINK,
} from "../../utils/constant.ts";
import {
  DownloadFileParams,
  DownloadFileResult,
  DriveFile,
} from "../../utils/types.ts";

export interface Props extends DownloadFileParams {}

/**
 * @title Download File
 * @description Downloads a file from Google Drive in multiple formats: link, base64, or blob
 */
export default async function downloadFile(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DownloadFileResult> {
  const { fileId, outputFormat = "link" } = props;

  if (!fileId) {
    ctx.errorHandler.toHttpError(ERROR_MISSING_FILE_ID, ERROR_MISSING_FILE_ID);
  }

  if (!["link", "base64", "blob"].includes(outputFormat)) {
    ctx.errorHandler.toHttpError(
      ERROR_INVALID_OUTPUT_FORMAT,
      `Invalid output format: ${outputFormat}. Must be one of: link, base64, blob`,
    );
  }

  try {
    // First, get file metadata
    const metadataResponse = await ctx.client["GET /files/:fileId"]({
      fileId,
      [FIELDS]: `${COMMON_FIELDS},${WEB_CONTENT_LINK},size`,
    });

    const fileMetadata: DriveFile = await metadataResponse.json();

    // If format is "link", just return the web content link
    if (outputFormat === "link") {
      return {
        fileId,
        fileName: fileMetadata.name,
        mimeType: fileMetadata.mimeType,
        size: fileMetadata.size,
        format: "link",
        content: fileMetadata.webContentLink || "",
      };
    }

    // For base64 and blob, download the actual file content
    const downloadResponse = await ctx.client["GET /files/:fileId/download"]({
      fileId,
      alt: "media",
    });

    const arrayBuffer = await downloadResponse.arrayBuffer();

    let content: string | ArrayBuffer;

    if (outputFormat === "base64") {
      // Convert ArrayBuffer to base64
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      content = btoa(binary);
    } else {
      // outputFormat === "blob", return as ArrayBuffer
      content = arrayBuffer;
    }

    return {
      fileId,
      fileName: fileMetadata.name,
      mimeType: fileMetadata.mimeType,
      size: fileMetadata.size,
      format: outputFormat,
      content,
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(error, ERROR_FAILED_TO_DOWNLOAD_FILE);
  }
}
