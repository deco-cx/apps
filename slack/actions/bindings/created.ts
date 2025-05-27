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
  const c = await ctx.getConfiguration();
  await ctx.configure({ ...c, callbacks: props.callbacks });
}
