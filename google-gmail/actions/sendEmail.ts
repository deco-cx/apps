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
 * Encode subject line for MIME headers (RFC 2047)
 * @param subject - The subject string to encode
 * @returns Encoded subject string
 */
function encodeSubject(subject: string): string {
  // Check if subject contains non-ASCII characters
  // deno-lint-ignore no-control-regex
  if (/[^\u0000-\u007F]/.test(subject)) {
    // Use base64 encoding for UTF-8
    const encoded = btoa(unescape(encodeURIComponent(subject)));
    return `=?UTF-8?B?${encoded}?=`;
  }
  // Return as-is if only ASCII characters
  return subject;
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
        error: "field 'to' is required",
      };
    }

    if (!subject) {
      return {
        error: "field 'subject' is required",
      };
    }

    if (!bodyText && !bodyHtml) {
      return {
        error:
          "at least one of the fields 'bodyText' or 'bodyHtml' is required",
      };
    }

    const headers = [
      "MIME-Version: 1.0",
      `To: ${to}`,
      `Subject: ${encodeSubject(subject)}`,
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
      ctx.errorHandler.toHttpError(
        response,
        `Error to send email: ${response.statusText}`,
      );
    }

    const result = await response.json() as SendEmailResponse;

    return {
      id: result.id,
      threadId: result.threadId,
      labelIds: result.labelIds || [],
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(error, "Error to send email");
  }
};

export default action;
