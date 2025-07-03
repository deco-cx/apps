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

  /**
   * @description Whether to share the document publicly
   * @title Make Public
   */
  makePublic?: boolean;
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
    makePublic = false,
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

        // TODO: Our HTTP client doesn't support Google endpoints that use colon notation like :batchUpdate
        // deno-lint-ignore no-explicit-any
        const updateResponse = await (ctx.client as any)
          ["POST /v1/documents/:documentId:batchUpdate"]({
            documentId: document.documentId,
          }, {
            body: insertRequest,
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

    if (makePublic) {
      try {
        const shareRequest = {
          role: "reader",
          type: "anyone",
        };

        const shareResponse = await ctx.client
          ["POST /v1/documents/:documentId/permissions"]({
            documentId: document.documentId,
          }, {
            body: shareRequest,
          });

        if (!shareResponse.ok) {
          console.warn(
            "Failed to make document public, but document was created",
          );
        }
      } catch (shareError) {
        console.warn("Failed to make document public:", shareError);
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
