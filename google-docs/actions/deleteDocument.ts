import { AppContext } from "../mod.ts";
import { validateDocumentId } from "../utils/docUtils.ts";

export interface Props {
  /**
   * @description The ID of the document to delete
   * @title Document ID
   */
  documentId: string;

  /**
   * @description Whether to permanently delete (true) or move to trash (false)
   * @title Permanent Delete
   */
  permanentDelete?: boolean;

  /**
   * @description Confirmation text that must match "DELETE" for permanent deletion
   * @title Confirmation
   */
  confirmation?: string;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
  documentId: string;
  permanentlyDeleted: boolean;
}

/**
 * @title Delete Document
 * @description Deletes a Google Docs document (moves to trash or permanently deletes)
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DeleteResponse> => {
  const {
    documentId,
    permanentDelete = false,
    confirmation,
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

  if (permanentDelete && confirmation !== "DELETE") {
    ctx.errorHandler.toHttpError(
      new Error(
        "For permanent deletion, confirmation must be exactly 'DELETE'",
      ),
      "Confirmation required for permanent deletion",
    );
  }

  try {
    const documentResponse = await ctx.client["GET /v1/documents/:documentId"]({
      documentId,
      includeTabsContent: false,
    });

    if (!documentResponse.ok) {
      ctx.errorHandler.toHttpError(
        documentResponse,
        `Document not found: ${documentResponse.statusText}`,
      );

      return {
        success: false,
        message: "Document not found or you don't have permission to delete it",
        documentId,
        permanentlyDeleted: false,
      };
    }

    const document = await documentResponse.json();

    // deno-lint-ignore no-explicit-any
    const response = await (ctx.client as any)
      ["DELETE /v1/documents/:documentId"]({
        documentId,
      });

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        `Error deleting document: ${response.statusText}`,
      );

      return {
        success: false,
        message: `Failed to delete document: ${response.statusText}`,
        documentId,
        permanentlyDeleted: false,
      };
    }

    const message = permanentDelete
      ? `Document "${document.title}" has been permanently deleted`
      : `Document "${document.title}" has been moved to trash`;

    return {
      success: true,
      message,
      documentId,
      permanentlyDeleted: permanentDelete,
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      `Failed to delete document: ${documentId}`,
    );
  }
};

export default action;
