// deno-lint-ignore-file no-explicit-any
import {
  type AsyncIterableStream,
  DefaultChatTransport,
  readUIMessageStream,
  UIMessage,
} from "npm:ai@5.0.70";

/**
 * Helper class to expose protected processResponseStream method
 * from DefaultChatTransport for parsing SSE streams
 */
class ChatStreamParser extends DefaultChatTransport<UIMessage> {
  public parseStream(stream: ReadableStream<Uint8Array>) {
    return this.processResponseStream(stream);
  }
}
export interface Callbacks {
  stream: string;
  generate: string;
  generateObject: string;
}

export interface JoinChannelProps {
  workspace: string;
  agentName: string;
  agentLink: string;
  discriminator: string;
  callbacks: Callbacks;
}

export interface LeaveChannelProps {
  workspace: string;
  discriminator: string;
}

export interface OnEventReceivedProps<TPayload = any> {
  callbacks: Callbacks;
  payload: TPayload;
  headers: Record<string, string>;
  url: string;
}

export interface OutputChannelProps<
  TMetadata extends Record<string, unknown> = Record<string, unknown>,
> {
  callbacks: Callbacks;
  metadata?: TMetadata;
  threadId: string;
  resourceId: string;
}

export interface ListChannelsProps {
  workspace: string;
}

export interface ChannelItem {
  label: string;
  value: string;
}

export interface ListChannelsResponse {
  channels: ChannelItem[];
}

export interface StreamOptions<
  TMetadata extends Record<string, unknown> = Record<string, unknown>,
> {
  messages: UIMessage[];
  metadata?: TMetadata;
  threadId?: string;
  resourceId?: string;
}

/**
 * Process a stream from an AI SDK v5 endpoint that returns toUIMessageStreamResponse()
 * @returns An async iterable stream of UIMessage objects that can be consumed directly
 */
export const processStream = async <
  TMetadata extends Record<string, unknown> = Record<string, unknown>,
>(
  streamEndpoint: string,
  options?: StreamOptions<TMetadata>,
): Promise<AsyncIterableStream<UIMessage>> => {
  const response = await fetch(streamEndpoint, {
    method: "POST",
    body: options
      ? JSON.stringify({
        args: [options.messages, options.metadata, {
          threadId: options.threadId,
          resourceId: options.resourceId,
        }],
      })
      : undefined,
    headers: options
      ? {
        "Content-Type": "application/json",
      }
      : undefined,
  });

  console.log("processStream response status:", response.status);
  console.log("processStream response headers:", response.headers);

  if (!response.body) {
    throw new Error("Stream body is null");
  }

  // Use DefaultChatTransport to parse SSE stream from toUIMessageStreamResponse()
  // This handles the SSE decoding and transforms it into UIMessageChunks
  const parser = new ChatStreamParser();
  const chunkStream = parser.parseStream(response.body);

  console.log("chunkStream created, type:", typeof chunkStream);

  // Read UIMessages from the parsed chunk stream
  // https://ai-sdk.dev/docs/ai-sdk-ui/reading-ui-message-streams
  const uiMessageStream = readUIMessageStream({
    stream: chunkStream,
    onError: (error) => {
      console.error("readUIMessageStream error:", error);
    },
  });

  console.log("uiMessageStream created, type:", typeof uiMessageStream);
  console.log(
    "uiMessageStream has Symbol.asyncIterator:",
    Symbol.asyncIterator in uiMessageStream,
  );

  return uiMessageStream;
};
