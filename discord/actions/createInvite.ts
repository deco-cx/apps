import type { AppContext } from "../mod.ts";
import { DiscordInvite } from "../utils/types.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description ID of the channel to create invite for
   */
  channelId: string;

  /**
   * @title Max Age
   * @description Duration of invite in seconds before expiry (0 = never, default: 86400 = 24 hours)
   */
  maxAge?: number;

  /**
   * @title Max Uses
   * @description Max number of uses (0 = unlimited, default: 0)
   */
  maxUses?: number;

  /**
   * @title Temporary
   * @description Whether this invite grants temporary membership
   * @default false
   */
  temporary?: boolean;

  /**
   * @title Unique
   * @description Whether this invite should be unique (don't try to reuse similar invites)
   * @default false
   */
  unique?: boolean;

  /**
   * @title Target Type
   * @description Type of target for this voice channel invite (1 = stream, 2 = embedded application)
   */
  targetType?: 1 | 2;

  /**
   * @title Target User ID
   * @description ID of the user whose stream to display for this invite (required if target_type is 1)
   */
  targetUserId?: string;

  /**
   * @title Target Application ID
   * @description ID of the embedded application to open for this invite (required if target_type is 2)
   */
  targetApplicationId?: string;

  /**
   * @title Reason
   * @description Reason for creating the invite (will be shown in audit log)
   */
  reason?: string;
}

/**
 * @title Create Invite
 * @description Create an instant invite for a Discord channel (requires Create Instant Invite permission)
 */
export default async function createInvite(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordInvite> {
  const {
    channelId,
    maxAge = 86400,
    maxUses = 0,
    temporary = false,
    unique = false,
    targetType,
    targetUserId,
    targetApplicationId,
    reason,
  } = props;
  const { client } = ctx;

  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  // Validate max age (0 to 604800 seconds = 7 days)
  if (maxAge < 0 || maxAge > 604800) {
    throw new Error("Max age must be between 0 and 604800 seconds (7 days)");
  }

  // Validate max uses (0 to 100)
  if (maxUses < 0 || maxUses > 100) {
    throw new Error("Max uses must be between 0 and 100");
  }

  // Validate target type dependencies
  if (targetType === 1 && !targetUserId) {
    throw new Error("Target user ID is required when target type is 1 (stream)");
  }

  if (targetType === 2 && !targetApplicationId) {
    throw new Error("Target application ID is required when target type is 2 (application)");
  }

  // Build request body
  const body: any = {
    max_age: maxAge,
    max_uses: maxUses,
    temporary,
    unique,
  };

  if (targetType !== undefined) {
    body.target_type = targetType;
  }

  if (targetUserId) {
    body.target_user_id = targetUserId;
  }

  if (targetApplicationId) {
    body.target_application_id = targetApplicationId;
  }

  if (reason) {
    body.reason = reason;
  }

  // Create invite
  const response = await client["POST /channels/:channel_id/invites"]({
    channel_id: channelId,
  }, body);

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to create invite: ${response.statusText}`,
    );
  }

  const invite = await response.json();
  return invite;
} 