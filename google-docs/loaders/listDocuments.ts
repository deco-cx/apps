import { AppContext } from "../mod.ts";
import { DocumentsListResponse } from "../utils/types.ts";

export interface Props {
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
   * @description Search query to filter documents by title or content
   * @title Search Query
   */
  query?: string;

  /**
   * @description Order documents by creation or modification date
   * @title Order By
   */
  orderBy?: "createdTime" | "modifiedTime" | "name";

  /**
   * @description Whether to include shared documents
   * @title Include Shared
   */
  includeShared?: boolean;
}

/**
 * @title List Documents
 * @description Retrieves a list of Google Docs documents with optional filtering and pagination
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DocumentsListResponse> => {
  const {
    pageSize = 10,
    pageToken,
    query,
    orderBy = "modifiedTime",
    includeShared = true,
  } = props;

  try {
    const searchParams: Record<string, string | number | boolean> = {
      pageSize: Math.min(pageSize, 100),
    };

    if (pageToken) {
      searchParams.pageToken = pageToken;
    }

    if (query) {
      searchParams.q = query;
    }

    if (orderBy) {
      searchParams.orderBy = orderBy;
    }

    const response = await ctx.client["GET /v1/documents"](searchParams);

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        `Error listing documents: ${response.statusText}`,
      );
      throw new Error("Request failed");
    }

    const data = await response.json();

    const filteredDocuments = includeShared
      ? data.documents
      : data.documents.filter((doc: { shared?: boolean }) => !doc.shared);

    return {
      documents: filteredDocuments,
      nextPageToken: data.nextPageToken,
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to list documents",
    );
    throw error;
  }
};

export default loader;
