import { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title User ID
   * @description The user's email address or 'me' for the authenticated user
   * @default "me"
   */
  userId?: string;

  /**
   * @title To
   * @description Recipient email address(es), comma-separated for multiple recipients
   */
  to: string;

  /**
   * @title CC
   * @description Carbon copy email address(es), comma-separated for multiple recipients
   */
  cc?: string;

  /**
   * @title BCC
   * @description Blind carbon copy email address(es), comma-separated for multiple recipients
   */
  bcc?: string;

  /**
   * @title Subject
   * @description Email subject line
   */
  subject: string;

  /**
   * @title Body Text
   * @description Plain text body of the email
   */
  bodyText?: string;

  /**
   * @title Body HTML
   * @description HTML body of the email (optional, will use bodyText if not provided)
   */
  bodyHtml?: string;

  /**
   * @title Reply To
   * @description Reply-to email address
   */
  replyTo?: string;

  /**
   * @title Thread ID
   * @description Thread ID to reply to an existing conversation
   */
  threadId?: string;
}

interface SendEmailResponse {
  id: string;
  threadId: string;
  labelIds: string[];
}

/**
 * @title Send Email
 * @description Sends an email through Gmail API
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SendEmailResponse | { error: string }> => {
  try {
    const {
      userId = "me",
      to,
      cc,
      bcc,
      subject,
      bodyText,
      bodyHtml,
      replyTo,
      threadId,
    } = props;

    if (!to) {
      return {
        error: "Campo 'to' é obrigatório",
      };
    }

    if (!subject) {
      return {
        error: "Campo 'subject' é obrigatório",
      };
    }

    if (!bodyText && !bodyHtml) {
      return {
        error:
          "Pelo menos um dos campos 'bodyText' ou 'bodyHtml' é obrigatório",
      };
    }

    const headers = [
      "MIME-Version: 1.0",
      `To: ${to}`,
      `Subject: ${subject}`,
    ];

    if (cc) headers.push(`Cc: ${cc}`);
    if (bcc) headers.push(`Bcc: ${bcc}`);
    if (replyTo) headers.push(`Reply-To: ${replyTo}`);

    let emailBody = "";

    if (bodyHtml && bodyText) {
      const boundary = "boundary_" + Date.now().toString(36) +
        Math.random().toString(36);
      headers.push(
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
      );

      emailBody = [
        "",
        `--${boundary}`,
        "Content-Type: text/plain; charset=UTF-8",
        "Content-Transfer-Encoding: 7bit",
        "",
        bodyText,
        "",
        `--${boundary}`,
        "Content-Type: text/html; charset=UTF-8",
        "Content-Transfer-Encoding: 7bit",
        "",
        bodyHtml,
        "",
        `--${boundary}--`,
        "",
      ].join("\r\n");
    } else if (bodyHtml) {
      headers.push("Content-Type: text/html; charset=UTF-8");
      headers.push("Content-Transfer-Encoding: 7bit");
      emailBody = "\r\n\r\n" + bodyHtml;
    } else {
      headers.push("Content-Type: text/plain; charset=UTF-8");
      headers.push("Content-Transfer-Encoding: 7bit");
      emailBody = "\r\n\r\n" + (bodyText || "");
    }

    const rawMessage = headers.join("\r\n") + emailBody;

    const encodedMessage = btoa(unescape(encodeURIComponent(rawMessage)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const requestBody: { raw: string; threadId?: string } = {
      raw: encodedMessage,
    };

    if (threadId) {
      requestBody.threadId = threadId;
    }

    const response = await ctx.client
      ["POST /gmail/v1/users/:userId/messages/send"]({
        userId,
      }, {
        body: requestBody,
      });

    if (!response.ok) {
      const errorData = await response.text();
      return {
        error: `Gmail API error: ${response.status} - ${errorData}`,
      };
    }

    const result = await response.json() as SendEmailResponse;

    return {
      id: result.id,
      threadId: result.threadId,
      labelIds: result.labelIds || [],
    };
  } catch (error) {
    return {
      error: `Erro interno: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
};

export default action;
