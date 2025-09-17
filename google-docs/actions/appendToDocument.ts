import { AppContext } from "../mod.ts";
import { BatchUpdateDocumentResponse, Document } from "../utils/types.ts";
import { sanitizeText, validateDocumentId } from "../utils/docUtils.ts";

export interface Props {
  /**
   * @description The ID of the document to append content to
   * @title Document ID
   */
  documentId: string;

  /**
   * @description Content to append to the end of the document
   * @title Content
   */
  content: string;

  /**
   * @description Add a line break before the new content
   * @title Add Line Break
   */
  addLineBreak?: boolean;

  /**
   * @description Text formatting options
   * @title Text Style
   */
  textStyle?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    fontSize?: number;
  };
}

/**
 * @title Append to Document
 * @description Adds content to the end of a Google Docs document
 * @internal
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<BatchUpdateDocumentResponse> => {
  const {
    documentId,
    content,
    addLineBreak = true,
    textStyle,
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

  if (!content || content.trim().length === 0) {
    ctx.errorHandler.toHttpError(
      new Error("Content is required"),
      "Content is required",
    );
  }

  try {
    const documentResponse = await ctx.client["GET /v1/documents/:documentId"]({
      documentId,
      includeTabsContent: false,
    });

    if (!documentResponse.ok) {
      ctx.errorHandler.toHttpError(
        documentResponse,
        `Error retrieving document: ${documentResponse.statusText}`,
      );
    }

    const document: Document = await documentResponse.json();

    let endIndex = 1;
    if (document.body?.content) {
      const lastElement =
        document.body.content[document.body.content.length - 1];
      endIndex = lastElement.endIndex || 1;
    }

    const sanitizedContent = sanitizeText(content);
    const textToInsert = addLineBreak
      ? "\n" + sanitizedContent
      : sanitizedContent;

    const requests = [];

    requests.push({
      insertText: {
        location: {
          index: endIndex - 1,
        },
        text: textToInsert,
      },
    });

    if (textStyle) {
      const startIndex = endIndex + (addLineBreak ? 1 : 0) - 1;
      const endTextIndex = startIndex + sanitizedContent.length;

      requests.push({
        updateTextStyle: {
          range: {
            startIndex,
            endIndex: endTextIndex,
          },
          textStyle: {
            bold: textStyle.bold,
            italic: textStyle.italic,
            underline: textStyle.underline,
            fontSize: textStyle.fontSize
              ? {
                magnitude: textStyle.fontSize,
                unit: "PT",
              }
              : undefined,
          },
          fields: "bold,italic,underline" +
            (textStyle.fontSize ? ",fontSize" : ""),
        },
      });
    }

    const updateRequest = {
      requests,
    };

    const response = await ctx.client
      ["POST /v1/documents/$documentId:batchUpdate"]({
        "documentId:batchUpdate": `${documentId}:batchUpdate`,
      }, {
        body: updateRequest,
        excludeFromSearchParams: ["documentId:batchUpdate"], // Exclude documentId from search params
        templateMarker: "$",
      });

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        `Error appending content to document: ${response.statusText}`,
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      `Failed to append content to document: ${documentId}`,
    );
  }
};

export default action;
