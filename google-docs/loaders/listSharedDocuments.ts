import { AppContext } from "../mod.ts";
import { DocumentMetadata, DocumentsListResponse } from "../utils/types.ts";

export interface Props {
  /**
   * @description Filter by permission role
   * @title Permission Role
   */
  role?: "owner" | "writer" | "commenter" | "reader";

  /**
   * @description Filter by sharer's email address
   * @title Sharer Email
   */
  sharerEmail?: string;

  /**
   * @description Include documents where user is owner
   * @title Include Owned
   */
  includeOwned?: boolean;

  /**
   * @description Maximum number of documents to return
   * @title Page Size
   */
  pageSize?: number;

  /**
   * @description Token for retrieving the next page of results
   * @title Page Token
   */
  pageToken?: string;

  /**
   * @description Order documents by creation or modification date
   * @title Order By
   */
  orderBy?: "createdTime" | "modifiedTime" | "name";
}

/**
 * @title List Shared Documents
 * @description Retrieves documents shared with the authenticated user with filtering options
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DocumentsListResponse> => {
  const {
    role,
    sharerEmail,
    includeOwned = false,
    pageSize = 10,
    pageToken,
    orderBy = "modifiedTime",
  } = props;

  try {
    let searchQuery = "mimeType = 'application/vnd.google-apps.document'";

    if (!includeOwned) {
      searchQuery += " and sharedWithMe = true";
    }

    if (role) {
      searchQuery += ` and '${role}' in permissions`;
    }

    if (sharerEmail) {
      searchQuery += ` and '${sharerEmail}' in owners`;
    }

    const searchParams: Record<string, string | number> = {
      q: searchQuery,
      pageSize: Math.min(pageSize, 100),
      orderBy: `${orderBy} desc`,
    };

    if (pageToken) {
      searchParams.pageToken = pageToken;
    }

    const response = await ctx.client["GET /v1/documents"](searchParams);

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        `Error listing shared documents: ${response.statusText}`,
      );
      throw new Error("Request failed");
    }

    const data = await response.json();

    const filteredDocuments = data.documents.filter((doc: DocumentMetadata) => {
      if (!includeOwned && !doc.shared) {
        return false;
      }

      if (role && doc.permissions) {
        const hasRole = doc.permissions.some((permission) =>
          permission.role === role
        );
        if (!hasRole) {
          return false;
        }
      }

      if (sharerEmail && doc.owners) {
        const hasSharer = doc.owners.some((owner) =>
          owner.emailAddress === sharerEmail
        );
        if (!hasSharer) {
          return false;
        }
      }

      return true;
    });

    const enrichedDocuments = filteredDocuments.map((
      doc: DocumentMetadata,
    ) => ({
      ...doc,
      shared: true,
      shareInfo: {
        sharedCount: doc.permissions?.length || 0,
        hasWriteAccess: doc.permissions?.some((p) =>
          p.role === "writer" || p.role === "owner"
        ) || false,
        hasCommentAccess: doc.permissions?.some((p) =>
          p.role === "commenter" || p.role === "writer" || p.role === "owner"
        ) || false,
      },
    }));

    return {
      documents: enrichedDocuments,
      nextPageToken: data.nextPageToken,
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to list shared documents",
    );
    throw error;
  }
};

export default loader;
