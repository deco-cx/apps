// notice that here we have the types for the return of the API calls
// you can use https://quicktype.io/ to convert JSON to typescript

export interface GithubUser {
  login: string;
  id: number;
  avatar_url: string;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  author?: {
    name: string;
    url?: string;
    icon_url?: string;
  };
  thumbnail?: {
    url: string;
  };
  image?: {
    url: string;
  };
  footer?: {
    text: string;
    icon_url?: string;
  };
  timestamp?: string;
}

export interface DiscordMessage {
  content?: string;
  username?: string;
  avatar_url?: string;
  tts?: boolean;
  embeds?: DiscordEmbed[];
  allowed_mentions?: {
    parse?: ("users" | "roles" | "everyone")[];
    users?: string[];
    roles?: string[];
  };
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

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  locale?: string;
  verified?: boolean;
  email?: string;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
}

export interface DiscordRole {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
}

export interface DiscordComponent {
  type: number;
  custom_id?: string;
  disabled?: boolean;
  style?: number;
  label?: string;
  emoji?: {
    name?: string;
    id?: string;
    animated?: boolean;
  };
  url?: string;
  options?: Array<{
    label: string;
    value: string;
    description?: string;
    emoji?: {
      name?: string;
      id?: string;
      animated?: boolean;
    };
    default?: boolean;
  }>;
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  components?: DiscordComponent[];
}

export interface DiscordWebhookResponse {
  id: string;
  type: number;
  content: string;
  channel_id: string;
  author: {
    bot: boolean;
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
  };
  attachments: DiscordAttachment[];
  embeds: DiscordEmbed[];
  mentions: DiscordUser[];
  mention_roles: DiscordRole[];
  pinned: boolean;
  mention_everyone: boolean;
  tts: boolean;
  timestamp: string;
  edited_timestamp: string | null;
  flags: number;
  components: DiscordComponent[];
  webhook_id: string;
}
