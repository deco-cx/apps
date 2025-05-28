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
  const config = await ctx.getConfiguration(ctx.installId);
  const teamId = ctx.teamId ?? config.teamId;
  console.log("created", props, teamId, ctx.installId, _req.url);
  if (ctx.appStorage && teamId) {
    console.log("setting item");
    await ctx.appStorage.setItem(teamId, {
      installId: ctx.installId,
      ...props,
    });
  }
}
