import type { AppContext } from "../../mod.ts";

export interface DownloadFileProps {
  /**
   * @description The URL of the file to download
   */
  fileUrl: string;
}

/**
 * @description Downloads a file from Slack and returns it as a base64 string
 */
export default async function downloadFile(
  props: DownloadFileProps,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; data?: string; contentType?: string; message?: string }> {
  try {
    const fileResponse = await ctx.slack.downloadFile(props.fileUrl);

    if (!fileResponse.ok) {
      return {
        success: false,
        message: `Failed to download file: ${fileResponse.statusText || "Unknown error"}`,
      };
    }

    const contentType = fileResponse.headers.get("content-type") || "application/octet-stream";
    const arrayBuffer = await fileResponse.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Convert to base64
    const base64 = btoa(
      Array(bytes.length)
        .fill("")
        .map((_, i) => String.fromCharCode(bytes[i]))
        .join("")
    );

    return {
      success: true,
      data: base64,
      contentType,
    };
  } catch (error) {
    console.error("Error downloading file:", error);
    return {
      success: false,
      message: `Error downloading file: ${error.message || "Unknown error"}`,
    };
  }
}
