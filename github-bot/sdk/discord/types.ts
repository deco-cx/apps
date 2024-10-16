import type {
  DiscordCreateApplicationCommand,
  DiscordInteraction,
} from "https://deno.land/x/discordeno@18.0.1/mod.ts";
import type { AppContext } from "../../mod.ts";
import type { Interaction } from "./lib.ts";

export enum DiscordMessageFlags {
  Crossposted = 1 << 0,
  IsCrosspost = 1 << 1,
  SuppressEmbeds = 1 << 2,
  SourceMessageDeleted = 1 << 3,
  Urgent = 1 << 4,
  HasThread = 1 << 5,
  Ephemeral = 1 << 6,
  Loading = 1 << 7,
  FailedToMentionSomeRolesInThread = 1 << 8,
  SuppressNotifications = 1 << 12,
  IsVoiceMessage = 1 << 13,
}

export type ChatInputInteractionExecute = (
  interaction: Interaction,
  req: Request,
  ctx: AppContext,
) => Promise<unknown>;

export interface Command {
  data: DiscordCreateApplicationCommand;
  execute: ChatInputInteractionExecute;
}

export type InteractionExecute = (
  interaction: DiscordInteraction,
  req: Request,
  ctx: AppContext,
) => Promise<unknown>;
