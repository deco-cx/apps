import { AppContext } from "../mod.ts";

import { badRequest, notFound } from "deco/mod.ts";
import { messageProcessorFor } from "../chat/messages.ts";
import { Notify, Queue } from "../deps.ts";

export interface Props {
  thread?: string;
  assistant: string;
  message?: string;
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
  options?: string[];
}

export interface MessageContentFile {
  type: "file";
  fileId: string;
}

export interface ReplyMessage {
  threadId: string;
  messageId: string;
  type: "message" | "error";
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
  threadId: string;
  messageId: string;
  type: "start_function_call";
  content: FunctionCall;
}
export interface ReplyFunctionCalls<T> {
  threadId: string;
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
export default async function openChat(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Response | { replies: Reply<unknown>[]; thread: string }> {
  if (!props.assistant) {
    notFound();
  }
  const assistant = ctx.assistants[props.assistant];
  if (!assistant) {
    notFound();
  }

  const threads = ctx.openAI.beta.threads;
  const threadId = props.thread;
  const threadPromise = threadId
    ? threads.retrieve(threadId)
    : threads.create();

  const processorPromise = assistant.then(async (aiAssistant) =>
    messageProcessorFor(aiAssistant, ctx, await threadPromise)
  );
  if (req.headers.get("upgrade") !== "websocket") {
    if (!props.message) {
      badRequest({ message: "message is required when websocket is not used" });
    }
    const processor = await processorPromise;
    const replies: Reply<unknown>[] = [];
    await processor({
      text: props.message!,
      reply: (reply) => replies.push(reply),
    });
    return { replies, thread: (await threadPromise).id };
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  const abort = new Notify();
  const messagesQ = new Queue<ChatMessage>();
  if (props.message) {
    messagesQ.push({
      text: props.message,
      reply: (replyMsg) => socket.send(JSON.stringify(replyMsg)),
    });
  }

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
      socket.send(
        JSON.stringify({
          isWelcomeMessage: true,
          threadId: aiAssistant.threadId,
          assistantId: aiAssistant.id,
          type: "message",
          content: [{
            type: "text",
            value: aiAssistant.welcomeMessage ?? "Welcome to the chat!",
          }],
          role: "assistant",
        }),
      );
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
