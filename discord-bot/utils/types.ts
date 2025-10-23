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
  roles: DiscordRole[];
  emojis: DiscordEmoji[];
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

export interface DiscordChannel {
  id: string;
  type: number;
  guild_id?: string;
  position?: number;
  permission_overwrites?: DiscordPermissionOverwrite[];
  name?: string;
  topic?: string;
  nsfw?: boolean;
  last_message_id?: string;
  bitrate?: number;
  user_limit?: number;
  rate_limit_per_user?: number;
  recipients?: DiscordUser[];
  icon?: string;
  owner_id?: string;
  application_id?: string;
  parent_id?: string;
  last_pin_timestamp?: string;
  rtc_region?: string;
  video_quality_mode?: number;
  message_count?: number;
  member_count?: number;
  thread_metadata?: DiscordThreadMetadata;
  member?: DiscordThreadMember;
  default_auto_archive_duration?: number;
  permissions?: string;
}

export interface DiscordMessage {
  id: string;
  channel_id: string;
  author: DiscordUser;
  content: string;
  timestamp: string;
  edited_timestamp?: string;
  tts: boolean;
  mention_everyone: boolean;
  mentions: DiscordUser[];
  mention_roles: string[];
  mention_channels?: DiscordChannelMention[];
  attachments: DiscordAttachment[];
  embeds: DiscordEmbed[];
  reactions?: DiscordReaction[];
  nonce?: string | number;
  pinned: boolean;
  webhook_id?: string;
  type: number;
  activity?: DiscordMessageActivity;
  application?: DiscordApplication;
  application_id?: string;
  message_reference?: DiscordMessageReference;
  flags?: number;
  referenced_message?: DiscordMessage;
  interaction?: DiscordMessageInteraction;
  thread?: DiscordChannel;
  components?: DiscordComponent[];
  sticker_items?: DiscordStickerItem[];
  position?: number;
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

export interface DiscordEmbedFooter {
  text: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface DiscordEmbedImage {
  url: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface DiscordEmbedThumbnail {
  url: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface DiscordEmbedVideo {
  url?: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface DiscordEmbedProvider {
  name?: string;
  url?: string;
}

export interface DiscordEmbedAuthor {
  name: string;
  url?: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordAttachment {
  id: string;
  filename: string;
  description?: string;
  content_type?: string;
  size: number;
  url: string;
  proxy_url: string;
  height?: number;
  width?: number;
  ephemeral?: boolean;
}

export interface DiscordReaction {
  count: number;
  me: boolean;
  emoji: DiscordEmoji;
}

export interface DiscordEmoji {
  id?: string;
  name?: string;
  roles?: string[];
  user?: DiscordUser;
  require_colons?: boolean;
  managed?: boolean;
  animated?: boolean;
  available?: boolean;
}

export interface DiscordRole {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  icon?: string;
  unicode_emoji?: string;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
  tags?: DiscordRoleTags;
}

export interface DiscordRoleTags {
  bot_id?: string;
  integration_id?: string;
  premium_subscriber?: null;
}

export interface DiscordPermissionOverwrite {
  id: string;
  type: number;
  allow: string;
  deny: string;
}

export interface DiscordThreadMetadata {
  archived: boolean;
  auto_archive_duration: number;
  archive_timestamp: string;
  locked: boolean;
  invitable?: boolean;
  create_timestamp?: string;
}

export interface DiscordThreadMember {
  id?: string;
  user_id?: string;
  join_timestamp: string;
  flags: number;
}

export interface DiscordChannelMention {
  id: string;
  guild_id: string;
  type: number;
  name: string;
}

export interface DiscordMessageActivity {
  type: number;
  party_id?: string;
}

export interface DiscordApplication {
  id: string;
  name: string;
  icon?: string | null;
  description: string;
  rpc_origins?: string[];
  bot_public: boolean;
  bot_require_code_grant: boolean;
  terms_of_service_url?: string;
  privacy_policy_url?: string;
  owner?: DiscordUser;
  verify_key: string;
  team?: DiscordTeam | null;
  guild_id?: string;
  primary_sku_id?: string;
  slug?: string;
  cover_image?: string;
  flags?: number;
  tags?: string[];
  install_params?: DiscordInstallParams;
  custom_install_url?: string;
}

export interface DiscordTeam {
  icon?: string | null;
  id: string;
  members: DiscordTeamMember[];
  name: string;
  owner_user_id: string;
}

export interface DiscordTeamMember {
  membership_state: number;
  permissions: string[];
  team_id: string;
  user: DiscordUser;
}

export interface DiscordInstallParams {
  scopes: string[];
  permissions: string;
}

export interface DiscordStageInstance {
  id: string;
  guild_id: string;
  channel_id: string;
  topic: string;
  privacy_level: number;
  discoverable_disabled: boolean;
  guild_scheduled_event_id?: string | null;
}

export type GuildScheduledEventStatus = 1 | 2 | 3 | 4;
export type GuildScheduledEventEntityType = 1 | 2 | 3;

export interface DiscordGuildScheduledEvent {
  id: string;
  guild_id: string;
  channel_id?: string | null;
  creator_id?: string | null;
  name: string;
  description?: string | null;
  scheduled_start_time: string;
  scheduled_end_time?: string | null;
  privacy_level: number;
  status: GuildScheduledEventStatus;
  entity_type: GuildScheduledEventEntityType;
  entity_id?: string | null;
  entity_metadata?: DiscordGuildScheduledEventEntityMetadata | null;
  creator?: DiscordUser;
  user_count?: number;
  image?: string | null;
}

export interface DiscordGuildScheduledEventEntityMetadata {
  location?: string;
}

export interface DiscordPartialEmoji {
  id?: string | null;
  name?: string | null;
  animated?: boolean;
}

export interface DiscordActionRow {
  type: 1;
  components: DiscordMessageComponent[];
}

export interface DiscordButton {
  type: 2;
  style: number;
  label?: string;
  emoji?: DiscordPartialEmoji;
  custom_id?: string;
  url?: string;
  disabled?: boolean;
}

export interface DiscordSelectMenu {
  type: 3 | 5 | 6 | 7 | 8;
  custom_id: string;
  options?: DiscordSelectOption[];
  channel_types?: number[];
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
}

export interface DiscordSelectOption {
  label: string;
  value: string;
  description?: string;
  emoji?: DiscordPartialEmoji;
  default?: boolean;
}

export interface DiscordTextInput {
  type: 4;
  custom_id: string;
  style: number;
  label: string;
  min_length?: number;
  max_length?: number;
  required?: boolean;
  value?: string;
  placeholder?: string;
}

export type DiscordMessageComponent =
  | DiscordActionRow
  | DiscordButton
  | DiscordSelectMenu
  | DiscordTextInput;

export interface DiscordFile {
  filename: string;
  content_type?: string;
  file: Blob | ArrayBuffer | Uint8Array;
}

export interface DiscordMessageAttachment {
  id?: string;
  filename: string;
  description?: string;
  content_type?: string;
  size?: number;
  url?: string;
  proxy_url?: string;
  height?: number | null;
  width?: number | null;
  ephemeral?: boolean;
}

export interface DiscordMessageReference {
  message_id?: string;
  channel_id?: string;
  guild_id?: string;
  fail_if_not_exists?: boolean;
}

export interface DiscordMessageInteraction {
  id: string;
  type: number;
  name: string;
  user: DiscordUser;
  member?: DiscordGuildMember;
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

export interface DiscordComponent {
  type: number;
  style?: number;
  label?: string;
  emoji?: DiscordEmoji;
  custom_id?: string;
  url?: string;
  disabled?: boolean;
  components?: DiscordComponent[];
}

export interface DiscordStickerItem {
  id: string;
  name: string;
  format_type: number;
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

export interface DiscordInvite {
  type?: InviteType;
  code: string;
  guild?: DiscordGuild;
  channel: DiscordChannel | null;
  inviter?: DiscordUser;
  target_type?: InviteTargetType;
  target_user?: DiscordUser;
  target_application?: DiscordApplication;
  approximate_presence_count?: number;
  approximate_member_count?: number;
  expires_at?: string | null;
  stage_instance?: DiscordStageInstance;
  guild_scheduled_event?: DiscordGuildScheduledEvent;
}

export interface DiscordGuildsResponse {
  guilds: DiscordGuild[];
}

export interface EditRoleBody {
  name?: string;
  permissions?: string;
  color?: number;
  hoist?: boolean;
  icon?: string;
  unicode_emoji?: string;
  mentionable?: boolean;
  reason?: string;
}

export type InviteType = 0 | 1 | 2;
export type InviteTargetType = 1 | 2;

export interface AllowedMentions {
  parse?: ("roles" | "users" | "everyone")[];
  roles?: string[];
  users?: string[];
  replied_user?: boolean;
}

export interface MessageReference {
  message_id?: string;
  channel_id?: string;
  guild_id?: string;
  fail_if_not_exists?: boolean;
}

export interface SendMessageBody {
  content?: string;
  nonce?: number | string;
  tts?: boolean;
  embeds?: DiscordEmbed[];
  allowed_mentions?: AllowedMentions;
  message_reference?: MessageReference;
  components?: DiscordMessageComponent[];
  files?: DiscordFile[];
  payload_json?: string;
  attachments?: DiscordMessageAttachment[];
  flags?: number;
  sticker_ids?: string[];
  thread_name?: string;
}

export interface ExecuteWebhookBody {
  content?: string;
  username?: string;
  avatar_url?: string;
  tts?: boolean;
  embeds?: DiscordEmbed[];
  thread_name?: string;
  applied_tags?: string[];
}

export interface EditMessageBody {
  content?: string;
  embeds?: DiscordEmbed[];
}

export interface CreateWebhookBody {
  name: string;
  avatar?: string;
}

export interface CreateThreadBody {
  name: string;
  auto_archive_duration?: number;
  type?: number;
  invitable?: boolean;
  rate_limit_per_user?: number;
  applied_tags?: string[];
  message?: {
    content?: string;
    embeds?: DiscordEmbed[];
  };
}

export interface CreateRoleBody {
  name?: string;
  permissions?: string;
  color?: number;
  hoist?: boolean;
  icon?: string;
  unicode_emoji?: string;
  mentionable?: boolean;
  reason?: string;
}
