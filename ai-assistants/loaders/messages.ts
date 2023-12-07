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

const normalize = (strContent: string) => {
  return strContent.endsWith("@") || strContent.endsWith("#")
    ? strContent.slice(0, strContent.length - 2)
    : strContent;
};

export const threadMessageToReply = (message: ThreadMessage): ReplyMessage => {
  return {
    messageId: message.run_id!,
    type: "message",
    content: message.content.map((cnt) =>
      isFileContent(cnt)
        ? { type: "file", fileId: cnt.image_file.file_id! }
        : { type: "text", value: normalize(cnt.text!.value) }
    ),
    role: message.role,
  };
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
