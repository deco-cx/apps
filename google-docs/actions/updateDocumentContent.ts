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
    const sanitizedContent = sanitizeText(content);

    const requests = [];

    requests.push({
      deleteContentRange: {
        range: {
          startIndex: 1,
          endIndex: -1,
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

    // TODO: Our HTTP client doesn't support Google endpoints that use colon notation like :batchUpdate
    // deno-lint-ignore no-explicit-any
    const response = await (ctx.client as any)
      ["POST /v1/documents/:documentId:batchUpdate"]({
        documentId,
      }, {
        body: updateRequest,
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
