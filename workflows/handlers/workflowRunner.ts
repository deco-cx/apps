import { type Handler, Workflow, WorkflowContext } from "@deco/deco/blocks";
import { workflowHTTPHandler } from "@deco/durable";
import {
  type AppManifest,
  type DecoSiteState,
  type DecoState,
} from "@deco/deco";

/** Context with state for workflow handlers */
interface ContextWithState<State = unknown> {
  state: State;
}

export interface Config {
  workflow: Workflow;
}
export default function WorkflowHandler({ workflow }: Config): Handler {
  return (req: Request, conn: Deno.ServeHandlerInfo) => {
    const ctx = conn as unknown as ContextWithState<
      DecoState<unknown, DecoSiteState, AppManifest>
    >;
    if (ctx?.state) {
      const handler = workflowHTTPHandler(
        workflow,
        (exec) => new WorkflowContext(ctx.state, exec),
      );
      return handler(req, conn);
    }
    return new Response(null, { status: 501 });
  };
}
