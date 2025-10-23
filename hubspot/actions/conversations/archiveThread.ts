import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface Props {
  /**
   * @title Thread ID
   * @description The ID of the conversation thread to archive
   */
  threadId: string;
}

/**
 * @title Archive Thread
 * @description Archives a single thread. The thread will be permanently deleted 30 days after placed in an archived state.
 */
export default async function archiveThread(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> {
  const { threadId } = props;

  const client = new HubSpotClient(ctx);

  await client.delete(
    `/conversations/v3/conversations/threads/${threadId}`,
  );
}
