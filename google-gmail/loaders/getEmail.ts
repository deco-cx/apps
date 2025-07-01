import { AppContext } from "../mod.ts";
import { EmailMessage } from "../utils/types.ts";
import {
  extractBody,
  getHeader,
  processEmailForListing,
} from "../utils/emailUtils.ts";

export interface Props {
  /**
   * @title User ID
   * @description The user's email address or 'me' for the authenticated user
   * @default "me"
   */
  userId?: string;

  /**
   * @title Message ID
   * @description The ID of the message to retrieve
   */
  id: string;

  /**
   * @title Format
   * @description The format to return the message in
   * @default "full"
   */
  format?: "minimal" | "full" | "raw" | "metadata";
}

/**
 * @title Get Email
 * @description Retrieves complete details of a specific email by ID
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<EmailMessage | { error: string }> => {
  try {
    const {
      userId = "me",
      id,
      format = "full",
    } = props;

    if (!id) {
      return {
        error: "ID do email é obrigatório",
      };
    }

    const response = await ctx.client
      ["GET /gmail/v1/users/:userId/messages/:id"]({
        userId,
        id,
        format,
      });

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        `Error to get email: ${response.statusText}`,
      );
    }

    const emailData = await response.json();

    if (format === "metadata") {
      const basicData = processEmailForListing(emailData);
      return {
        ...basicData,
        labelIds: emailData.labelIds || [],
        historyId: emailData.historyId,
        internalDate: emailData.internalDate,
        sizeEstimate: emailData.sizeEstimate,
        headers: emailData.payload?.headers || [],
        payload: emailData.payload,
      };
    }

    const headers = emailData.payload?.headers || [];
    const body = emailData.payload
      ? extractBody(emailData.payload)
      : { text: undefined, html: undefined };

    return {
      id: emailData.id,
      threadId: emailData.threadId,
      labelIds: emailData.labelIds || [],
      snippet: emailData.snippet || "",
      historyId: emailData.historyId,
      internalDate: emailData.internalDate,
      sizeEstimate: emailData.sizeEstimate,
      subject: getHeader(headers, "Subject") || "(Sem assunto)",
      from: getHeader(headers, "From"),
      to: getHeader(headers, "To"),
      cc: getHeader(headers, "Cc"),
      bcc: getHeader(headers, "Bcc"),
      date: getHeader(headers, "Date"),
      messageId: getHeader(headers, "Message-ID"),
      replyTo: getHeader(headers, "Reply-To"),
      body: body,
      headers: headers,
      payload: emailData.payload,
    };
  } catch (error) {
    return {
      error: `Erro interno: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
};

export default loader;
