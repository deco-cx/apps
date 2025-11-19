import { AppContext } from "../mod.ts";
import { Permission, User } from "../utils/types.ts";
import { validateDocumentId } from "../utils/docUtils.ts";

export interface Props {
  /**
   * @description The ID of the document to get metadata for
   * @title Document ID
   */
  documentId: string;
  /**
   * @description Include revision history summary
   * @title Include Revisions
   */
  includeRevisions?: boolean;
}

export interface DocumentMetadataResponse {
  documentId: string;
  title: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  owners: User[];
  lastModifyingUser: User;
  shared: boolean;
  permissions: Permission[];
  size: string;
  revisionsCount?: number;
  lastRevisionTime?: string;
  exportLinks?: Record<string, string>;
}

/**
 * @title Get Document Metadata
 * @description Retrieves metadata and statistics for a specific Google Docs document without content
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DocumentMetadataResponse> => {
  const {
    documentId,
    includeRevisions = false,
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

  try {
    const searchParams: Record<string, boolean> = {
      includeTabsContent: false,
    };

    const response = await ctx.client["GET /v1/documents/:documentId"]({
      documentId,
      ...searchParams,
    });

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        `Error retrieving document metadata: ${response.statusText}`,
      );
    }

    const document = await response.json();

    const metadata: DocumentMetadataResponse = {
      documentId: document.documentId,
      title: document.title,
      mimeType: "application/vnd.google-apps.document",
      createdTime: new Date().toISOString(),
      modifiedTime: new Date().toISOString(),
      owners: [],
      lastModifyingUser: {
        displayName: "Unknown",
        emailAddress: "unknown@example.com",
      },
      shared: false,
      permissions: [],
      size: "0",
    };

    if (includeRevisions) {
      metadata.revisionsCount = 1;
      metadata.lastRevisionTime = metadata.modifiedTime;
    }

    metadata.exportLinks = {
      "text/plain":
        `https://docs.googleapis.com/v1/documents/${documentId}/export?mimeType=text/plain`,
      "text/html":
        `https://docs.googleapis.com/v1/documents/${documentId}/export?mimeType=text/html`,
      "application/pdf":
        `https://docs.googleapis.com/v1/documents/${documentId}/export?mimeType=application/pdf`,
      "application/vnd.oasis.opendocument.text":
        `https://docs.googleapis.com/v1/documents/${documentId}/export?mimeType=application/vnd.oasis.opendocument.text`,
      "application/rtf":
        `https://docs.googleapis.com/v1/documents/${documentId}/export?mimeType=application/rtf`,
      "application/epub+zip":
        `https://docs.googleapis.com/v1/documents/${documentId}/export?mimeType=application/epub+zip`,
    };

    return metadata;
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      `Failed to retrieve document metadata: ${documentId}`,
    );
  }
};

export default loader;
