import { OutputBindingProps } from "../../../mcp/bindings.ts";
import { AppContext } from "../../mod.ts";

/**
 * @name ON_AGENT_OUTPUT
 * @title On Agent Output
 * @description Esta ação é acionada quando o agente envia uma mensagem e a encaminha para o Slack
 */
export default function output(
  props: OutputBindingProps,
  req: Request,
  ctx: AppContext,
) {
  return ctx.handle(req, ctx)(props);
} 