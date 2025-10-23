import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Thread ID
   * @description ID da thread para sair
   */
  threadId: string;
}

/**
 * @title Leave Thread
 * @description Leave a thread with the bot using Bot Token
 */
export default async function leaveThread(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> {
  const { threadId } = props;
  const { client } = ctx;

  if (!threadId) {
    throw new Error("Thread ID is required");
  }

  // Leave thread
  const response = await client
    ["DELETE /channels/:channel_id/thread-members/@me"]({
      channel_id: threadId,
    });

  if (!response.ok) {
    throw new Error(`Failed to leave thread: ${response.statusText}`);
  }
}
