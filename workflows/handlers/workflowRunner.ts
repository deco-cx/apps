import { HandlerContext } from "$fresh/server.ts";
import { Handler, Workflow, WorkflowContext } from "@deco/deco/blocks";
import { workflowHTTPHandler } from "@deco/durable";

import { AppManifest, DecoSiteState, DecoState } from "@deco/deco";
export interface Config {
  workflow: Workflow;
}

export default function WorkflowHandler({ workflow }: Config): Handler {
  return (req: Request, conn: Deno.ServeHandlerInfo) => {
    const ctx = conn as unknown as HandlerContext<
      unknown,
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
