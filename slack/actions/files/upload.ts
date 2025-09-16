import type { AppContext } from "../../mod.ts";
import { SlackFile } from "../../client.ts";

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
   * @description File type (optional, usually auto-detected) - only used with legacy API
   */
  filetype?: string;

  /**
   * @description Thread timestamp to upload file to a specific thread
   */
  thread_ts?: string;

  /**
   * @description Use legacy files.upload API instead of the new V2 API (not recommended)
   * @default false
   */
  useLegacyApi?: boolean;
}

export interface UploadFileResponse {
  ok: boolean;
  files?: Array<{
    id: string;
    title?: string;
    name?: string;
    mimetype?: string;
    filetype?: string;
    permalink?: string;
    url_private?: string;
  }>;
  // For compatibility, expose a safe subset of SlackFile
  file?: Pick<
    SlackFile,
    | "id"
    | "name"
    | "title"
    | "mimetype"
    | "filetype"
    | "permalink"
    | "url_private"
  >;
  error?: string;
  warning?: string;
  response_metadata?: {
    warnings?: string[];
  };
}

/**
 * @name FILES_UPLOAD
 * @title Upload File
 * @description Uploads a file to Slack using the new V2 API by default, with fallback to legacy API
 * @action upload-file
 */
export default async function uploadFile(
  props: UploadFileProps,
  _req: Request,
  ctx: AppContext,
): Promise<UploadFileResponse> {
  try {
    // Use V2 API by default unless explicitly requested to use legacy
    if (!props.useLegacyApi) {
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
          error: response.error || "Failed to upload file with V2 API",
        };
      }

      const first = response.data?.files?.[0];
      return {
        ok: response.ok,
        files: response.data?.files?.map((f) => ({
          id: f.id,
          name: f.name ?? props.filename,
          title: f.title ?? props.title ?? props.filename,
          mimetype: f.mimetype ?? "",
          filetype: f.filetype ?? "",
          permalink: f.permalink ?? "",
          url_private: f.url_private ?? "",
        })) ?? [],
        // For backwards compatibility, expose only safe subset of SlackFile
        file: first
          ? {
            id: first.id,
            name: first.name ?? props.filename,
            title: first.title ?? props.title ?? props.filename,
            mimetype: first.mimetype ?? "",
            filetype: first.filetype ?? "",
            permalink: first.permalink ?? "",
            url_private: first.url_private ?? "",
          }
          : undefined,
        response_metadata: response.response_metadata,
      };
    }

    // Legacy API fallback
    if (
      typeof props.file !== "string" &&
      !(typeof File !== "undefined" && props.file instanceof File)
    ) {
      return {
        ok: false,
        error:
          "Legacy API only supports string (base64) or File objects. Use V2 API for other file types.",
      };
    }

    const response = await ctx.slack.uploadFile({
      channels: props.channels,
      file: props.file as string | File,
      filename: props.filename,
      title: props.title,
      initial_comment: props.initial_comment,
      filetype: props.filetype,
      thread_ts: props.thread_ts,
    });

    if (!response.ok) {
      return {
        ok: false,
        error: response.error || "Failed to upload file with legacy API",
      };
    }

    return {
      ok: response.ok,
      file: response.data.file,
      files: response.data.file
        ? [{
          id: response.data.file.id,
          name: response.data.file.name,
          title: response.data.file.title,
          mimetype: response.data.file.mimetype,
          filetype: response.data.file.filetype,
          permalink: response.data.file.permalink,
          url_private: response.data.file.url_private,
        }]
        : [],
      warning: response.data.warning,
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
