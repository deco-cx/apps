import { InputBindingProps } from "../../../mcp/bindings.ts";
import { AppContext, Payload } from "../../mod.ts";

/**
 * @name ON_AGENT_INPUT
 * @title On Agent Input
 * @description Esta ação é acionada quando o agente recebe uma mensagem e a envia para o Slack
 */
export default function input(
  props: InputBindingProps<Payload>,
  req: Request,
  ctx: AppContext,
) {
  return ctx.handle(req, ctx)(props);
} 