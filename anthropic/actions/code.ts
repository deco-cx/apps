import { shortcircuit } from "deco/engine/errors.ts";
import { AppContext } from "../mod.ts";
import { Anthropic } from "../deps.ts";
export interface Props {
  system?: string;
  messages: Anthropic.MessageParam[];
}

export default async function chat(
  { system, messages }: Props,
  _req: Request,
  ctx: AppContext,
) {
  if (!messages) {
    return shortcircuit(new Response("No messages provided", { status: 400 }));
  }

  const msg = await ctx.anthropic.messages.create({
    system,
    model: "claude-3-opus-20240229",
    max_tokens: 4096,
    messages,
  });

  return msg;
}
