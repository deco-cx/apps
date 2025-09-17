import type { AppContext } from "../../mod.ts";

export interface UploadFileV2Props {
  /**
   * @description Channel ID or DM ID to send the file to (optional, if not provided file won't be shared to a channel)
   */
  channels?: string;

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
   * @description Thread timestamp to upload file to a specific thread (requires channels to be set)
   */
  thread_ts?: string;

  /**
   * @description Initial comment/message that accompanies the file
   */
  initial_comment?: string;
}

export interface UploadFileV2Response {
  ok: boolean;
  files: Array<{
    id: string;
    title?: string;
    name?: string;
    mimetype?: string;
    filetype?: string;
    permalink?: string;
    url_private?: string;
  }>;
  error?: string;
  response_metadata?: {
    warnings?: string[];
  };
}

/**
 * @name FILES_UPLOAD_V2
 * @title Upload File (V2)
 * @description Uploads a file to Slack using the new V2 API (files.getUploadURLExternal + files.completeUploadExternal)
 * @action upload-file-v2
 */
export default async function uploadFileV2(
  props: UploadFileV2Props,
  _req: Request,
  ctx: AppContext,
): Promise<UploadFileV2Response> {
  try {
    const response = await ctx.slack.uploadFileV2({
      channels: props.channels,
      file: props.file,
      filename: props.filename,
      title: props.title,
      thread_ts: props.thread_ts,
      initial_comment: props.initial_comment,
    });

    if (!response.ok) {
      return {
        ok: false,
        files: [],
        error: response.error || "Failed to upload file",
      };
    }

    return {
      ok: response.ok,
      files: response.data.files,
      response_metadata: response.response_metadata,
    };
  } catch (error) {
    console.error("Error uploading file with V2 API:", error);
    return {
      ok: false,
      files: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
