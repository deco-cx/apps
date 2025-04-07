import type { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description The ID of the webhook to delete.
   */
  id: string;
}

/**
 * @name DeleteHook
 * @title Delete Webhook
 * @description Deletes an existing webhook (REST Hook) by its ID.
 */
export default async function deleteHook(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean }> {
  return await ctx.grain.deleteHook(props.id);
}
