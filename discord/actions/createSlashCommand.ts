import type { AppContext } from "../mod.ts";
import { DiscordSlashCommand, DiscordSlashCommandOption } from "../utils/types.ts";

export interface Props {
  /**
   * @title Application ID
   * @description Discord application/bot ID
   */
  applicationId: string;

  /**
   * @title Guild ID (Optional)
   * @description Guild ID for guild-specific command (leave empty for global command)
   */
  guildId?: string;

  /**
   * @title Command Name
   * @description Name of the slash command (1-32 lowercase characters, no spaces)
   */
  name: string;

  /**
   * @title Command Description
   * @description Description of the slash command (1-100 characters)
   */
  description: string;

  /**
   * @title Command Options
   * @description Array of command options/parameters
   */
  options?: DiscordSlashCommandOption[];

  /**
   * @title Default Member Permissions
   * @description Set of permissions represented as a bit set (as string)
   */
  defaultMemberPermissions?: string | null;

  /**
   * @title DM Permission
   * @description Whether the command is available in DMs
   * @default true
   */
  dmPermission?: boolean;

  /**
   * @title Command Type
   * @description Type of command (1 = CHAT_INPUT, 2 = USER, 3 = MESSAGE)
   * @default 1
   */
  type?: 1 | 2 | 3;

  /**
   * @title NSFW
   * @description Whether the command is age-restricted
   * @default false
   */
  nsfw?: boolean;
}

/**
 * @title Create Slash Command
 * @description Create a slash command for a Discord application (requires Applications.Commands scope)
 */
export default async function createSlashCommand(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordSlashCommand> {
  const {
    applicationId,
    guildId,
    name,
    description,
    options,
    defaultMemberPermissions,
    dmPermission = true,
    type = 1,
    nsfw = false,
  } = props;
  const { client } = ctx;

  if (!applicationId) {
    throw new Error("Application ID is required");
  }

  if (!name) {
    throw new Error("Command name is required");
  }

  if (!description) {
    throw new Error("Command description is required");
  }

  // Validate command name
  if (name.length < 1 || name.length > 32) {
    throw new Error("Command name must be between 1 and 32 characters");
  }

  if (!/^[a-z0-9_-]+$/.test(name)) {
    throw new Error("Command name must be lowercase and contain only letters, numbers, hyphens, and underscores");
  }

  // Validate description
  if (description.length < 1 || description.length > 100) {
    throw new Error("Command description must be between 1 and 100 characters");
  }

  // Validate options
  if (options && options.length > 25) {
    throw new Error("A command can have at most 25 options");
  }

  // Validate each option
  if (options) {
    for (const option of options) {
      if (!option.name || !option.description) {
        throw new Error("Each option must have a name and description");
      }

      if (option.name.length < 1 || option.name.length > 32) {
        throw new Error("Option name must be between 1 and 32 characters");
      }

      if (!/^[a-z0-9_-]+$/.test(option.name)) {
        throw new Error("Option name must be lowercase and contain only letters, numbers, hyphens, and underscores");
      }

      if (option.description.length < 1 || option.description.length > 100) {
        throw new Error("Option description must be between 1 and 100 characters");
      }

      // Validate option type
      if (option.type < 1 || option.type > 11) {
        throw new Error("Option type must be between 1 and 11");
      }

      // Validate choices if present
      if (option.choices && option.choices.length > 25) {
        throw new Error("An option can have at most 25 choices");
      }
    }
  }

  // Build request body
  const body: any = {
    name,
    description,
    type,
    nsfw,
  };

  if (options && options.length > 0) {
    body.options = options;
  }

  if (defaultMemberPermissions !== undefined) {
    body.default_member_permissions = defaultMemberPermissions;
  }

  // DM permission only applies to global commands
  if (!guildId) {
    body.dm_permission = dmPermission;
  }

  // Choose endpoint based on whether it's a global or guild command
  let response: Response;

  if (guildId) {
    // Guild-specific command
    response = await client["POST /applications/:application_id/guilds/:guild_id/commands"]({
      application_id: applicationId,
      guild_id: guildId,
    }, body);
  } else {
    // Global command
    response = await client["POST /applications/:application_id/commands"]({
      application_id: applicationId,
    }, body);
  }

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to create slash command: ${response.statusText}`,
    );
  }

  const command = await response.json();
  return command;
} 