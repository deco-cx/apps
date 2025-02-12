import { type AppManifest } from "../mod.ts";
import { type WorkflowContext } from "@deco/deco/blocks";
import { isEventStreamResponse } from "@deco/deco/web";
export const waitForWorkflowCompletion = <T extends AppManifest>(
  ctx: WorkflowContext<T>,
  id: string,
  timeoutMS?: number,
) =>
  ctx.callLocalActivity(async () => {
    const events = await (ctx as unknown as WorkflowContext<AppManifest>).state
      .invoke("workflows/loaders/events.ts", { stream: true, id });
    if (!isEventStreamResponse(events)) {
      return;
    }
    if (timeoutMS) {
      setTimeout(() => events.return?.(), timeoutMS);
    }
    for await (const _event of events);
  });
