import { HandlerContext } from "$fresh/server.ts";
import { Handler } from "deco/blocks/handler.ts";
import { Workflow, WorkflowContext } from "deco/blocks/workflow.ts";
import { workflowHTTPHandler } from "deco/deps.ts";
import { AppManifest, DecoSiteState, DecoState } from "deco/mod.ts";
import { ConnInfo } from "std/http/server.ts";
export interface Config {
  workflow: Workflow;
}

export default function WorkflowHandler({ workflow }: Config): Handler {
  return (req: Request, conn: ConnInfo) => {
    const ctx = conn as HandlerContext<
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
