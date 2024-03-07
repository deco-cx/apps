import { ReplyMessage } from "../actions/chat.ts";
import {
  MessageContentImageFile,
  MessageContentText,
  ThreadMessage,
} from "../deps.ts";
import { AppContext } from "../mod.ts";
export interface Props {
  thread: string;
  after?: string;
  before?: string;
}

export const Tokens = {
  POSITIVE: "@",
  NEGATIVE: "#",
  OPTIONS: "&&&",
};

const normalize = (strContent: string) => {
  const hasOptions = strContent.includes(Tokens.OPTIONS);

  if (!hasOptions) {
    return strContent.endsWith(Tokens.POSITIVE) ||
        strContent.endsWith(Tokens.NEGATIVE)
      ? strContent.slice(0, strContent.length - 2)
      : strContent;
  }

  return strContent.split(Tokens.OPTIONS)[0];
};

export const getToken = (message: ThreadMessage): string => {
  const text = (message.content[0] as MessageContentText).text?.value;
  if (!text) {
    return Tokens.NEGATIVE;
  }
  return text.endsWith(Tokens.POSITIVE) ? Tokens.POSITIVE : Tokens.NEGATIVE;
};

export const threadMessageToReply = (message: ThreadMessage): ReplyMessage => {
  return {
    threadId: message.thread_id!,
    messageId: message.run_id!,
    type: "message",
    content: message.content.map((cnt) =>
      isFileContent(cnt) ? { type: "file", fileId: cnt.image_file.file_id! } : {
        type: "text",
        value: normalize(cnt.text!.value),
        options: getOptions(cnt),
      }
    ),
    role: message.role,
  };
};

// Function to for the token OPTIONS in the message content and get everything after it to get the options.
// If your response contains options for the user to choose from, make sure to include the ${Tokens.OPTIONS} symbol in your response, followed by the options separated by commas, followed by another ${Tokens.OPTIONS} symbol.
const getOptions = (content: MessageContentText): string[] => {
  const text = content.text?.value;

  if (!text) {
    return [];
  }
  const options = text.split(Tokens.OPTIONS)[1];

  if (!options) {
    return [];
  }

  return options.split(",").map((option) => option.trim());
};

const isFileContent = (
  v: MessageContentImageFile | MessageContentText,
): v is MessageContentImageFile => {
  return (v as MessageContentImageFile)?.image_file?.file_id !== undefined;
};

export default async function messages(
  { thread, after, before }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ReplyMessage[]> {
  const messages = await ctx.openAI.beta.threads.messages.list(thread, {
    after,
    before,
  });
  return messages.data.map(threadMessageToReply);
}
