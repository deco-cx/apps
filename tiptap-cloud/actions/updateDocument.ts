import { AppContext } from "../mod.ts";
import { htmlToTiptapJson } from "../utils.ts";

/**
 * @description Represents a Tiptap document structure with all possible node types and their attributes
 */

/**
 * @name UPDATE_DOCUMENT
 * @description Updates a document in Tiptap Cloud using JSON format
 * @see https://tiptap.dev/docs/collaboration/documents/content-injection
 */
export interface UpdateDocumentProps {
  /**
   * @description The unique identifier for the document
   */
  identifier: string;
  /**
   * @description The document content in HTML format
   */
  content: string;
  /**
   * @description The format of the document (json or yjs)
   * @default json
   */
  format: "json";
  /**
   * @description Optional checksum to prevent conflicts
   */
  checksum?: string;
  /**
   * @description The update mode (append or replace)
   * @default append
   */
  mode: "append" | "replace";
}

export default async function updateDocument(
  { identifier, content, format = "json", checksum, mode = "append" }:
    UpdateDocumentProps,
  _request: Request,
  ctx: AppContext,
) {
  const { baseUrl, apiSecret } = ctx;
  const encodedIdentifier = encodeURIComponent(identifier);

  // Build URL with format, checksum and mode
  const urlParams = new URLSearchParams();
  urlParams.append("format", format);
  if (checksum) {
    urlParams.append("checksum", checksum);
  }
  if (mode === "append") {
    urlParams.append("mode", "append");
  }

  const url =
    `${baseUrl}/api/documents/${encodedIdentifier}?${urlParams.toString()}`;

  // Convert HTML to Tiptap JSON
  const tiptapContent = htmlToTiptapJson(content);

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Authorization": apiSecret,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tiptapContent),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to update document: ${response.status} ${response.statusText}. ${errorText}`,
      );
    }

    return {
      success: true,
      status: response.status,
      message: "Document updated successfully",
    };
  } catch (error) {
    console.error("Error updating document:", error);
    return {
      success: false,
      error: error,
    };
  }
}
