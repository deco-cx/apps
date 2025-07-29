import type { AppContext } from "../mod.ts";
import { DiscordChannel } from "../utils/types.ts";

export interface Props {
  /**
   * @title Guild ID
   * @description ID do servidor Discord onde criar o canal
   */
  guildId: string;

  /**
   * @title Channel Name
   * @description Nome do canal (2-100 caracteres)
   */
  name: string;

  /**
   * @title Channel Type
   * @description Tipo do canal (0=Text, 2=Voice, 4=Category, 5=News)
   * @default 0
   */
  type?: number;

  /**
   * @title Topic
   * @description Tópico do canal (máximo 1024 caracteres)
   */
  topic?: string;

  /**
   * @title NSFW
   * @description Se o canal é NSFW (Not Safe For Work)
   * @default false
   */
  nsfw?: boolean;

  /**
   * @title Parent ID
   * @description ID da categoria pai (para organizar canais)
   */
  parentId?: string;

  /**
   * @title Position
   * @description Posição do canal na lista
   */
  position?: number;
}

/**
 * @title Create Channel
 * @description Create a new channel in a Discord guild using Bot Token
 */
export default async function createChannel(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordChannel> {
  const { guildId, name, type = 0, topic, nsfw = false, parentId, position } = props;
  const { client } = ctx;

  if (!guildId) {
    throw new Error("Guild ID is required");
  }

  if (!name) {
    throw new Error("Channel name is required");
  }

  if (name.length < 2 || name.length > 100) {
    throw new Error("Channel name must be between 2-100 characters");
  }

  if (topic && topic.length > 1024) {
    throw new Error("Channel topic cannot exceed 1024 characters");
  }

  // Create channel
  const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
    method: "POST",
    headers: {
      "Authorization": `Bot ${ctx.botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      type,
      topic,
      nsfw,
      parent_id: parentId,
      position,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create channel: ${response.statusText}`);
  }

  const channel = await response.json();
  return channel;
}