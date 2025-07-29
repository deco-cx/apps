import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type {
  TransactionalEmailSendRequest,
  TransactionalEmailSendResponse,
} from "../../utils/types.ts";

export interface Props {
  /**
   * @title Email ID
   * @description The ID of the transactional email template
   */
  emailId: number;

  /**
   * @title Recipient Email
   * @description The email address to send to
   */
  to: string;

  /**
   * @title From Email
   * @description The sender email address (optional)
   */
  from?: string;

  /**
   * @title Reply To
   * @description Reply-to email addresses
   */
  replyTo?: string[];

  /**
   * @title CC
   * @description Carbon copy email addresses
   */
  cc?: string[];

  /**
   * @title BCC
   * @description Blind carbon copy email addresses
   */
  bcc?: string[];

  /**
   * @title Contact Properties
   * @description Contact properties for personalization
   */
  contactProperties?: Record<string, string>;

  /**
   * @title Custom Properties
   * @description Custom properties for the email
   */
  customProperties?: Record<string, unknown>;

  /**
   * @title Send ID
   * @description Unique identifier for this email send (optional)
   */
  sendId?: string;
}

/**
 * @title Send Transactional Email
 * @description Send a transactional email using HubSpot Marketing Email API
 */
export default async function sendTransactionalEmail(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<TransactionalEmailSendResponse> {
  const {
    emailId,
    to,
    from,
    replyTo,
    cc,
    bcc,
    contactProperties,
    customProperties,
    sendId,
  } = props;

  const client = new HubSpotClient(ctx);

  const emailRequest: TransactionalEmailSendRequest = {
    emailId,
    message: {
      to,
      ...(from && { from }),
      ...(replyTo && { replyTo }),
      ...(cc && { cc }),
      ...(bcc && { bcc }),
    },
    ...(contactProperties && { contactProperties }),
    ...(customProperties && { customProperties }),
    ...(sendId && { sendId }),
  };

  const response = await client.post<TransactionalEmailSendResponse>(
    "/marketing/v3/transactional/single-email/send",
    emailRequest,
  );

  return response;
}
