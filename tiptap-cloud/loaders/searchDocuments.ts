import { AppContext } from "../mod.ts";

/**
 * @name SEARCH_DOCUMENTS
 * @description Performs a semantic search across all documents in Tiptap Cloud
 */
export interface Props {
  /**
   * @description The search query
   */
  content: string;
  /**
   * @description The similarity threshold (0-1)
   * @default 0.5
   */
  threshold?: number;
  /**
   * @description The maximum number of results to return
   * @default 20
   */
  limit?: number;
}

export default async function searchDocuments(
  { content, threshold = 0.5, limit = 20 }: Props,
  _request: Request,
  ctx: AppContext,
) {
  const { baseUrl, apiSecret } = ctx;
  const url = `${baseUrl}/api/search?threshold=${threshold}&limit=${limit}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": apiSecret,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to search documents: ${response.status} ${response.statusText}. ${errorText}`,
      );
    }

    const results = await response.json();
    return {
      success: true,
      results,
      searchParams: {
        query: content,
        threshold,
        limit,
      },
    };
  } catch (error) {
    console.error("Error searching documents:", error);
    return {
      success: false,
      error: error,
    };
  }
}
