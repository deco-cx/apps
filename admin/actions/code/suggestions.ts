import { AppContext } from "../../mod.ts";
import { Reply } from "../../../ai-assistants/actions/chat.ts";

interface Props {
  prompt: string;
  currentCode: string;
}

export default async function action(
  { currentCode, prompt }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Response | { replies: Reply<unknown>[]; thread: string }> {
  return await ctx.invoke("ai-assistants/actions/chat.ts", {
    assistant: "code-assistant",
    message:
      `The user asks: ${prompt}. \n\nThe current the user is prompting upon is: ${currentCode}`,
  });
}
