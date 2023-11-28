import { AppContext } from "../mod.ts";
import {
  MessageContentText,
} from "https://deno.land/x/openai@v4.19.1/resources/beta/threads/messages/messages.ts";

export interface Props {
  thread?: string;
}
const sleep = (ns: number) => new Promise((resolve) => setTimeout(resolve, ns));
export default async function openChat(
  _props: Props,
  req: Request,
  ctx: AppContext,
) {
    try {
  const openAI = ctx.openAI;
  const thread = await openAI.beta.threads.create();
  const { socket, response } = Deno.upgradeWebSocket(req);
  socket.onmessage = async (event) => {
    await openAI.beta.threads.messages.create(thread.id, {
      content: event.data,
      role: "user",
    });
    const run = await openAI.beta.threads.runs.create(thread.id, {
      assistant_id: await ctx.assistant.then((assistant) => assistant.id),
      instructions: ctx.instructions,
    });
    // Wait for the assistant answer
    let runStatus;
    do {
      runStatus = await openAI.beta.threads.runs.retrieve(
        thread.id,
        run.id,
      );
      await sleep(1000);
    } while (["in_progress", "queued"].includes(runStatus.status));

    const messages = await openAI.beta.threads.messages.list(thread.id);
    const lastMessageForRun = messages.data
      .filter((message) =>
        message.run_id == run.id && message.role === "assistant"
      )
      .pop();

    if (!lastMessageForRun) {
      return;
    }
    const txt = (lastMessageForRun.content[0] as MessageContentText).text.value;
    socket.send(txt);
  };
  return response;
} catch(err) {
    console.log(err,"Errr")
    throw err;
}
}
