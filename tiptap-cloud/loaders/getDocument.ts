import { AppContext } from "../mod.ts";

/**
 * @name GET_DOCUMENT
 * @description Retrieves a document from Tiptap Cloud
 */
export interface Props {
  /**
   * @description The unique identifier for the document
   */
  identifier: string;
  /**
   * @description The format to return the document in
   * @default json
   */
  format?: "json" | "base64" | "text";
  /**
   * @description The fragments to include in the response (only applicable for json or text format)
   */
  fragments?: string[];
}

export default async function getDocument(
  { identifier, format = "json", fragments }: Props,
  _request: Request,
  ctx: AppContext,
) {
  const { baseUrl, apiSecret } = ctx;
  const encodedIdentifier = encodeURIComponent(identifier);

  let url = `${baseUrl}/api/documents/${encodedIdentifier}?format=${format}`;

  if (
    fragments && fragments.length > 0 &&
    (format === "json" || format === "text")
  ) {
    for (const fragment of fragments) {
      url += `&fragment=${encodeURIComponent(fragment)}`;
    }
  }

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
        `Failed to get document: ${response.status} ${response.statusText}. ${errorText}`,
      );
    }

    const data = await response.json();
    return {
      success: true,
      data,
      format,
    };
  } catch (error) {
    console.error("Error getting document:", error);
    return {
      success: false,
      error: error,
    };
  }
}
