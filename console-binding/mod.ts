import { FnContext } from "@deco/deco";
import {
  InputBindingProps,
  OutputBindingProps,
  processStream,
} from "../mcp/bindings.ts";
import { McpContext } from "../mcp/context.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export interface Payload {
  message: string;
}
export type BindingHandler = (
  input: InputBindingProps<Payload> | OutputBindingProps,
) => Promise<void>;

export interface State {
  handle: <TCtx extends AppContext>(req: Request, ctx: TCtx) => BindingHandler;
}
// deno-lint-ignore no-empty-interface
export interface Props {}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

/**
 * @name CONSOLE_LOG_BINDING
 */
export default function App() {
  return {
    state: {
      handle: (_req: Request, _ctx: AppContext) =>
        processStream<Payload>({
          mapPayloadToOptions: (payload) => {
            return {
              messages: [{
                id: crypto.randomUUID(),
                role: "user",
                content: `The user is saying: ${payload.message}`,
              }],
              options: {},
            };
          },
          onTextPart: (part) => {
            console.log("text part", part);
          },
          onDataPart: (part) => {
            console.log("data part", part);
          },
          onFilePart: (part) => {
            console.log("file part", part);
          },
          onSourcePart: (part) => {
            console.log("source part", part);
          },
          onErrorPart: (part) => {
            console.log("error part", part);
          },
          onToolCallStreamingStartPart: (part) => {
            console.log("tool call streaming start part", part);
          },
          onToolCallDeltaPart: (part) => {
            console.log("tool call delta part", part);
          },
          onFinishMessagePart: (part) => {
            console.log("finish message part", part);
          },
          onReasoningPart: (part) => {
            console.log("reasoning part", part);
          },
          onToolCallPart: (part) => {
            console.log("tool call part", part);
          },
          onToolResultPart: (part) => {
            console.log("tool result part", part);
          },
          onMessageAnnotationsPart: (part) => {
            console.log("message annotations part", part);
          },
          onFinishStepPart: (part) => {
            console.log("finish step part", part);
          },
          onStartStepPart: (part) => {
            console.log("start step part", part);
          },
          onReasoningSignaturePart: (part) => {
            console.log("reasoning signature part", part);
          },
          onRedactedReasoningPart: (part) => {
            console.log("redacted reasoning part", part);
          },
        }),
    },
    manifest,
    dependencies: [],
  };
}
