import type { AppContext } from "../mod.ts";
import { DiscordRole, EditRoleBody } from "../utils/types.ts";

export interface Props {
  /**
   * @title Guild ID
   * @description ID do servidor onde está o role
   */
  guildId: string;

  /**
   * @title Role ID
   * @description ID do role a ser editado
   */
  roleId: string;

  /**
   * @title Role Name
   * @description Novo nome do role
   */
  name?: string;

  /**
   * @title Permissions
   * @description Novas permissões do role (string de bits)
   */
  permissions?: string;

  /**
   * @title Color
   * @description Nova cor do role (valor RGB decimal)
   */
  color?: number;

  /**
   * @title Hoist
   * @description Se o role deve aparecer separado na lista de membros
   */
  hoist?: boolean;

  /**
   * @title Icon
   * @description Novo ícone do role (base64 image data)
   */
  icon?: string;

  /**
   * @title Unicode Emoji
   * @description Novo emoji unicode para o role
   */
  unicodeEmoji?: string;

  /**
   * @title Mentionable
   * @description Se o role pode ser mencionado
   */
  mentionable?: boolean;

  /**
   * @title Reason
   * @description Motivo para editar o role (audit log)
   */
  reason?: string;
}

/**
 * @title Edit Role
 * @description Edit an existing role in a Discord server using Bot Token
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

  const body: EditRoleBody = {};

  if (name !== undefined) {
    body.name = name;
  }

  if (permissions !== undefined) {
    body.permissions = permissions;
  }

  if (color !== undefined) {
    body.color = color;
  }

  if (hoist !== undefined) {
    body.hoist = hoist;
  }

  if (icon !== undefined) {
    body.icon = icon;
  }

  if (unicodeEmoji !== undefined) {
    body.unicode_emoji = unicodeEmoji;
  }

  if (mentionable !== undefined) {
    body.mentionable = mentionable;
  }

  if (reason) {
    body.reason = reason;
  }

  const response = await client["PATCH /guilds/:guild_id/roles/:role_id"]({
    guild_id: guildId,
    role_id: roleId,
  }, {
    body,
  });

  if (!response.ok) {
    throw new Error(`Failed to edit role: ${response.statusText}`);
  }

  return await response.json();
}
