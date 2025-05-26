// deno-lint-ignore-file no-explicit-any
import type { FnContext } from "@deco/deco";
import { McpContext } from "../mcp/context.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import {
  HandleStreamParameters,
  InputBindingProps,
  OutputBindingProps,
  processStream,
} from "./utils.ts";

export interface Props<TPayload = any> {
  handlers:
    | HandleStreamParameters<TPayload>
    | (<TCtx extends AppContext>(
      ctx: TCtx,
    ) => HandleStreamParameters<TPayload>);
}

export type BindingHandler<TPayload = any> = (
  input: InputBindingProps<TPayload> | OutputBindingProps,
) => Promise<void>;

export interface State {
  handle: <TCtx extends AppContext>(ctx: TCtx) => BindingHandler;
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

/**
 * @name BINDINGS
 * @description Bindings base app
 */
export default function App<TPayload = any>(
  props: Props<TPayload>,
) {
  const handlers = props.handlers;
  return {
    state: {
      handle: typeof handlers === "function"
        ? (ctx: AppContext) => processStream(handlers(ctx))
        : () => processStream(handlers),
    },
    manifest,
  };
}
