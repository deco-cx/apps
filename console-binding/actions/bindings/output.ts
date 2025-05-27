import { OutputBindingProps } from "../../../mcp/bindings.ts";
import { AppContext } from "../../mod.ts";

/**
 * @name ON_AGENT_OUTPUT
 * @title On Agent Output
 * @description This action is triggered when the agent sends a message
 */
export default function output(
  props: OutputBindingProps,
  req: Request,
  ctx: AppContext,
) {
  return ctx.handle(req, ctx)(props);
}
