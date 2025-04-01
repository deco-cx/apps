import type { AppContext } from "../../mod.ts";
import type { CreateHookParams, GrainHook } from "../../client.ts";

// Use the CreateHookParams interface directly for Props
export type Props = CreateHookParams;

/**
 * @name CreateHook
 * @title Create Webhook
 * @description Creates a new webhook (REST Hook) to receive notifications for events in a specific view.
 */
export default async function createHook(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<GrainHook> {
  return await ctx.grain.createHook(props);
}
