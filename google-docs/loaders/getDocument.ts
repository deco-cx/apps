import { AppContext } from "../mod.ts";
import { Document } from "../utils/types.ts";
import {
  extractTextFromDocument,
  validateDocumentId,
} from "../utils/docUtils.ts";

export interface Props {
  /**
   * @description The ID of the document to retrieve
   * @title Document ID
   */
  documentId: string;

  /**
   * @description Whether to include tabs content in the response
   * @title Include Tabs Content
   */
  includeTabsContent?: boolean;

  /**
   * @description The suggestions view mode for the document
   * @title Suggestions View Mode
   */
  suggestionsViewMode?:
    | "SUGGESTIONS_INLINE"
    | "PREVIEW_SUGGESTIONS_ACCEPTED"
    | "PREVIEW_WITHOUT_SUGGESTIONS";

  /**
   * @description Format to return content in
   * @title Content Format
   */
  contentFormat?: "FULL" | "TEXT_ONLY" | "METADATA_ONLY";
}

export interface DocumentResponse extends Document {
  textContent?: string;
  wordCount?: number;
  characterCount?: number;
}

/**
 * @title Get Document
 * @description Retrieves a specific Google Docs document by ID with content and metadata
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<(DocumentResponse & { error?: string }) | { error: string }> => {
  const {
    documentId,
    includeTabsContent = false,
    suggestionsViewMode = "SUGGESTIONS_INLINE",
    contentFormat = "FULL",
  } = props;

  if (!documentId) {
    return {
      error: "Document ID is required",
    };
  }

  if (!validateDocumentId(documentId)) {
    return {
      error: "Invalid document ID format",
    };
  }

  const searchParams: Record<string, string | boolean> = {
    includeTabsContent,
    suggestionsViewMode,
  };

  const response = await ctx.client["GET /v1/documents/:documentId"]({
    documentId,
    ...searchParams,
  });

  if (!response.ok) {
    return {
      error: `Error retrieving document: ${response.statusText}`,
    };
  }

  const document = await response.json();

  const result: DocumentResponse = { ...document };

  if (contentFormat === "TEXT_ONLY" || contentFormat === "FULL") {
    const textContent = extractTextFromDocument(document);
    result.textContent = textContent;

    if (textContent) {
      result.wordCount = textContent.split(/\s+/).filter((word) =>
        word.length > 0
      ).length;
      result.characterCount = textContent.length;
    }
  }

  if (contentFormat === "METADATA_ONLY") {
    delete result.body;
  }

  return result;
};

export default loader;
