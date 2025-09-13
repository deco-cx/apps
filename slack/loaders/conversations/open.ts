import type { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description The ID of the user to open a DM conversation with
   */
  userId: string;
}

export interface ConversationOpenResponse {
  ok: boolean;
  no_op?: boolean;
  already_open?: boolean;
  channel?: {
    id: string;
  };
  warning?: string;
  response_metadata?: {
    warnings?: string[];
  };
  error?: string;
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
): Promise<ConversationOpenResponse> {
  try {
    const response = await ctx.slack.openDmChannel(props.userId);

    return {
      ok: response.ok,
      no_op: response.no_op,
      already_open: response.already_open,
      channel: response.channel,
      warning: response.warning,
      response_metadata: response.response_metadata,
      error: response.error,
    };
  } catch (error) {
    console.error("Error opening conversation:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}