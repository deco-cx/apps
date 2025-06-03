import { OutputChannelProps } from "../../../mcp/bindings.ts";
import { AppContext, Metadata } from "../../mod.ts";

/**
 * @name ON_AGENT_OUTPUT
 * @title On Discord Output
 * @description This action is triggered to send a message to Discord
 */
export default function output(
  props: OutputChannelProps<Metadata>,
  req: Request,
  ctx: AppContext,
) {
  return ctx.handle(props, req, ctx);
}
