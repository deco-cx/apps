import { AppContext } from "../mod.ts";
import { EmailsResponse } from "../utils/types.ts";
import { processEmailForListing } from "../utils/emailUtils.ts";

export interface Props {
  /**
   * @title User ID
   * @description The user's email address or 'me' for the authenticated user
   * @default "me"
   */
  userId?: string;

  /**
   * @title Query
   * @description Gmail search query to filter emails
   */
  query?: string;

  /**
   * @title Label IDs
   * @description Comma-separated list of label IDs to filter by
   */
  labelIds?: string;

  /**
   * @title Include Spam/Trash
   * @description Whether to include spam and trash emails
   * @default false
   */
  includeSpamTrash?: boolean;

  /**
   * @title Max Results
   * @description Maximum number of emails to return (1-500)
   * @default 25
   */
  maxResults?: number;

  /**
   * @title Page Token
   * @description Token for pagination
   */
  pageToken?: string;
}

/**
 * @title Get Emails
 * @description Retrieves a list of emails with optional filtering and pagination
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<EmailsResponse | { error: string }> => {
  try {
    const {
      userId = "me",
      query,
      labelIds,
      includeSpamTrash = false,
      maxResults = 25,
      pageToken,
    } = props;

    if (maxResults && (maxResults < 1 || maxResults > 500)) {
      return {
        error: "maxResults deve estar entre 1 e 500",
      };
    }

    const listResponse = await ctx.client
      ["GET /gmail/v1/users/:userId/messages"]({
        userId,
        q: query,
        labelIds,
        includeSpamTrash,
        maxResults,
        pageToken,
      });

    if (!listResponse.ok) {
      ctx.errorHandler.toHttpError(
        listResponse,
        `Error to list emails: ${listResponse.statusText}`,
      );
    }

    const listData = await listResponse.json();

    if (!listData.messages || listData.messages.length === 0) {
      return {
        messages: [],
        nextPageToken: listData.nextPageToken,
        resultSizeEstimate: 0,
      };
    }

    const messagesWithMetadata = await Promise.all(
      listData.messages.map(
        async (message: { id: string; threadId: string }) => {
          try {
            const detailResponse = await ctx.client
              ["GET /gmail/v1/users/:userId/messages/:id"]({
                userId,
                id: message.id,
                format: "metadata",
              });

            if (!detailResponse.ok) {
              console.warn(
                `Error to load email details ${message.id}: ${detailResponse.statusText}`,
              );
              return {
                id: message.id,
                threadId: message.threadId,
                subject: "Erro ao carregar",
                from: "Desconhecido",
                to: "",
                date: "",
                snippet: "",
              };
            }

            const emailData = await detailResponse.json();

            return processEmailForListing(emailData);
          } catch (_error) {
            return {
              id: message.id,
              threadId: message.threadId,
              subject: "Erro ao carregar",
              from: "Desconhecido",
              to: "",
              date: "",
              snippet: "",
            };
          }
        },
      ),
    );

    return {
      messages: messagesWithMetadata,
      nextPageToken: listData.nextPageToken,
      resultSizeEstimate: listData.resultSizeEstimate,
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(error, "Error to list emails");
  }
};

export default loader;
