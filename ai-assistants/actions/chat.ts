import { AppContext } from "../mod.ts";

import { notFound } from "deco/mod.ts";
import { messageProcessorFor } from "../chat/messages.ts";
import { Notify, Queue } from "../deps.ts";

export interface AIAssistant {
  instructions: string;
  name: string;
}

export interface Props {
  thread?: string;
  assistant: string;
}

const process = async (
  q: Queue<ChatMessage>,
  abort: Notify,
  processor: (c: ChatMessage) => Promise<void>,
) => {
  while (true) {
    const message = await Promise.race([abort.notified(), q.pop()]);
    if (typeof message !== "object") {
      break;
    }
    await Promise.race([
      processor(message),
      abort.notified({ signal: AbortSignal.timeout(60_000) }),
    ]);
  }
};
export interface ChatMessage {
  text: string;
  reply: (txt: string) => void;
}
export default function openChat(
  props: Props,
  req: Request,
  ctx: AppContext,
) {
  if (!props.assistant) {
    notFound();
  }
  const assistant = ctx.assistants[props.assistant];
  if (!assistant) {
    notFound();
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  const abort = new Notify();
  const processorPromise = assistant.then((aiAssistant) =>
    messageProcessorFor(aiAssistant, ctx)
  );
  const messagesQ = new Queue<ChatMessage>();

  socket.onopen = async () => {
    process(
      messagesQ,
      abort,
      await processorPromise.catch((err) => {
        socket.send(
          `An error was suddently ocurred when message processor was created. ${err}`,
        );
        abort.notifyAll();
        throw err;
      }),
    );
  };
  socket.onclose = () => {
    abort.notifyAll();
  };
  socket.onmessage = (event) => {
    messagesQ.push({ text: event.data, reply: socket.send.bind(socket) });
  };
  return response;
}
