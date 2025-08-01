import type { AppContext } from "../mod.ts";
import { CreateRoleBody, DiscordRole } from "../utils/types.ts";

export interface Props {
  /**
   * @title Guild ID
   * @description ID do servidor onde criar o role
   */
  guildId: string;

  /**
   * @title Role Name
   * @description Nome do role
   * @default "new role"
   */
  name?: string;

  /**
   * @title Permissions
   * @description Permissões do role (string de bits)
   * @default "0"
   */
  permissions?: string;

  /**
   * @title Color
   * @description Cor do role (valor RGB decimal)
   */
  color?: number;

  /**
   * @title Hoist
   * @description Se o role deve aparecer separado na lista de membros
   * @default false
   */
  hoist?: boolean;

  /**
   * @title Icon
   * @description Ícone do role (base64 image data)
   */
  icon?: string;

  /**
   * @title Unicode Emoji
   * @description Emoji unicode para o role
   */
  unicodeEmoji?: string;

  /**
   * @title Mentionable
   * @description Se o role pode ser mencionado
   * @default false
   */
  mentionable?: boolean;

  /**
   * @title Reason
   * @description Motivo para criar o role (audit log)
   */
  reason?: string;
}

/**
 * @title Create Role
 * @description Create a new role in a Discord server using Bot Token
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
    color,
    hoist = false,
    icon,
    unicodeEmoji,
    mentionable = false,
    reason,
  } = props;
  const { client } = ctx;

  const body: CreateRoleBody = {
    name,
    permissions,
    hoist,
    mentionable,
  };

  if (color !== undefined) {
    body.color = color;
  }

  if (icon) {
    body.icon = icon;
  }

  if (unicodeEmoji) {
    body.unicode_emoji = unicodeEmoji;
  }

  if (reason) {
    body.reason = reason;
  }

  const response = await client["POST /guilds/:guild_id/roles"]({
    guild_id: guildId,
  }, {
    body,
  });

  if (!response.ok) {
    throw new Error(`Failed to create role: ${response.statusText}`);
  }

  const role = await response.json();
  return role;
}
