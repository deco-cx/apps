import { AppContext } from "../mod.ts";

/**
 * @description Represents a Tiptap document structure with all possible node types and their attributes
 */
export type Content = {
  /**
   * @description The type of the document, always "doc" for the root node
   */
  type: "doc";
  /**
   * @description The content array containing all top-level nodes
   */
  content: Array<{
    /**
     * @description The type of the node
     */
    type:
      | "paragraph"
      | "heading"
      | "bulletList"
      | "orderedList"
      | "listItem"
      | "codeBlock"
      | "blockquote"
      | "horizontalRule"
      | "text";
    /**
     * @description The text content of the node (only for text nodes)
     */
    text?: string;
    /**
     * @description The attributes of the node
     */
    attrs?: {
      /**
       * @description The heading level (1-6) for heading nodes
       */
      level?: number;
      /**
       * @description The indentation level for list items
       */
      indent?: number;
      /**
       * @description The text alignment for paragraphs and headings
       */
      textAlign?: "left" | "center" | "right" | "justify";
      /**
       * @description The starting number for ordered lists
       */
      start?: number;
      /**
       * @description The language for code blocks
       */
      language?: string;
      /**
       * @description The URL for link marks
       */
      href?: string;
      /**
       * @description The target for link marks
       */
      target?: string;
      /**
       * @description The rel attribute for link marks
       */
      rel?: string;
      /**
       * @description The class name for styling
       */
      class?: string;
      /**
       * @description The ID for the node
       */
      id?: string;
      /**
       * @description The title for the node
       */
      title?: string;
      /**
       * @description The data attributes for the node
       */
      data?: Record<string, string>;
    };
    /**
     * @description The marks applied to text nodes
     */
    marks?: Array<{
      /**
       * @description The type of mark (bold, italic, etc.)
       */
      type: "bold" | "italic" | "underline" | "strike" | "code" | "link";
      /**
       * @description Additional attributes for the mark
       */
      attrs?: {
        /**
         * @description The URL for link marks
         */
        href?: string;
        /**
         * @description The target for link marks
         */
        target?: string;
        /**
         * @description The rel attribute for link marks
         */
        rel?: string;
        /**
         * @description The class name for styling
         */
        class?: string;
        /**
         * @description The ID for the mark
         */
        id?: string;
        /**
         * @description The title for the mark
         */
        title?: string;
        /**
         * @description The data attributes for the mark
         */
        data?: Record<string, string>;
      };
    }>;
    /**
     * @description The child nodes of this node
     */
    content?: Array<Content["content"][number]>;
  }>;
};

/**
 * @name UPDATE_DOCUMENT
 * @description Updates a document in Tiptap Cloud using JSON format
 * @see https://tiptap.dev/docs/collaboration/documents/content-injection
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
  /**
   * @description The attribute name used to identify nodes (e.g. from UniqueID extension)
   */
  nodeAttributeName?: string;
  /**
   * @description The unique value(s) for the node(s) being updated
   */
  nodeAttributeValue?: string | string[];
  /**
   * @description The mode of update operation
   * @default "replace"
   */
  mode?: "replace" | "append" | "attrs";
  /**
   * @description The checksum from the last document fetch to detect conflicts
   */
  checksum?: string;
}

export default async function updateDocument(
  { identifier, content }: Props,
  _request: Request,
  ctx: AppContext,
) {
  const { baseUrl, apiSecret } = ctx;
  const encodedIdentifier = encodeURIComponent(identifier);
  const url = `${baseUrl}/api/documents/${encodedIdentifier}`;

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Authorization": apiSecret,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(content),
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
