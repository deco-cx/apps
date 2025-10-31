import type { AppContext } from "../../mod.ts";
import { SlackResponse } from "../../client.ts";

export interface UploadFileProps {
  /**
   * @description Channel ID or DM ID to send the file to (e.g., C123... or D123...)
   */
  channels: string;

  /**
   * @description File content as base64 string, data URL, Uint8Array, Blob, or File object
   */
  file: string | Uint8Array | Blob | File;

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
   * @description Thread timestamp to upload file to a specific thread
   */
  thread_ts?: string;
}

/**
 * @name FILES_UPLOAD
 * @title Upload File
 * @description Uploads a file to Slack using the new V2 API
 * @action upload-file
 */
export default async function uploadFile(
  props: UploadFileProps,
  _req: Request,
  ctx: AppContext,
): Promise<
  SlackResponse<{
    files: Array<{
      id: string;
      title?: string;
      name?: string;
      mimetype?: string;
      filetype?: string;
      permalink?: string;
      url_private?: string;
    }>;
  }>
> {
  try {
    return await ctx.slack.uploadFileV2({
      channels: props.channels,
      file: props.file,
      filename: props.filename,
      title: props.title,
      thread_ts: props.thread_ts,
      initial_comment: props.initial_comment,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: { files: [] },
    };
  }
}
