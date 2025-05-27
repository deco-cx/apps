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

export interface OutputBindingProps {
  callbacks: Callbacks;
}
export interface StreamOptions {
  messages: Message[];
  options: {
    threadId?: string;
    resourceId?: string;
  };
}

export interface HandleStreamParameters<TPayload = any>
  extends ProcessDataStreamParameters {
  mapPayloadToOptions: (payload: TPayload) => StreamOptions;
}
export const processStream = <TPayload = any>(
  { mapPayloadToOptions, ...rest }: HandleStreamParameters<TPayload>,
) => {
  return async (props: InputBindingProps<TPayload> | OutputBindingProps) => {
    const streamProps = "payload" in props
      ? mapPayloadToOptions(props.payload)
      : undefined;
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
};
