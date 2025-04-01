import { AppContext } from "../mod.ts";

type TextContent = {
  type: "text";
  text: string;
  marks?: Array<{
    type: "bold" | "italic" | "underline" | "strike" | "code" | "link";
    attrs?: Record<string, any>;
  }>;
};

type NodeAttrs = {
  level?: number;
  indent?: number;
  textAlign?: "left" | "center" | "right" | "justify";
  start?: number;
  [key: string]: any;
};

type NodeContent = {
  type:
    | "paragraph"
    | "heading"
    | "bulletList"
    | "orderedList"
    | "listItem"
    | "codeBlock"
    | "blockquote"
    | "horizontalRule";
  attrs?: NodeAttrs;
  content?: Array<NodeContent | TextContent>;
};

export type Content = {
  type: "doc";
  content: Array<NodeContent>;
};

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
   * @description The document content in Tiptap JSON format
   */
  content: Content;
  /**
   * @description The format of the document (json or yjs)
   * @default json
   */
  format?: "json" | "yjs";
}

export default async function createDocument(
  { identifier, content, format = "json" }: Props,
  _request: Request,
  ctx: AppContext,
) {
  const { baseUrl, apiSecret } = ctx;
  const encodedIdentifier = encodeURIComponent(identifier);
  const url = `${baseUrl}/api/documents/${encodedIdentifier}?format=${format}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": apiSecret,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(content),
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
