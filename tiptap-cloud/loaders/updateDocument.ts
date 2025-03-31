import { AppContext } from "../mod.ts";

/**
 * @name UPDATE_DOCUMENT
 * @description Updates a document in Tiptap Cloud
 */
export interface Props {
  /**
   * @description The unique identifier for the document
   */
  identifier: string;
  /**
   * @description The document content in JSON format
   */
  content: Record<string, unknown>;
}

export default async function updateDocument(
  { identifier, content }: Props,
  _request: Request,
  ctx: AppContext,
) {
  const { baseUrl, apiSecret } = ctx;
  const encodedIdentifier = encodeURIComponent(identifier);
  const url = `${baseUrl}/api/documents/${encodedIdentifier}`;

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Authorization": apiSecret,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(content),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update document: ${response.status} ${response.statusText}. ${errorText}`);
    }

    return {
      success: true,
      status: response.status,
      message: "Document updated successfully",
    };
  } catch (error) {
    console.error("Error updating document:", error);
    return {
      success: false,
      error: error,
    };
  }
} 