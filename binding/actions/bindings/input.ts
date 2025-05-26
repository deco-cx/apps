import { AppContext } from "../../mod.ts";
import { InputBindingProps } from "../../utils.ts";

/**
 * @name ON_AGENT_INPUT
 * @title On Agent Input
 * @description This action is triggered when the agent receives a message
 */
export default function input(
  props: InputBindingProps,
  _req: Request,
  ctx: AppContext,
) {
  return ctx.handle(ctx)(props);
}
