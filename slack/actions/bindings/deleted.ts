import { OnDeletedBindingProps } from "../../../mcp/bindings.ts";
import type { AppContext } from "../../mod.ts";

/**
 * @name ON_BINDING_DELETED
 * @description This action is triggered when slack binding is deleted
 */
export default async function deleted(
  _props: OnDeletedBindingProps,
  _req: Request,
  ctx: AppContext,
) {
  if (ctx.appStorage && ctx.teamId) {
    await ctx.appStorage.removeItem(ctx.teamId);
  }
}
