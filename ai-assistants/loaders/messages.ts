import { ReplyMessage } from "../actions/chat.ts";
import { AppContext } from "../mod.ts";
import { MessageContentImageFile, MessageContentText } from "../deps.ts";
export interface Props {
  thread: string;
  after?: string;
  before?: string;
}

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
  return messages.data.map((message) => {
    message.content;
    return {
      messageId: message.run_id!,
      type: "message",
      content: message.content.map((cnt) =>
        isFileContent(cnt)
          ? { type: "file", fileId: cnt.image_file.file_id! }
          : { type: "text", value: cnt.text!.value }
      ),
      role: message.role,
    };
  });
}
