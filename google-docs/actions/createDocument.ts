import { AppContext } from "../mod.ts";
import { CreateDocumentResponse } from "../utils/types.ts";
import { formatDocumentTitle } from "../utils/docUtils.ts";

export interface Props {
  /**
   * @description Title for the new document
   * @title Document Title
   */
  title: string;

  /**
   * @description Initial content for the document (optional)
   * @title Initial Content
   */
  initialContent?: string;
}

/**
 * @title Create Document
 * @description Creates a new Google Docs document with optional initial content
 * @internal
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CreateDocumentResponse & { url?: string }> => {
  const {
    title,
    initialContent,
  } = props;

  if (!title || title.trim().length === 0) {
    ctx.errorHandler.toHttpError(
      new Error("Document title is required"),
      "Document title is required",
    );
  }

  try {
    const formattedTitle = formatDocumentTitle(title);

    const createRequest = {
      title: formattedTitle,
    };

    const response = await ctx.client["POST /v1/documents"]({}, {
      body: createRequest,
    });

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        `Error creating document: ${response.statusText}`,
      );
    }

    const document = await response.json();

    if (initialContent && initialContent.trim().length > 0) {
      try {
        const insertRequest = {
          requests: [{
            insertText: {
              location: {
                index: 1,
              },
              text: initialContent.trim() + "\n",
            },
          }],
        };

        const updateResponse = await ctx.client
          ["POST /v1/documents/$documentId:batchUpdate"]({
            "documentId:batchUpdate": `${document.documentId}:batchUpdate`,
          }, {
            body: insertRequest,
            templateMarker: "$",
            excludeFromSearchParams: ["documentId:batchUpdate"],
          });

        if (!updateResponse.ok) {
          console.warn(
            "Failed to add initial content, but document was created",
          );
        }
      } catch (contentError) {
        console.warn("Failed to add initial content:", contentError);
      }
    }

    const result = {
      ...document,
      url: `https://docs.google.com/document/d/${document.documentId}/edit`,
    };

    return result;
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      `Failed to create document: ${title}`,
    );
    throw error;
  }
};

export default action;
