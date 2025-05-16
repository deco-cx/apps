import type { AppContext } from "../mod.ts";
import { WebhookPayload } from "../types.ts";
import sendTextMessage from "./messages/send-text.ts";
import {
  type DataStreamPartType,
  parseDataStreamPart,
} from "../utils/stream.ts";
import { MessageQueue } from "../utils/message-queue.ts";

// Track processed message IDs to prevent duplicates
const processedMessageIds = new Set<string>();

interface ToolResultListener {
  (part: DataStreamPartType): void;
}

declare global {
  var toolResultListeners: Map<string, ToolResultListener>;
}

/**
 * Service class to handle webhook-related operations
 */
export class WebhookService {
  private static readonly WEBHOOK_URL =
    "http://localhost:3001/actors/Trigger/invoke/run?passphrase=cc-guy&deno_isolate_instance_id=/users/d9064704-4fdd-45e1-9ae5-df90b6be42e3/Agents/bd35b510-917a-4cce-ac89-9c8aebe2b3ff/triggers/8b2e47ee-6b33-484f-97d0-5c941efbd5bc&stream=true&bypassOpenRouter=true&threadId=3334";
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second
  private static readonly TYPING_INDICATOR_INTERVAL = 20000; // 20 seconds
  private static readonly TYPING_INDICATOR_TIMEOUT = 25000; // 25 seconds

  /**
   * Sends a message to the webhook and processes the stream response
   * @param text The message text to send
   * @param from The sender's phone number
   * @param req The request object
   * @param ctx The application context
   * @param replyToMessageId The ID of the message to reply to
   * @returns The processed message from the stream
   */
  static async sendMessage(
    text: string,
    from: string,
    req: Request,
    ctx: AppContext,
    replyToMessageId?: string,
  ): Promise<string> {
    let retries = 0;
    let lastError: Error | null = null;
    let typingIndicatorInterval: number | null = null;
    let typingIndicatorTimeout: number | null = null;
    // deno-lint-ignore no-unused-vars
    let lastMessageTime = Date.now();
    let buffer = ""; // Buffer for incomplete JSON chunks

    while (retries < this.MAX_RETRIES) {
      try {
        console.log("Sending message to webhook:", this.WEBHOOK_URL);
        const response = await fetch(this.WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [{
              role: "user",
              content: text,
              id: crypto.randomUUID(),
            }],
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to send message: ${response.status} ${response.statusText}`,
          );
        }

        if (!response.body) {
          throw new Error("No response body received");
        }

        console.log("Successfully triggered actor. Handling stream response:");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let completeMessage = "";
        let textBuffer = "";
        let isStreamComplete = false;

        try {
          // eslint-disable-next-line no-constant-condition
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log("Stream finished normally.");
              isStreamComplete = true;
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            console.log("Stream chunk:", chunk);

            // Add chunk to buffer and try to process complete lines
            buffer += chunk;
            const lines = buffer.split("\n");

            // Keep the last line in the buffer if it's incomplete
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.trim()) continue;

              try {
                const streamPart = parseDataStreamPart(line);
                if (streamPart.type === "text") {
                  textBuffer += streamPart.value;
                  completeMessage += streamPart.value;
                } else {
                  if (textBuffer) {
                    // Send message without awaiting to avoid blocking the stream
                    lastMessageTime = Date.now();
                    sendTextMessage(
                      {
                        to: from,
                        text: cleanMessage(textBuffer),
                        replyToMessageId,
                      },
                      req,
                      ctx,
                    ).catch((error) => {
                      console.error("Error sending message:", error);
                    });
                    textBuffer = "";
                  }
                  await handleStreamPart(
                    streamPart,
                    completeMessage,
                    from,
                    req,
                    ctx,
                    replyToMessageId,
                  );
                }
              } catch (error) {
                console.error("Error parsing stream part:", error);
                // If we get a parsing error, try to accumulate more data
                buffer = line + "\n" + buffer;
              }
            }
          }

          // Process any remaining data in the buffer
          if (buffer.trim()) {
            try {
              const streamPart = parseDataStreamPart(buffer);
              if (streamPart.type === "text") {
                textBuffer += streamPart.value;
                completeMessage += streamPart.value;
              } else {
                if (textBuffer) {
                  lastMessageTime = Date.now();
                  await sendTextMessage(
                    {
                      to: from,
                      text: cleanMessage(textBuffer),
                      replyToMessageId,
                    },
                    req,
                    ctx,
                  );
                  textBuffer = "";
                }
                await handleStreamPart(
                  streamPart,
                  completeMessage,
                  from,
                  req,
                  ctx,
                  replyToMessageId,
                );
              }
            } catch (error) {
              console.error("Error parsing final buffer:", error);
            }
          }
        } catch (streamError) {
          console.error("Stream processing error:", streamError);
          if (!isStreamComplete) {
            throw streamError;
          }
        } finally {
          // Clear typing indicator interval and timeout
          if (typingIndicatorInterval) {
            clearInterval(typingIndicatorInterval);
            typingIndicatorInterval = null;
          }
          if (typingIndicatorTimeout) {
            clearTimeout(typingIndicatorTimeout);
            typingIndicatorTimeout = null;
          }

          // Send any remaining text in the buffer
          if (textBuffer) {
            lastMessageTime = Date.now();
            await sendTextMessage(
              {
                to: from,
                text: cleanMessage(textBuffer),
                replyToMessageId,
              },
              req,
              ctx,
            );
          }
        }

        return completeMessage;
      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${retries + 1} failed:`, error);
        retries++;

        if (retries < this.MAX_RETRIES) {
          console.log(`Retrying in ${this.RETRY_DELAY}ms...`);
          await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY));
        }
      }
    }

    throw lastError || new Error("Failed to process message after all retries");
  }
}

/**
 * Handles HTTP responses with consistent formatting
 */
class ResponseHandler {
  // deno-lint-ignore no-explicit-any
  static success(data: any = { success: true }): Response {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  static error(message: string, status: number = 400): Response {
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export interface Props extends WebhookPayload {
}

/**
 * @title WhatsApp Webhook
 * @description Webhook handler for receiving WhatsApp messages and status updates
 */
export default async function webhook(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Response> {
  if (req.method === "GET") {
    if (!props.hub) {
      return ResponseHandler.error("Missing hub parameters");
    }

    const { challenge } = props.hub;
    return new Response(challenge, { status: 200 });
  }

  if (req.method === "POST") {
    try {
      const payload: WebhookPayload = props;
      const message = payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

      if (!message) {
        return ResponseHandler.error("No message found");
      }

      // Check if we've already processed this message
      if (message.id && processedMessageIds.has(message.id)) {
        console.log(`Message ${message.id} already processed, skipping`);
        return ResponseHandler.success();
      }

      // Add message ID to processed set
      if (message.id) {
        processedMessageIds.add(message.id);
        // Clean up old message IDs after 5 minutes
        setTimeout(() => {
          processedMessageIds.delete(message.id);
        }, 5 * 60 * 1000);

        // Mark message as read
        await markMessageAsRead(message.id, ctx);
      }

      const mediaId = message.image?.id;

      if (mediaId) {
        const mediaUrlResponse = await ctx.api["GET /:media_id"]({
          media_id: mediaId,
        });

        const mediaData = await mediaUrlResponse.json();
        const contentResponse = await ctx.api["GET /:media_url"]({
          media_url: mediaData.url,
        });

        const mediaContent = await contentResponse.arrayBuffer();
        const mediaContentString = new TextDecoder().decode(mediaContent);
        console.log({ mediaContentString });
      }

      if (message.type === "text" && message.text) {
        const { from, text: { body: text }, id: messageId } = message;
        console.log("Text", text);
        console.log({ text });

        try {
          // Use the message queue to handle the message
          await MessageQueue.getInstance().enqueueMessage(from, {
            text,
            req,
            ctx,
            replyToMessageId: messageId, // Pass the message ID for contextual replies
          });
          return ResponseHandler.success();
        } catch (error) {
          console.error("Error processing message:", error);
          return ResponseHandler.error("Failed to process message", 500);
        }
      }

      return ResponseHandler.success();
    } catch (error) {
      console.error("Error processing webhook:", error);
      return ResponseHandler.error("Failed to process webhook", 500);
    }
  }

  return ResponseHandler.error("Method not allowed", 405);
}

/**
 * Handles different types of stream parts and updates the complete message accordingly
 * @param streamPart The parsed stream part to handle
 * @param currentMessage The current accumulated message
 * @param from The sender's phone number
 * @param req The request object
 * @param ctx The application context
 * @param originalMessageId The original message ID for contextual replies
 * @returns The updated message after processing the stream part
 */
async function handleStreamPart(
  streamPart: DataStreamPartType,
  currentMessage: string,
  from: string,
  _req: Request,
  ctx: AppContext,
  originalMessageId?: string,
): Promise<string> {
  switch (streamPart.type) {
    case "text":
      // Handled in sendMessage now
      return await Promise.resolve(currentMessage);
    case "error":
      console.error("Stream error:", streamPart.value);
      break;
    case "finish_message":
      console.log("Message finished:", streamPart.value);
      break;
    case "finish_step":
      console.log("Step finished:", streamPart.value);
      break;
    case "start_step":
      console.log("Step started:", streamPart.value);
      break;
    case "reasoning":
      console.log("Reasoning:", streamPart.value);
      break;
    case "tool_call":
      console.log("Tool call:", streamPart.value);
      if (
        streamPart.value.toolName === "RENDER" &&
        streamPart.value.args.mediaType === "image"
      ) {
        console.log("Detected RENDER tool call with image mediaType");
        try {
          // First, download the image from the URL
          const imageResponse = await fetch(streamPart.value.args.content);
          if (!imageResponse.ok) {
            throw new Error(
              `Failed to download image: ${imageResponse.statusText}`,
            );
          }
          const imageBlob = await imageResponse.blob();

          // Create FormData for the upload
          const formData = new FormData();
          formData.append("messaging_product", "whatsapp");
          formData.append("type", "image/png");
          formData.append(
            "file",
            new File([imageBlob], "image.png", { type: "image/png" }),
          );

          // Upload the image to WhatsApp using the API client
          console.log("Uploading image to WhatsApp...");
          const uploadResponse = await ctx.api["POST /:phone_number_id/media"]({
            phone_number_id: ctx.phoneNumberId,
          }, {
            body: formData,
          });

          if (!uploadResponse.ok) {
            const error = await uploadResponse.json();
            throw new Error(`Failed to upload image: ${JSON.stringify(error)}`);
          }

          const { id: mediaId } = await uploadResponse.json();
          console.log("Image uploaded successfully, media ID:", mediaId);

          // Send the image message using the media ID
          const messageResponse = await ctx.api
            ["POST /:phone_number_id/messages"]({
              phone_number_id: ctx.phoneNumberId,
            }, {
              body: {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: from,
                type: "image",
                image: {
                  id: mediaId,
                  caption: streamPart.value.args.title,
                },
                ...(originalMessageId
                  ? {
                    context: {
                      message_id: originalMessageId,
                    },
                  }
                  : {}),
              },
            });

          const result = await messageResponse.json();
          console.log("Image message sent successfully:", result);
          if (!messageResponse.ok) {
            console.error("Failed to send image message:", result);
          }
        } catch (error) {
          console.error("Error processing image message:", error);
        }
      }
      break;
    case "tool_result":
      console.log("Tool result:", streamPart.value);
      break;
    default:
      console.log("Unhandled stream part type:", streamPart.type);
  }
  return currentMessage;
}

/**
 * Cleans and formats a message by normalizing whitespace and punctuation
 * @param message The raw message to clean
 * @returns The cleaned and formatted message
 */
function cleanMessage(message: string): string {
  return message
    .replace(/\s+/g, " ") // Replace multiple spaces with a single space
    .replace(/\n\s*\n/g, "\n\n") // Normalize multiple newlines to max 2
    .replace(/\n\s+/g, "\n") // Remove spaces after newlines
    .replace(/\s+\n/g, "\n") // Remove spaces before newlines
    .replace(/\n{3,}/g, "\n\n") // Ensure max of 2 consecutive newlines
    .replace(/\s+([.,!?])/g, "$1") // Fix spacing before punctuation
    .replace(/([.,!?])\s+/g, "$1 ") // Fix spacing after punctuation
    .trim(); // Final trim
}

/**
 * Marks a message as read and shows typing indicator using the WhatsApp API
 * @param messageId The ID of the message to mark as read
 * @param ctx The application context
 */
async function markMessageAsRead(
  messageId: string,
  ctx: AppContext,
): Promise<void> {
  try {
    const response = await ctx.api["POST /:phone_number_id/messages"]({
      phone_number_id: ctx.phoneNumberId,
    }, {
      body: {
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
        typing_indicator: {
          type: "text",
        },
      },
    });

    if (!response.ok) {
      console.error("Failed to mark message as read:", await response.json());
    } else {
      console.log("Message marked as read and typing indicator shown");
    }
  } catch (error) {
    console.error("Error marking message as read:", error);
  }
}
