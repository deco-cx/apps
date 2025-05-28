import { OnCreatedBindingProps } from "../../../mcp/bindings.ts";
import type { AppContext } from "../../mod.ts";

/**
 * @name ON_BINDING_CREATED
 * @description This action is triggered when slack binding is created
 */
export default async function created(
  props: OnCreatedBindingProps,
  _req: Request,
  ctx: AppContext,
) {
  console.log("created", props, ctx.teamId, ctx.installId, _req.url);
  if (ctx.appStorage && ctx.teamId) {
    console.log("setting item");
    await ctx.appStorage.setItem(ctx.teamId, {
      installId: ctx.installId,
      ...props,
    });
    console.log(await ctx.appStorage.getItem(ctx.teamId));
  }
}
