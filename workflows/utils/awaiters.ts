import { type WorkflowContext } from "deco/mod.ts";
import { type AppManifest } from "../mod.ts";
import { isEventStreamResponse } from "deco/utils/invoke.ts";

export const waitForWorkflowCompletion = <T extends AppManifest>(
  ctx: WorkflowContext<T>,
  id: string,
  timeoutMS?: number,
) =>
  ctx.callLocalActivity(async () => {
    const events = await (ctx as WorkflowContext<AppManifest>).state.invoke(
      "workflows/loaders/events.ts",
      { stream: true, id },
    );

    if (!isEventStreamResponse(events)) return;

    if (timeoutMS) {
      setTimeout(() => events.return?.(), timeoutMS);
    }

    for await (const _event of events);
  });
