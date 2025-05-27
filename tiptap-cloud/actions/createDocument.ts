import { AppContext } from "../mod.ts";
import { htmlToTiptapJson } from "../utils.ts";

/**
 * @name CREATE_DOCUMENT
 * @description Creates a document in Tiptap Cloud using JSON format
 */
export interface Props {
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
  format?: "json";
}

export default async function createDocument(
  { identifier, content, format = "json" }: Props,
  _request: Request,
  ctx: AppContext,
) {
  const { baseUrl, apiSecret } = ctx;
  const encodedIdentifier = encodeURIComponent(identifier);
  const url = `${baseUrl}/api/documents/${encodedIdentifier}?format=${format}`;

  // Convert HTML to Tiptap JSON if content is a string
  const tiptapContent = typeof content === "string"
    ? htmlToTiptapJson(content)
    : content;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": apiSecret,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tiptapContent),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to create document: ${response.status} ${response.statusText}. ${errorText}`,
      );
    }

    return {
      success: true,
      status: response.status,
      message: "Document created successfully",
    };
  } catch (error) {
    console.error("Error creating document:", error);
    return {
      success: false,
      error: error,
    };
  }
}
