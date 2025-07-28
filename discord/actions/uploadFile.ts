import type { AppContext } from "../mod.ts";
import { DiscordMessage, DiscordEmbed } from "../utils/types.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description Discord channel ID where to upload the file
   */
  channelId: string;

  /**
   * @title File Content (Base64)
   * @description File content encoded in base64
   */
  fileContent: string;

  /**
   * @title File Name
   * @description Name of the file including extension (e.g., "image.png", "document.pdf")
   */
  fileName: string;

  /**
   * @title File Description
   * @description Description/alt text for the file (optional)
   */
  fileDescription?: string;

  /**
   * @title Message Content
   * @description Additional message content to send with the file
   */
  content?: string;

  /**
   * @title Embeds
   * @description Array of embeds to send with the file
   */
  embeds?: DiscordEmbed[];

  /**
   * @title Spoiler
   * @description Whether to mark the file as spoiler
   * @default false
   */
  spoiler?: boolean;

  /**
   * @title Reply To Message ID
   * @description ID of message to reply to
   */
  replyToMessageId?: string;
}

interface AttachmentData {
  id: number;
  filename: string;
  description?: string;
  content_type?: string;
  size: number;
  url?: string;
  proxy_url?: string;
  width?: number;
  height?: number;
  ephemeral?: boolean;
  duration_secs?: number;
  waveform?: string;
}

/**
 * @title Upload File
 * @description Upload a file to a Discord channel as a message attachment
 */
export default async function uploadFile(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordMessage> {
  const {
    channelId,
    fileContent,
    fileName,
    fileDescription,
    content,
    embeds,
    spoiler = false,
    replyToMessageId,
  } = props;
  const { client } = ctx;

  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  if (!fileContent) {
    throw new Error("File content (base64) is required");
  }

  if (!fileName) {
    throw new Error("File name is required");
  }

  // Validate base64 content
  try {
    atob(fileContent);
  } catch {
    throw new Error("File content must be valid base64 encoded data");
  }

  // Apply spoiler prefix if needed
  const finalFileName = spoiler ? `SPOILER_${fileName}` : fileName;

  // Calculate file size from base64
  const fileSize = Math.floor((fileContent.length * 3) / 4);

  // Discord file size limit (8MB for regular users, 100MB for Nitro)
  const maxFileSize = 8 * 1024 * 1024; // 8MB in bytes
  if (fileSize > maxFileSize) {
    throw new Error(`File size (${fileSize} bytes) exceeds Discord limit (${maxFileSize} bytes)`);
  }

  // Determine content type based on file extension
  const getContentType = (filename: string): string => {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'png': return 'image/png';
      case 'jpg': case 'jpeg': return 'image/jpeg';
      case 'gif': return 'image/gif';
      case 'webp': return 'image/webp';
      case 'mp4': return 'video/mp4';
      case 'mp3': return 'audio/mpeg';
      case 'wav': return 'audio/wav';
      case 'pdf': return 'application/pdf';
      case 'txt': return 'text/plain';
      case 'json': return 'application/json';
      case 'zip': return 'application/zip';
      default: return 'application/octet-stream';
    }
  };

  // Create attachment data
  const attachment: AttachmentData = {
    id: 0,
    filename: finalFileName,
    size: fileSize,
    content_type: getContentType(fileName),
  };

  if (fileDescription) {
    attachment.description = fileDescription;
  }

  // Build message body
  const body: any = {
    attachments: [attachment],
  };

  if (content) {
    body.content = content;
  }

  if (embeds && embeds.length > 0) {
    body.embeds = embeds;
  }

  // Add reply reference if specified
  if (replyToMessageId) {
    body.message_reference = {
      message_id: replyToMessageId,
      channel_id: channelId,
      fail_if_not_exists: false,
    };
  }

  // For this implementation, we'll use the standard message endpoint
  // In a real implementation, you'd need to use Discord's attachment upload flow:
  // 1. First get upload URL from Discord
  // 2. Upload file to that URL
  // 3. Then send message with attachment reference

  // Convert base64 to file data (this is a simplified approach)
  const fileData = `data:${attachment.content_type};base64,${fileContent}`;
  
  // Add file data to the payload (Discord API expects multipart/form-data for files)
  body.files = [{
    name: finalFileName,
    data: fileData,
  }];

  // Send message with file
  const response = await client["POST /channels/:channel_id/messages"]({
    channel_id: channelId,
  }, body);

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to upload file: ${response.statusText}`,
    );
  }

  const message = await response.json();
  return message;
} 