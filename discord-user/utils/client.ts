import { DiscordGuild, DiscordGuildMember, DiscordUser } from "./types.ts";

export interface Client {
  "GET /users/@me/guilds": {
    response: DiscordGuild[];
    searchParams: {
      before?: string;
      after?: string;
      limit?: number;
      with_counts?: boolean;
    };
  };

  "GET /users/@me": {
    response: DiscordUser;
  };

  "GET /users/:user_id": {
    response: DiscordUser;
  };

  "GET /users/@me/guilds/:guild_id/member": {
    response: DiscordGuildMember;
  };

  "GET /users/@me/connections": {
    response: Array<{
      id: string;
      name: string;
      type: string;
      revoked?: boolean;
      integrations?: unknown[];
      verified: boolean;
      friend_sync: boolean;
      show_activity: boolean;
      two_way_link: boolean;
      visibility: number;
    }>;
  };

  "PUT /guilds/:guild_id/members/:user_id": {
    response: DiscordGuildMember;
    body: {
      nick?: string;
      roles?: string[];
      mute?: boolean;
      deaf?: boolean;
    };
  };

  "GET /users/@me/applications/:application_id/role-connection": {
    response: {
      platform_name?: string;
      platform_username?: string;
      metadata?: Record<string, string | number>;
    };
  };

  "PUT /users/@me/applications/:application_id/role-connection": {
    response: {
      platform_name?: string;
      platform_username?: string;
      metadata?: Record<string, string | number>;
    };
    body: {
      platform_name?: string;
      platform_username?: string;
      metadata?: Record<string, string | number>;
    };
  };

  "POST /channels/:channel_id/webhooks": {
    response: {
      id: string;
      type: number;
      guild_id?: string;
      channel_id: string;
      user?: DiscordUser;
      name?: string;
      avatar?: string;
      token?: string;
      application_id?: string;
      source_guild?: DiscordGuild;
      source_channel?: unknown;
      url?: string;
    };
    body: {
      name: string;
      avatar?: string;
    };
  };
}
