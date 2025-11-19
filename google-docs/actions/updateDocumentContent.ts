import { AppContext } from "../mod.ts";
import { BatchUpdateDocumentResponse } from "../utils/types.ts";
import { sanitizeText, validateDocumentId } from "../utils/docUtils.ts";

export interface Props {
  /**
   * @description The ID of the document to update
   * @title Document ID
   */
  documentId: string;

  /**
   * @description New content to replace the entire document
   * @title Content
   */
  content: string;

  /**
   * @description Whether to preserve existing formatting
   * @title Preserve Formatting
   */
  preserveFormatting?: boolean;

  /**
   * @description Revision ID to ensure document hasn't changed
   * @title Revision ID
   */
  revisionId?: string;
}

/**
 * @title Update Document Content
 * @description Replaces the entire content of a Google Docs document
 * @internal
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<BatchUpdateDocumentResponse> => {
  const {
    documentId,
    content,
    preserveFormatting: _preserveFormatting = false,
    revisionId,
  } = props;

  if (!documentId) {
    ctx.errorHandler.toHttpError(
      new Error("Document ID is required"),
      "Document ID is required",
    );
  }

  if (!validateDocumentId(documentId)) {
    ctx.errorHandler.toHttpError(
      new Error("Invalid document ID format"),
      "Invalid document ID format",
    );
  }

  if (!content) {
    ctx.errorHandler.toHttpError(
      new Error("Content is required"),
      "Content is required",
    );
  }

  try {
    // First, get the document to find its actual length
    const documentResponse = await ctx.client["GET /v1/documents/:documentId"]({
      documentId,
    });

    if (!documentResponse.ok) {
      ctx.errorHandler.toHttpError(
        documentResponse,
        `Error retrieving document: ${documentResponse.statusText}`,
      );
    }

    const document = await documentResponse.json();

    // Calculate the actual end index of the document
    // Find the last element in the document body
    const bodyContent = document.body?.content || [];
    let documentLength = 1; // Default to 1 if no content

    if (bodyContent.length > 0) {
      const lastElement = bodyContent[bodyContent.length - 1];
      if (lastElement.endIndex) {
        documentLength = lastElement.endIndex - 1; // endIndex is exclusive, so subtract 1
      }
    }

    const sanitizedContent = sanitizeText(content);

    const requests = [];

    // Delete all content from index 1 to the end of the document
    requests.push({
      deleteContentRange: {
        range: {
          startIndex: 1,
          endIndex: documentLength,
        },
      },
    });

    requests.push({
      insertText: {
        location: {
          index: 1,
        },
        text: sanitizedContent,
      },
    });

    const updateRequest = {
      requests,
      writeControl: revisionId
        ? {
          requiredRevisionId: revisionId,
        }
        : undefined,
    };

    const response = await ctx.client
      ["POST /v1/documents/$documentId:batchUpdate"]({
        "documentId:batchUpdate": `${documentId}:batchUpdate`,
      }, {
        body: updateRequest,
        templateMarker: "$",
        excludeFromSearchParams: ["documentId:batchUpdate"],
      });

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        `Error updating document content: ${response.statusText}`,
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      `Failed to update document content: ${documentId}`,
    );
  }
};

export default action;
