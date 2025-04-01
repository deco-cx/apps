import { AppContext } from "../mod.ts";

/**
 * @name DELETE_DOCUMENT
 * @description Deletes a document from Tiptap Cloud
 */
export interface Props {
  /**
   * @description The unique identifier for the document
   */
  identifier: string;
}

export default async function deleteDocument(
  { identifier }: Props,
  _request: Request,
  ctx: AppContext,
) {
  const { baseUrl, apiSecret } = ctx;
  const encodedIdentifier = encodeURIComponent(identifier);
  const url = `${baseUrl}/api/documents/${encodedIdentifier}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Authorization": apiSecret,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to delete document: ${response.status} ${response.statusText}. ${errorText}`,
      );
    }

    return {
      success: true,
      status: response.status,
      message: "Document deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting document:", error);
    return {
      success: false,
      error: error,
    };
  }
}
