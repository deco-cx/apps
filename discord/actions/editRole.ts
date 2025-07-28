import type { AppContext } from "../mod.ts";
import { DiscordRole } from "../utils/types.ts";

export interface Props {
  /**
   * @title Guild ID
   * @description Discord guild ID where the role is located
   */
  guildId: string;

  /**
   * @title Role ID
   * @description ID of the role to edit
   */
  roleId: string;

  /**
   * @title Role Name
   * @description New name for the role
   */
  name?: string;

  /**
   * @title Permissions
   * @description New bitwise value of the enabled/disabled permissions (as string)
   */
  permissions?: string;

  /**
   * @title Color
   * @description New RGB color value as integer (0x000000 to 0xFFFFFF)
   */
  color?: number;

  /**
   * @title Hoist
   * @description Whether this role should be displayed separately in the member list
   */
  hoist?: boolean;

  /**
   * @title Icon
   * @description New icon for the role (base64 encoded image data, or null to remove)
   */
  icon?: string | null;

  /**
   * @title Unicode Emoji
   * @description New unicode emoji for the role (or null to remove)
   */
  unicodeEmoji?: string | null;

  /**
   * @title Mentionable
   * @description Whether this role should be mentionable
   */
  mentionable?: boolean;

  /**
   * @title Reason
   * @description Reason for editing the role (will be shown in audit log)
   */
  reason?: string;
}

/**
 * @title Edit Role
 * @description Edit an existing role in a Discord guild (requires Manage Roles permission)
 */
export default async function editRole(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordRole> {
  const {
    guildId,
    roleId,
    name,
    permissions,
    color,
    hoist,
    icon,
    unicodeEmoji,
    mentionable,
    reason,
  } = props;
  const { client } = ctx;

  if (!guildId) {
    throw new Error("Guild ID is required");
  }

  if (!roleId) {
    throw new Error("Role ID is required");
  }

  // Build request body (only include provided fields)
  const body: any = {};

  if (name !== undefined) {
    body.name = name;
  }

  if (permissions !== undefined) {
    body.permissions = permissions;
  }

  if (color !== undefined) {
    // Validate color range
    if (color < 0 || color > 0xFFFFFF) {
      throw new Error("Color must be between 0x000000 and 0xFFFFFF");
    }
    body.color = color;
  }

  if (hoist !== undefined) {
    body.hoist = hoist;
  }

  if (icon !== undefined) {
    body.icon = icon; // Can be string (new icon) or null (remove icon)
  }

  if (unicodeEmoji !== undefined) {
    body.unicode_emoji = unicodeEmoji; // Can be string (new emoji) or null (remove emoji)
  }

  if (mentionable !== undefined) {
    body.mentionable = mentionable;
  }

  if (reason) {
    body.reason = reason;
  }

  // Validate that icon and unicode emoji are not both provided
  if (icon && unicodeEmoji) {
    throw new Error("Cannot have both icon and unicode emoji");
  }

  // Check if at least one field is being updated
  if (Object.keys(body).filter(key => key !== 'reason').length === 0) {
    throw new Error("At least one field must be provided to edit the role");
  }

  // Edit role
  const response = await client["PATCH /guilds/:guild_id/roles/:role_id"]({
    guild_id: guildId,
    role_id: roleId,
  }, body);

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to edit role: ${response.statusText}`,
    );
  }

  const role = await response.json();
  return role;
} 