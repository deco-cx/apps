import { AppContext } from "../mod.ts";
import { CreateDocumentResponse } from "../utils/types.ts";
import { formatDocumentTitle, validateDocumentId } from "../utils/docUtils.ts";

export interface Props {
  /**
   * @description The ID of the document to duplicate
   * @title Source Document ID
   */
  sourceDocumentId: string;

  /**
   * @description Title for the duplicated document
   * @title New Title
   */
  newTitle?: string;

  /**
   * @description Folder ID where to save the copy (optional)
   * @title Destination Folder ID
   */
  destinationFolderId?: string;

  /**
   * @description Whether to inherit permissions from source document
   * @title Inherit Permissions
   */
  inheritPermissions?: boolean;
}

/**
 * @title Duplicate Document
 * @description Creates a copy of an existing Google Docs document
 * @internal
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CreateDocumentResponse & { url?: string }> => {
  const {
    sourceDocumentId,
    newTitle,
    destinationFolderId,
    inheritPermissions = false,
  } = props;

  if (!sourceDocumentId) {
    ctx.errorHandler.toHttpError(
      new Error("Source document ID is required"),
      "Source document ID is required",
    );
  }

  if (!validateDocumentId(sourceDocumentId)) {
    ctx.errorHandler.toHttpError(
      new Error("Invalid source document ID format"),
      "Invalid source document ID format",
    );
  }

  try {
    const sourceDocument = await ctx.client["GET /v1/documents/:documentId"]({
      documentId: sourceDocumentId,
      includeTabsContent: false,
    });

    if (!sourceDocument.ok) {
      ctx.errorHandler.toHttpError(
        sourceDocument,
        `Error retrieving source document: ${sourceDocument.statusText}`,
      );
    }

    const sourceDoc = await sourceDocument.json();

    const title = newTitle
      ? formatDocumentTitle(newTitle)
      : formatDocumentTitle(`Copy of ${sourceDoc.title}`);

    const copyRequest: {
      title: string;
      destinationFolderId?: string;
    } = {
      title,
    };

    if (destinationFolderId) {
      copyRequest.destinationFolderId = destinationFolderId;
    }

    // TODO: Our HTTP client doesn't support Google endpoints that use colon notation like :copy
    // deno-lint-ignore no-explicit-any
    const response = await (ctx.client as any)
      ["POST /v1/documents/:sourceDocumentId:copy"]({
        sourceDocumentId,
      }, {
        body: copyRequest,
      });

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        `Error duplicating document: ${response.statusText}`,
      );
      throw new Error("Request failed");
    }

    const duplicatedDocument = await response.json();

    if (inheritPermissions) {
      try {
        // deno-lint-ignore no-explicit-any
        const permissionsResponse = await (ctx.client as any)
          ["GET /v1/documents/:documentId/permissions"]({
            documentId: sourceDocumentId,
          });

        if (permissionsResponse.ok) {
          const permissionsData = await permissionsResponse.json();

          for (const permission of permissionsData.permissions || []) {
            if (permission.type !== "anyone" && permission.role !== "owner") {
              try {
                // deno-lint-ignore no-explicit-any
                await (ctx.client as any)
                  ["POST /v1/documents/:documentId/permissions"]({
                    documentId: duplicatedDocument.documentId,
                  }, {
                    body: {
                      role: permission.role,
                      type: permission.type,
                      emailAddress: permission.emailAddress,
                      domain: permission.domain,
                      sendNotificationEmail: false,
                    },
                  });
              } catch (permError) {
                console.warn(
                  `Failed to copy permission for ${permission.emailAddress}:`,
                  permError,
                );
              }
            }
          }
        }
      } catch (permissionsError) {
        console.warn("Failed to inherit permissions:", permissionsError);
      }
    }

    const result = {
      ...duplicatedDocument,
      url:
        `https://docs.google.com/document/d/${duplicatedDocument.documentId}/edit`,
    };

    return result;
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      `Failed to duplicate document: ${sourceDocumentId}`,
    );
    throw error;
  }
};

export default action;
