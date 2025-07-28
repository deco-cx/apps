import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description ID of the channel to set permissions for
   */
  channelId: string;

  /**
   * @title Target ID
   * @description ID of the role or user to set permissions for (overwrite_id)
   */
  targetId: string;

  /**
   * @title Target Type
   * @description Type of target (0 = role, 1 = member/user)
   */
  targetType: 0 | 1;

  /**
   * @title Allow Permissions
   * @description Bitwise value of allowed permissions (as string)
   */
  allow?: string;

  /**
   * @title Deny Permissions
   * @description Bitwise value of denied permissions (as string)
   */
  deny?: string;

  /**
   * @title Reason
   * @description Reason for setting permissions (will be shown in audit log)
   */
  reason?: string;
}

/**
 * @title Set Channel Permissions
 * @description Set permissions for a role or user in a Discord channel (requires Manage Roles permission)
 */
export default async function setChannelPermissions(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> {
  const { channelId, targetId, targetType, allow, deny, reason } = props;
  const { client } = ctx;

  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  if (!targetId) {
    throw new Error("Target ID (role or user ID) is required");
  }

  if (targetType !== 0 && targetType !== 1) {
    throw new Error("Target type must be 0 (role) or 1 (member)");
  }

  if (!allow && !deny) {
    throw new Error("At least one of 'allow' or 'deny' permissions must be provided");
  }

  // Build request body
  const body: any = {
    type: targetType,
  };

  if (allow) {
    body.allow = allow;
  }

  if (deny) {
    body.deny = deny;
  }

  if (reason) {
    body.reason = reason;
  }

  // Set channel permissions
  const response = await client["PUT /channels/:channel_id/permissions/:overwrite_id"]({
    channel_id: channelId,
    overwrite_id: targetId,
  }, body);

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to set channel permissions: ${response.statusText}`,
    );
  }
} 