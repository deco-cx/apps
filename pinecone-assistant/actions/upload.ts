import { AppContext } from "../mod.ts";

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
  metadata?: string;
}

/**
 * @title Upload File
 * @name Upload File
 * @description Uploads a file to the assistant
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
) => {
  if (!props.fileUrl && !props.fileContent) {
    return {
      success: false,
      error: "No file URL or content provided",
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
      error:
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
      metadata: props.metadata,
    }, {
      body: formData,
    });

  const result = await response.json();

  if (result.error_message) {
    return {
      success: false,
      error: result.error_message,
    };
  }

  return {
    success: true,
    file: result,
  };
};

export default action;
