// deno-lint-ignore-file no-explicit-any
import { processDataStream } from "npm:@ai-sdk/ui-utils@1.2.11";
import { Message } from "npm:ai@4.3.16";

export type ProcessDataStreamParameters = Omit<
  Parameters<typeof processDataStream>[0],
  "stream"
>;
export interface Callbacks {
  stream: string;
  generate: string;
  generateObject: string;
}

export interface InputBindingProps<TPayload = any> {
  callbacks: Callbacks;
  payload: TPayload;
  headers: Record<string, string>;
  url: string;
}

export interface OutputBindingProps<
  TMetadata extends Record<string, unknown> = Record<string, unknown>,
> {
  callbacks: Callbacks;
  metadata?: TMetadata;
  threadId: string;
  resourceId: string;
}
export interface StreamOptions<
  TMetadata extends Record<string, unknown> = Record<string, unknown>,
> {
  messages: Message[];
  options: {
    threadId?: string;
    resourceId?: string;
    metadata?: TMetadata;
  };
}

export interface HandleStreamParameters<
  TMetadata extends Record<string, unknown> = Record<string, unknown>,
> extends ProcessDataStreamParameters {
  streamProps?: StreamOptions<TMetadata>;
}
export const processStream = async <
  TMetadata extends Record<string, unknown> = Record<string, unknown>,
>(
  { streamProps, ...rest }: HandleStreamParameters<TMetadata>,
  props: InputBindingProps | OutputBindingProps<TMetadata>,
) => {
  const streamEndpoint = props.callbacks.stream;

  const stream = await fetch(streamEndpoint, {
    method: "POST",
    body: streamProps
      ? JSON.stringify({
        args: [streamProps.messages, streamProps.options],
      })
      : undefined,
    headers: streamProps
      ? {
        "Content-Type": "application/json",
      }
      : undefined,
  });

  if (!stream.body) {
    throw new Error("Stream body is null");
  }
  await processDataStream({
    stream: stream.body,
    ...rest,
  });
};
