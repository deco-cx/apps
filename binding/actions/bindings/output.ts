import { AppContext } from "../../mod.ts";
import { OutputBindingProps } from "../../utils.ts";

/**
 * @name ON_AGENT_OUTPUT
 * @title On Agent Output
 * @description This action is triggered when the agent sends a message
 */
export default function output(
  props: OutputBindingProps,
  _req: Request,
  ctx: AppContext,
) {
  return ctx.handle(ctx)(props);
}
