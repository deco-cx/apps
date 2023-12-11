import { AppContext } from "../mod.ts";

import { notFound } from "deco/mod.ts";
import { messageProcessorFor } from "../chat/messages.ts";
import { Notify, Queue } from "../deps.ts";

export interface Props {
  thread?: string;
  assistant: string;
}

/**
 * Processes messages from the message queue.
 * @param {Queue<ChatMessage>} q - The message queue.
 * @param {Notify} abort - The notification object for aborting the message processing.
 * @param {(c: ChatMessage) => Promise<void>} processor - The function for processing each message.
 * @returns {Promise<void>} - A promise representing the completion of the message processing.
 */
const process = async (
  q: Queue<ChatMessage>,
  abort: Notify,
  processor: (c: ChatMessage) => Promise<void>,
) => {
  while (true) {
    const message = await Promise.race([
      abort.notified(),
      q.pop(),
    ]);
    if (typeof message !== "object") {
      break;
    }
    await Promise.race([
      processor(message),
    ]);
  }
};

export interface MessageContentText {
  type: "text";
  value: string;
}

export interface MessageContentFile {
  type: "file";
  fileId: string;
}

export interface ReplyMessage {
  messageId: string;
  type: "message";
  content: Array<MessageContentText | MessageContentFile>;
  role: "user" | "assistant";
}

export interface FunctionCall {
  name: string;
  props: unknown;
}

export interface FunctionCallReply<T> extends FunctionCall {
  response: T;
}

export interface ReplyStartFunctionCall {
  messageId: string;
  type: "start_function_call";
  content: FunctionCall;
}
export interface ReplyFunctionCalls<T> {
  messageId: string;
  type: "function_calls";
  content: FunctionCallReply<T>[];
}

export type Reply<T> =
  | ReplyMessage
  | ReplyFunctionCalls<T>
  | ReplyStartFunctionCall;

export interface ChatMessage {
  text: string;
  reply: <T = unknown>(reply: Reply<T>) => void;
}

/**
 * Initializes a WebSocket chat connection and processes incoming messages.
 * @param {Props} props - The properties for the chat session.
 * @param {Request} req - The HTTP request object containing the WebSocket connection.
 * @param {AppContext} ctx - The application context.
 * @returns {Response} - The HTTP response object.
 */
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
    messageProcessorFor(aiAssistant, ctx, props.thread)
  );
  const messagesQ = new Queue<ChatMessage>();

  /**
   * Handles the WebSocket connection on open event.
   */
  socket.onopen = async () => {
    process(
      messagesQ,
      abort,
      await processorPromise.catch((err) => {
        socket.send(
          `An error was suddently ocurred when message processor was created. ${err}`,
        );
        socket.close();
        abort.notifyAll();
        throw err;
      }),
    );
    assistant.then((aiAssistant) => {
      socket.send(aiAssistant.welcomeMessage ?? "Welcome to the chat!");
    });
  };
  /**
   * Handles the WebSocket connection on close event.
   */
  socket.onclose = () => {
    abort.notifyAll();
  };

  /**
   * Handles the WebSocket connection on message event.
   * @param {MessageEvent} event - The WebSocket message event.
   */
  socket.onmessage = (event) => {
    messagesQ.push({
      text: event.data,
      reply: (replyMsg) => socket.send(JSON.stringify(replyMsg)),
    });
  };
  return response;
}
