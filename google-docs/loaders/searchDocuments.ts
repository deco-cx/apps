import { AppContext } from "../mod.ts";
import { DocumentMetadata, DocumentsListResponse } from "../utils/types.ts";

export interface Props {
  /**
   * @description Search query for document title or content
   * @title Search Query
   */
  query: string;

  /**
   * @description Search in document title only
   * @title Title Only
   */
  titleOnly?: boolean;

  /**
   * @description Filter by document owner email
   * @title Owner Email
   */
  ownerEmail?: string;

  /**
   * @description Filter by last modified date (ISO format)
   * @title Modified After
   */
  modifiedAfter?: string;

  /**
   * @description Filter by last modified date (ISO format)
   * @title Modified Before
   */
  modifiedBefore?: string;

  /**
   * @description Maximum number of results to return
   * @title Max Results
   */
  maxResults?: number;

  /**
   * @description Token for pagination
   * @title Page Token
   */
  pageToken?: string;

  /**
   * @description Include shared documents in search
   * @title Include Shared
   */
  includeShared?: boolean;
}

/**
 * @title Search Documents
 * @description Search Google Docs documents by title, content, owner, and date filters
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DocumentsListResponse & { error: string }> => {
  const {
    query,
    titleOnly = false,
    ownerEmail,
    modifiedAfter,
    modifiedBefore,
    maxResults = 20,
    pageToken,
    includeShared = true,
  } = props;

  if (!query || query.trim().length === 0) {
    return {
      documents: [],
      nextPageToken: "",
      error: "Search query is required",
    };
  }

  let searchQuery = query.trim();

  if (titleOnly) {
    searchQuery = `name contains '${searchQuery}'`;
  } else {
    searchQuery = `fullText contains '${searchQuery}'`;
  }

  if (ownerEmail) {
    searchQuery += ` and '${ownerEmail}' in owners`;
  }

  if (modifiedAfter) {
    const date = new Date(modifiedAfter).toISOString();
    searchQuery += ` and modifiedTime > '${date}'`;
  }

  if (modifiedBefore) {
    const date = new Date(modifiedBefore).toISOString();
    searchQuery += ` and modifiedTime < '${date}'`;
  }

  if (!includeShared) {
    searchQuery += ` and sharedWithMe = false`;
  }

  searchQuery += ` and mimeType = 'application/vnd.google-apps.document'`;

  const searchParams: Record<string, string | number> = {
    q: searchQuery,
    pageSize: Math.min(maxResults, 100),
    orderBy: "modifiedTime desc",
  };

  if (pageToken) {
    searchParams.pageToken = pageToken;
  }

  const response = await ctx.client["GET /v1/documents"](searchParams);

  if (!response.ok) {
    return {
      documents: [],
      nextPageToken: "",
      error: `Error searching documents: ${response.statusText}`,
    };
  }

  const data = await response.json();

  const filteredDocuments = data.documents.filter((doc: DocumentMetadata) => {
    if (!includeShared && doc.shared) {
      return false;
    }

    if (titleOnly) {
      return doc.title.toLowerCase().includes(query.toLowerCase());
    }

    return true;
  });

  return {
    documents: filteredDocuments,
    error: "",
    nextPageToken: data.nextPageToken,
  };
};

export default loader;
