import type { AppContext } from "../../mod.ts";
import { SlackFile } from "../../client.ts";

export interface UploadFileProps {
  /**
   * @description Channel ID or DM ID to send the file to (e.g., C123... or D123...)
   */
  channels: string;

  /**
   * @description File content as base64 string or File object
   */
  file: string | File;

  /**
   * @description Name of the file
   */
  filename: string;

  /**
   * @description Title of the file
   */
  title?: string;

  /**
   * @description Initial comment/message that accompanies the file
   */
  initial_comment?: string;

  /**
   * @description File type (optional, usually auto-detected)
   */
  filetype?: string;
}

export interface UploadFileResponse {
  ok: boolean;
  file?: SlackFile;
  error?: string;
  warning?: string;
  response_metadata?: {
    warnings?: string[];
  };
}

/**
 * @description Uploads a file to Slack
 * @action upload-file
 */
export default async function uploadFile(
  props: UploadFileProps,
  _req: Request,
  ctx: AppContext,
): Promise<UploadFileResponse> {
  try {
    const response = await ctx.slack.uploadFile({
      channels: props.channels,
      file: props.file,
      filename: props.filename,
      title: props.title,
      initial_comment: props.initial_comment,
      filetype: props.filetype,
    });

    if (!response.ok) {
      return {
        ok: false,
        error: response.error || "Failed to upload file",
      };
    }

    return {
      ok: response.ok,
      file: response.file,
      warning: response.warning,
      response_metadata: response.response_metadata,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}