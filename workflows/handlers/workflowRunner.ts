import { Handler, Workflow, WorkflowContext } from "@deco/deco/blocks";
import { workflowHTTPHandler } from "@deco/durable";

export interface Config {
  workflow: Workflow;
}

export default function WorkflowHandler({ workflow }: Config): Handler {
  return (req: Request, conn: Deno.ServeHandlerInfo) => {
    if ("state" in conn) {
      const handler = workflowHTTPHandler(
        workflow,
        // deno-lint-ignore no-explicit-any
        (exec) => new WorkflowContext(conn.state as any, exec),
      );
      return handler(req, conn);
    }
    return new Response(null, { status: 501 });
  };
}
