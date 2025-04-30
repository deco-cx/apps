import { AppContext } from "../mod.ts";

/**
 * @name LIST_DOCUMENTS
 * @description Lists all documents in Tiptap Cloud with pagination
 */
export interface Props {
  /**
   * @description The number of documents to take
   * @default 100
   */
  take?: number;
  /**
   * @description The number of documents to skip
   * @default 0
   */
  skip?: number;
}

export default async function listDocuments(
  { take = 100, skip = 0 }: Props,
  _request: Request,
  ctx: AppContext,
) {
  const { baseUrl, apiSecret } = ctx;
  const url = `${baseUrl}/api/documents?take=${take}&skip=${skip}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": apiSecret,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to list documents: ${response.status} ${response.statusText}. ${errorText}`,
      );
    }

    const documents = await response.json();
    return {
      success: true,
      documents,
      pagination: {
        take,
        skip,
      },
    };
  } catch (error) {
    console.error("Error listing documents:", error);
    return {
      success: false,
      error: error,
    };
  }
}
