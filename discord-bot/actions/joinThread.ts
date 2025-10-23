import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Thread ID
   * @description ID da thread para entrar
   */
  threadId: string;
}

/**
 * @title Join Thread
 * @description Join a thread with the bot using Bot Token
 */
export default async function joinThread(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> {
  const { threadId } = props;
  const { client } = ctx;

  if (!threadId) {
    throw new Error("Thread ID is required");
  }

  // Join thread
  const response = await client["PUT /channels/:channel_id/thread-members/@me"](
    {
      channel_id: threadId,
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to join thread: ${response.statusText}`);
  }
}
