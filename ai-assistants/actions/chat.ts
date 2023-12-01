import { AppContext } from "../mod.ts";

import { notFound } from "deco/mod.ts";
import { messageProcessorFor } from "../chat/messages.ts";
import { Notify, Queue } from "../deps.ts";

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
    const message = await Promise.race([
      abort.notified(),
      q.pop({ signal: AbortSignal.timeout(10000000) }),
    ]);
    if (typeof message !== "object") {
      break;
    }
    await Promise.race([
      processor(message),
    ]);
  }
};
export interface ReplyMessage {
  type: "message";
  content: string;
}

export interface FunctionCallReply<T> {
  name: string
  props: unknown
  response:T
}

export interface ReplyFunctionCalls<T> {
  type: "function_calls";
  content: FunctionCallReply<T>[];
}

export type Reply<T> = ReplyMessage | ReplyFunctionCalls<T>;

export interface ChatMessage {
  text: string;
  reply: <T = unknown>(reply: Reply<T>) => void;
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
    assistant.then((aiAssistant) => {
      socket.send(aiAssistant.welcomeMessage ?? "Welcome to the chat!");
    });
  };
  socket.onclose = () => {
    abort.notifyAll();
  };
  socket.onmessage = (event) => {
    messagesQ.push({
      text: event.data,
      reply: (replyMsg) => socket.send(JSON.stringify(replyMsg)),
    });
  };
  return response;
}
