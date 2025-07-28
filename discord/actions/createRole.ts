import type { AppContext } from "../mod.ts";
import { DiscordRole } from "../utils/types.ts";

export interface Props {
  /**
   * @title Guild ID
   * @description Discord guild ID where to create the role
   */
  guildId: string;

  /**
   * @title Role Name
   * @description Name of the role to create
   * @default "new role"
   */
  name?: string;

  /**
   * @title Permissions
   * @description Bitwise value of the enabled/disabled permissions (as string)
   * @default "0"
   */
  permissions?: string;

  /**
   * @title Color
   * @description RGB color value as integer (0x000000 to 0xFFFFFF)
   * @default 0
   */
  color?: number;

  /**
   * @title Hoist
   * @description Whether this role should be displayed separately in the member list
   * @default false
   */
  hoist?: boolean;

  /**
   * @title Icon
   * @description Icon for the role (base64 encoded image data)
   */
  icon?: string;

  /**
   * @title Unicode Emoji
   * @description Unicode emoji for the role
   */
  unicodeEmoji?: string;

  /**
   * @title Mentionable
   * @description Whether this role should be mentionable
   * @default false
   */
  mentionable?: boolean;

  /**
   * @title Reason
   * @description Reason for creating the role (will be shown in audit log)
   */
  reason?: string;
}

/**
 * @title Create Role
 * @description Create a new role in a Discord guild (requires Manage Roles permission)
 */
export default async function createRole(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordRole> {
  const {
    guildId,
    name = "new role",
    permissions = "0",
    color = 0,
    hoist = false,
    icon,
    unicodeEmoji,
    mentionable = false,
    reason,
  } = props;
  const { client } = ctx;

  if (!guildId) {
    throw new Error("Guild ID is required");
  }

  // Validate color range
  if (color < 0 || color > 0xFFFFFF) {
    throw new Error("Color must be between 0x000000 and 0xFFFFFF");
  }

  // Validate that icon and unicode emoji are not both provided
  if (icon && unicodeEmoji) {
    throw new Error("Cannot have both icon and unicode emoji");
  }

  // Build request body
  const body: any = {
    name,
    permissions,
    color,
    hoist,
    mentionable,
  };

  if (icon) {
    body.icon = icon;
  }

  if (unicodeEmoji) {
    body.unicode_emoji = unicodeEmoji;
  }

  if (reason) {
    body.reason = reason;
  }

  // Create role
  const response = await client["POST /guilds/:guild_id/roles"]({
    guild_id: guildId,
  }, body);

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to create role: ${response.statusText}`,
    );
  }

  const role = await response.json();
  return role;
} 