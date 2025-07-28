import {
  DiscordMessage,
  DiscordChannel,
  DiscordGuild,
  DiscordUser,
  DiscordMessagesResponse,
  DiscordEmbed,
  DiscordGuildMember,
  DiscordRole,
  DiscordReaction,
  DiscordInvite,
  DiscordSlashCommand,
  DiscordSlashCommandOption,
} from "./types.ts";

export interface DiscordWebhook {
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
  source_channel?: DiscordChannel;
  url?: string;
}

export interface Client {
  // Ler mensagens de um canal
  "GET /channels/:channel_id/messages": {
    response: DiscordMessage[];
    searchParams: {
      around?: string;
      before?: string;
      after?: string;
      limit?: number;
    };
  };

  // Obter uma mensagem específica
  "GET /channels/:channel_id/messages/:message_id": {
    response: DiscordMessage;
  };

  // Obter reações de uma mensagem
  "GET /channels/:channel_id/messages/:message_id/reactions/:emoji": {
    response: DiscordUser[];
    searchParams: {
      after?: string;
      limit?: number;
    };
  };

  // Obter informações de um canal
  "GET /channels/:channel_id": {
    response: DiscordChannel;
  };

  // Listar webhooks de um canal
  "GET /channels/:channel_id/webhooks": {
    response: DiscordWebhook[];
  };

  // Obter informações de um servidor
  "GET /guilds/:guild_id": {
    response: DiscordGuild;
    searchParams: {
      with_counts?: boolean;
    };
  };

  // Listar canais de um servidor
  "GET /guilds/:guild_id/channels": {
    response: DiscordChannel[];
  };

  // Listar membros de um servidor
  "GET /guilds/:guild_id/members": {
    response: DiscordGuildMember[];
    searchParams: {
      limit?: number;
      after?: string;
    };
  };

  // Obter membro específico do servidor
  "GET /guilds/:guild_id/members/:user_id": {
    response: DiscordGuildMember;
  };

  // Listar roles de um servidor
  "GET /guilds/:guild_id/roles": {
    response: DiscordRole[];
  };

  // Listar webhooks de um servidor
  "GET /guilds/:guild_id/webhooks": {
    response: DiscordWebhook[];
  };

  // Listar servidores do bot
  "GET /users/@me/guilds": {
    response: DiscordGuild[];
    searchParams: {
      before?: string;
      after?: string;
      limit?: number;
      with_counts?: boolean;
    };
  };

  // Obter usuário atual (bot)
  "GET /users/@me": {
    response: DiscordUser;
  };

  // Obter informações de um usuário
  "GET /users/:user_id": {
    response: DiscordUser;
  };

  // Enviar mensagem em um canal
  "POST /channels/:channel_id/messages": {
    response: DiscordMessage;
    body: {
      content?: string;
      nonce?: string | number;
      tts?: boolean;
      embeds?: DiscordEmbed[];
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
      components?: any[];
      sticker_ids?: string[];
      files?: any[];
      payload_json?: string;
      attachments?: any[];
      flags?: number;
    };
  };

  // Editar mensagem
  "PATCH /channels/:channel_id/messages/:message_id": {
    response: DiscordMessage;
    body: {
      content?: string;
      embeds?: DiscordEmbed[];
      flags?: number;
      allowed_mentions?: {
        parse?: ("roles" | "users" | "everyone")[];
        roles?: string[];
        users?: string[];
        replied_user?: boolean;
      };
      components?: any[];
      files?: any[];
      payload_json?: string;
      attachments?: any[];
    };
  };

  // Deletar mensagem
  "DELETE /channels/:channel_id/messages/:message_id": {
    response: void;
  };

  // Adicionar reação a uma mensagem
  "PUT /channels/:channel_id/messages/:message_id/reactions/:emoji/@me": {
    response: void;
  };

  // Remover reação de uma mensagem
  "DELETE /channels/:channel_id/messages/:message_id/reactions/:emoji/@me": {
    response: void;
  };

  // Fixar mensagem
  "PUT /channels/:channel_id/pins/:message_id": {
    response: void;
  };

  // Desfixar mensagem
  "DELETE /channels/:channel_id/pins/:message_id": {
    response: void;
  };

  // Listar mensagens fixadas de um canal
  "GET /channels/:channel_id/pins": {
    response: DiscordMessage[];
  };

  // Criar canal
  "POST /guilds/:guild_id/channels": {
    response: DiscordChannel;
    body: {
      name: string;
      type?: number;
      topic?: string;
      bitrate?: number;
      user_limit?: number;
      rate_limit_per_user?: number;
      position?: number;
      permission_overwrites?: any[];
      parent_id?: string;
      nsfw?: boolean;
    };
  };

  // Editar canal
  "PATCH /channels/:channel_id": {
    response: DiscordChannel;
    body: {
      name?: string;
      topic?: string;
      nsfw?: boolean;
      rate_limit_per_user?: number;
      bitrate?: number;
      user_limit?: number;
      permission_overwrites?: any[];
      parent_id?: string | null;
      rtc_region?: string | null;
      video_quality_mode?: number;
      default_auto_archive_duration?: number;
    };
  };

  // Deletar canal
  "DELETE /channels/:channel_id": {
    response: DiscordChannel;
  };

  // Configurar permissões de canal
  "PUT /channels/:channel_id/permissions/:overwrite_id": {
    response: void;
    body: {
      allow?: string;
      deny?: string;
      type: number; // 0 = role, 1 = member
      reason?: string;
    };
  };

  // Deletar permissões de canal
  "DELETE /channels/:channel_id/permissions/:overwrite_id": {
    response: void;
    searchParams: {
      reason?: string;
    };
  };

  // Banir membro do servidor
  "PUT /guilds/:guild_id/bans/:user_id": {
    response: void;
    body: {
      delete_message_days?: number;
      reason?: string;
    };
  };

  // Expulsar membro do servidor
  "DELETE /guilds/:guild_id/members/:user_id": {
    response: void;
    searchParams: {
      reason?: string;
    };
  };

  // Aplicar timeout em membro
  "PATCH /guilds/:guild_id/members/:user_id": {
    response: DiscordGuildMember;
    body: {
      communication_disabled_until?: string | null;
      nick?: string;
      roles?: string[];
      deaf?: boolean;
      mute?: boolean;
      channel_id?: string | null;
    };
  };

  // Adicionar role a membro
  "PUT /guilds/:guild_id/members/:user_id/roles/:role_id": {
    response: void;
    body: {
      reason?: string;
    };
  };

  // Remover role de membro
  "DELETE /guilds/:guild_id/members/:user_id/roles/:role_id": {
    response: void;
    searchParams: {
      reason?: string;
    };
  };

  // Criar role
  "POST /guilds/:guild_id/roles": {
    response: DiscordRole;
    body: {
      name?: string;
      permissions?: string;
      color?: number;
      hoist?: boolean;
      icon?: string;
      unicode_emoji?: string;
      mentionable?: boolean;
      reason?: string;
    };
  };

  // Editar role
  "PATCH /guilds/:guild_id/roles/:role_id": {
    response: DiscordRole;
    body: {
      name?: string;
      permissions?: string;
      color?: number;
      hoist?: boolean;
      icon?: string;
      unicode_emoji?: string;
      mentionable?: boolean;
      reason?: string;
    };
  };

  // Deletar role
  "DELETE /guilds/:guild_id/roles/:role_id": {
    response: void;
    searchParams: {
      reason?: string;
    };
  };

  // Editar servidor/guild
  "PATCH /guilds/:guild_id": {
    response: DiscordGuild;
    body: {
      name?: string;
      region?: string | null;
      verification_level?: number | null;
      default_message_notifications?: number | null;
      explicit_content_filter?: number | null;
      afk_channel_id?: string | null;
      afk_timeout?: number;
      icon?: string | null;
      owner_id?: string;
      splash?: string | null;
      discovery_splash?: string | null;
      banner?: string | null;
      system_channel_id?: string | null;
      system_channel_flags?: number;
      rules_channel_id?: string | null;
      public_updates_channel_id?: string | null;
      preferred_locale?: string | null;
      features?: string[];
      description?: string | null;
      premium_progress_bar_enabled?: boolean;
      reason?: string;
    };
  };

  // Criar convite
  "POST /channels/:channel_id/invites": {
    response: DiscordInvite;
    body: {
      max_age?: number;
      max_uses?: number;
      temporary?: boolean;
      unique?: boolean;
      target_type?: number;
      target_user_id?: string;
      target_application_id?: string;
      reason?: string;
    };
  };

  // Criar slash command global
  "POST /applications/:application_id/commands": {
    response: DiscordSlashCommand;
    body: {
      name: string;
      description: string;
      options?: DiscordSlashCommandOption[];
      default_member_permissions?: string | null;
      dm_permission?: boolean;
      default_permission?: boolean;
      type?: number;
      nsfw?: boolean;
    };
  };

  // Criar slash command para guild específico
  "POST /applications/:application_id/guilds/:guild_id/commands": {
    response: DiscordSlashCommand;
    body: {
      name: string;
      description: string;
      options?: DiscordSlashCommandOption[];
      default_member_permissions?: string | null;
      type?: number;
      nsfw?: boolean;
    };
  };

  // Criar webhook
  "POST /channels/:channel_id/webhooks": {
    response: DiscordWebhook;
    body: {
      name: string;
      avatar?: string;
      reason?: string;
    };
  };

  // Editar webhook
  "PATCH /webhooks/:webhook_id": {
    response: DiscordWebhook;
    body: {
      name?: string;
      avatar?: string;
      channel_id?: string;
      reason?: string;
    };
  };

  // Deletar webhook
  "DELETE /webhooks/:webhook_id": {
    response: void;
    searchParams: {
      reason?: string;
    };
  };

  // Executar webhook
  "POST /webhooks/:webhook_id/:webhook_token": {
    response: DiscordMessage;
    body: {
      content?: string;
      username?: string;
      avatar_url?: string;
      tts?: boolean;
      embeds?: DiscordEmbed[];
      allowed_mentions?: {
        parse?: ("roles" | "users" | "everyone")[];
        roles?: string[];
        users?: string[];
      };
      components?: any[];
      files?: any[];
      payload_json?: string;
      attachments?: any[];
      flags?: number;
      thread_name?: string;
    };
    searchParams: {
      wait?: boolean;
      thread_id?: string;
    };
  };
}
