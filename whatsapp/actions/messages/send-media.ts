import type { AppContext } from "../../mod.ts";
import type { MessageResponse } from "../../client.ts";

export type MediaType = "image" | "audio" | "video" | "document" | "sticker";

export interface Props {
  /**
   * @title Recipient Phone Number
   * @description The phone number of the recipient with country code (e.g., 551199999999)
   */
  to: string;

  /**
   * @title Media Type
   * @description The type of media to send
   */
  mediaType: MediaType;

  /**
   * @title Media ID
   * @description The ID of the uploaded media asset (use this or mediaLink, not both)
   */
  mediaId?: string;

  /**
   * @title Media URL
   * @description The URL of the media to send (use this or mediaId, not both)
   */
  mediaLink?: string;

  /**
   * @title Caption
   * @description Optional caption for the media (not applicable for audio or sticker)
   */
  caption?: string;

  /**
   * @title Filename
   * @description Optional filename for documents
   */
  filename?: string;

  /**
   * @title Reply To Message ID
   * @description The ID of a message to reply to
   */
  replyToMessageId?: string;
}

/**
 * @title Send Media Message
 * @description Send a media message (image, audio, video, document, sticker) to a WhatsApp user
 */
export default async function sendMediaMessage(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<MessageResponse> {
  const {
    to,
    mediaType,
    mediaId,
    mediaLink,
    caption,
    filename,
    replyToMessageId,
  } = props;

  if (!mediaId && !mediaLink) {
    throw new Error("Either mediaId or mediaLink must be provided");
  }

  if (mediaId && mediaLink) {
    throw new Error(
      "Only one of mediaId or mediaLink should be provided, not both",
    );
  }

  // Media object
  const media: Record<string, unknown> = {};

  if (mediaId) {
    media.id = mediaId;
  }

  if (mediaLink) {
    media.link = mediaLink;
  }

  // Add caption if provided and not for audio or sticker
  if (caption && mediaType !== "audio" && mediaType !== "sticker") {
    media.caption = caption;
  }

  // Add filename if provided and media type is document
  if (filename && mediaType === "document") {
    media.filename = filename;
  }

  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: mediaType,
    [mediaType]: media,
  } as const;

  // Add reply context if replying to a message
  if (replyToMessageId) {
    Object.assign(body, {
      context: {
        message_id: replyToMessageId,
      },
    });
  }

  // Use the main messages endpoint instead of trying to construct a dynamic endpoint
  const response = await ctx.api["POST /:phone_number_id/messages"]({
    phone_number_id: ctx.phoneNumberId,
  }, {
    body,
  });

  return await response.json();
}
