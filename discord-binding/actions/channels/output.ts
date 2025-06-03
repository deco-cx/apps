import { OutputChannelProps } from "../../../mcp/bindings.ts";
import { AppContext, Metadata } from "../../mod.ts";

/**
 * @name ON_CHANNEL_OUTPUT
 * @title On Discord Channel Output
 * @description This action is triggered to send a message to Discord
 */
export default function output(
  props: OutputChannelProps<Metadata>,
  req: Request,
  ctx: AppContext,
) {
  return ctx.handle(props, req, ctx);
}
