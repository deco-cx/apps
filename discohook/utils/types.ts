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
  attachments: any[];
  embeds: DiscordEmbed[];
  mentions: any[];
  mention_roles: any[];
  pinned: boolean;
  mention_everyone: boolean;
  tts: boolean;
  timestamp: string;
  edited_timestamp: string | null;
  flags: number;
  components: any[];
  webhook_id: string;
}
