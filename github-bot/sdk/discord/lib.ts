import {
  type Bot,
  type DiscordInteraction,
  type EditMessage,
  editMessage,
  editOriginalInteractionResponse,
  type InteractionCallbackData,
  type InteractionResponse,
  InteractionResponseTypes,
  MessageComponentTypes,
  sendInteractionResponse,
} from "https://deno.land/x/discordeno@18.0.1/mod.ts";
import type {
  DiscordInteractionData,
  DiscordInteractionMember,
  DiscordMessage,
  DiscordUser,
} from "https://deno.land/x/discordeno@18.0.1/types/discord.ts";
import { InteractionTypes } from "https://deno.land/x/discordeno@18.0.1/types/shared.ts";
import parseCustomId from "./parseCustomId.ts";

export class Interaction implements DiscordInteraction {
  id: string;
  application_id: string;
  type: InteractionTypes;
  guild_id?: string | undefined;
  channel_id?: string | undefined;
  member?: DiscordInteractionMember | undefined;
  user?: DiscordUser | undefined;
  token: string;
  version: 1;
  message?: DiscordMessage | undefined;
  data?: DiscordInteractionData | undefined;
  locale?: string | undefined;
  guild_locale?: string | undefined;
  app_permissions: string;

  constructor(
    public readonly interaction: DiscordInteraction,
    public readonly bot: Bot,
  ) {
    this.id = interaction.id;
    this.application_id = interaction.application_id;
    this.type = interaction.type;
    this.guild_id = interaction.guild_id;
    this.channel_id = interaction.channel_id;
    this.member = interaction.member;
    this.user = interaction.user;
    this.token = interaction.token;
    this.version = interaction.version;
    this.message = interaction.message;
    this.data = interaction.data;
    this.locale = interaction.locale;
    this.guild_locale = interaction.guild_locale;
    this.app_permissions = interaction.app_permissions;
  }

  parseCustomId<T extends string = string>() {
    if (!this.data?.custom_id) {
      return null;
    }

    return parseCustomId<T>(this.data?.custom_id);
  }

  isApplicationCommandInteraction() {
    return this.type === InteractionTypes.ApplicationCommand;
  }

  isButtonInteraction() {
    return this.type === InteractionTypes.MessageComponent &&
      this.data?.component_type === MessageComponentTypes.Button;
  }

  /**
   * Edits the initial message response to an interaction.
   */
  editOriginalInteractionResponse(data: InteractionCallbackData) {
    return editOriginalInteractionResponse(this.bot, this.token, data);
  }

  /**
   * Edits the original message. This method should be called only in button interactions.
   */
  editOriginalMessage(data: EditMessage) {
    if (!this.channel_id) {
      throw new Error(
        "Channel id is not set in the interaction",
      );
    }

    if (!this.message) {
      throw new Error(
        "editOriginalMessage should be called only in button interactions",
      );
    }

    return editMessage(this.bot, this.channel_id, this.message.id, data);
  }

  /**
   * Sends a response to an interaction.
   */
  respond(data: InteractionResponse) {
    return sendInteractionResponse(
      this.bot,
      this.interaction.id,
      this.interaction.token,
      data,
    );
  }

  /**
   * Respond to an interaction with a message.
   */
  respondWithMessage(data: InteractionCallbackData) {
    return this.respond({
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data,
    });
  }

  /**
   * ACK an interaction and edit a response later, the user sees a loading state.
   */
  deferRespond(data: InteractionCallbackData) {
    return this.respond({
      type: InteractionResponseTypes.DeferredChannelMessageWithSource,
      data,
    });
  }

  getOption<T>(name: string) {
    const option = this.interaction.data?.options?.find((option) =>
      option.name === name
    );

    if (!option) {
      return null;
    }

    return {
      ...option,
      value: option.value as T | undefined,
    };
  }

  getStringOption(name: string) {
    return this.getOption<string>(name);
  }

  getIntegerOption(name: string) {
    return this.getOption<number>(name);
  }
}
