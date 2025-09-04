import type { AppContext } from "../../mod.ts";
import { SlackFile } from "../../client.ts";

export interface FileInfoProps {
  /**
   * @description The ID of the file to get information about
   */
  fileId: string;
}

/**
 * @description Gets detailed information about a file
 */
export default async function fileInfo(
  props: FileInfoProps,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; file?: SlackFile; message?: string }> {
  try {
    const fileResponse = await ctx.slack.getFileInfo(props.fileId);

    if (!fileResponse.ok) {
      return {
        success: false,
        message: `Failed to get file info: ${fileResponse.error || "Unknown error"}`,
      };
    }

    return {
      success: true,
      file: fileResponse.data.file,
    };
  } catch (error) {
    console.error("Error getting file info:", error);
    return {
      success: false,
      message: `Error getting file info: ${error.message || "Unknown error"}`,
    };
  }
}
