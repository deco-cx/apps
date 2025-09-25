import type { AppContext } from "../../mod.ts";
import type { SlackResponse } from "../../client.ts";

export interface Props {
  /**
   * @description The ID of the user to open a DM conversation with
   */
  userId: string;
}

/**
 * @name CONVERSATIONS_OPEN
 * @title Open DM Conversation
 * @description Opens a direct message conversation with a user
 */
export default async function openConversation(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<
  SlackResponse<{
    channel?: { id: string };
    no_op?: boolean;
    already_open?: boolean;
    warning?: string;
  }>
> {
  try {
    return await ctx.slack.openDmChannel(props.userId);
  } catch (error) {
    console.error("Error opening conversation:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: {},
    };
  }
}
