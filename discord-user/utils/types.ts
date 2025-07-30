import {
  DiscordEmbedAuthor,
  DiscordEmbedField,
  DiscordEmbedFooter,
  DiscordEmbedImage,
  DiscordEmbedProvider,
  DiscordEmbedThumbnail,
  DiscordEmbedVideo,
} from "../../discord-bot/utils/types.ts";

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string;
  avatar?: string;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner?: string;
  accent_color?: number;
  locale?: string;
  verified?: boolean;
  email?: string;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon?: string;
  icon_hash?: string;
  splash?: string;
  discovery_splash?: string;
  owner?: boolean;
  owner_id: string;
  permissions?: string;
  region?: string;
  afk_channel_id?: string;
  afk_timeout: number;
  widget_enabled?: boolean;
  widget_channel_id?: string;
  verification_level: number;
  default_message_notifications: number;
  explicit_content_filter: number;
  features: string[];
  mfa_level: number;
  application_id?: string;
  system_channel_id?: string;
  system_channel_flags: number;
  rules_channel_id?: string;
  max_presences?: number;
  max_members?: number;
  vanity_url_code?: string;
  description?: string;
  banner?: string;
  premium_tier: number;
  premium_subscription_count?: number;
  preferred_locale: string;
  public_updates_channel_id?: string;
  max_video_channel_users?: number;
  approximate_member_count?: number;
  approximate_presence_count?: number;
  welcome_screen?: DiscordWelcomeScreen;
  nsfw_level: number;
  stickers?: DiscordSticker[];
  premium_progress_bar_enabled: boolean;
}

export interface DiscordGuildMember {
  user?: DiscordUser;
  nick?: string;
  avatar?: string;
  roles: string[];
  joined_at: string;
  premium_since?: string;
  deaf: boolean;
  mute: boolean;
  flags: number;
  pending?: boolean;
  permissions?: string;
  communication_disabled_until?: string;
}

export interface DiscordEmbed {
  title?: string;
  type?: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: DiscordEmbedFooter;
  image?: DiscordEmbedImage;
  thumbnail?: DiscordEmbedThumbnail;
  video?: DiscordEmbedVideo;
  provider?: DiscordEmbedProvider;
  author?: DiscordEmbedAuthor;
  fields?: DiscordEmbedField[];
}

export interface SendMessageBody {
  content?: string;
  embeds?: DiscordEmbed[];
  tts?: boolean;
  allowed_mentions?: {
    parse?: ("roles" | "users" | "everyone")[];
    roles?: string[];
    users?: string[];
    replied_user?: boolean;
  };
  message_reference?: {
    message_id?: string;
    channel_id?: string;
    guild_id?: string;
    fail_if_not_exists?: boolean;
  };
  components?: unknown[];
  files?: unknown[];
  payload_json?: string;
  attachments?: unknown[];
  flags?: number;
}
export interface DiscordSticker {
  id: string;
  pack_id?: string;
  name: string;
  description?: string;
  tags: string;
  asset?: string;
  type: number;
  format_type: number;
  available?: boolean;
  guild_id?: string;
  user?: DiscordUser;
  sort_value?: number;
}

export interface DiscordWelcomeScreen {
  description?: string;
  welcome_channels: DiscordWelcomeScreenChannel[];
}

export interface DiscordWelcomeScreenChannel {
  channel_id: string;
  description: string;
  emoji_id?: string;
  emoji_name?: string;
}

export interface DiscordGuildsResponse {
  guilds: DiscordGuild[];
}
