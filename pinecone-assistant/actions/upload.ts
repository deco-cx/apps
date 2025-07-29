import { AppContext } from "../mod.ts";
import { FileUploadResponse } from "../utils/types.ts";
export interface Props {
  /**
   * @description The URL of the file to upload
   */
  fileUrl?: string;

  /**
   * @description The content of the file to upload (text only)
   */
  fileContent?: string;

  /**
   * @description The optional name of the file with extension (if not provided, the file will be named "file-${timestamp}.txt")
   */
  fileName?: string;

  /**
   * @description The optional metadata to attach to the file
   */
  metadata?: Record<string, unknown>;
}

export interface Result {
  success: boolean;
  file: FileUploadResponse | null;
  message?: string;
}

/**
 * @title UPLOAD_FILE
 * @name UPLOAD_FILE
 * @description Uploads a file to the assistant
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Result> => {
  if (!props.fileUrl && !props.fileContent) {
    return {
      success: false,
      file: null,
      message: "No file URL or content provided",
    };
  }

  let fileBuffer: ArrayBuffer | null = null;
  let contentType: string | null = null;

  if (props.fileUrl) {
    const fileResponse = await fetch(props.fileUrl);
    contentType = fileResponse.headers.get("content-type");
    fileBuffer = await fileResponse.arrayBuffer();
  }

  if (props.fileContent) {
    fileBuffer = new TextEncoder().encode(props.fileContent)
      .buffer as ArrayBuffer;
    contentType = "text/plain";
  }

  if (!fileBuffer) {
    return {
      success: false,
      file: null,
      message:
        "Could not create a file buffer from the provided file URL or content",
    };
  }

  const file = new File(
    [fileBuffer],
    props.fileName || `file-${Date.now()}.txt`,
    { type: contentType || "application/octet-stream" },
  );

  const formData = new FormData();
  formData.append("file", file);

  const response = await ctx.client
    ["POST /assistant/files/:assistant_name"]({
      assistant_name: ctx.assistant,
      metadata: props.metadata ? JSON.stringify(props.metadata) : undefined,
    }, {
      body: formData,
    });

  const data = await response.json();

  if (data.error_message) {
    return {
      success: false,
      file: null,
      message: data.error_message,
    };
  }

  const result: Result = {
    success: true,
    file: data,
    message:
      "File uploaded successfully. It may take a few minutes to be available.",
  };

  return result;
};

export default action;
