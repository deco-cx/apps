import {
  DiscordChannel,
  DiscordEmbed,
  DiscordGuild,
  DiscordGuildMember,
  DiscordInvite,
  DiscordMessage,
  DiscordRole,
  DiscordUser,
  EditRoleBody,
} from "./types.ts";

export interface Client {
  // Bot endpoints - Funcionam com Bot Token

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
      components?: unknown[];
      sticker_ids?: string[];
      files?: unknown[];
      payload_json?: string;
      attachments?: unknown[];
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
      components?: unknown[];
      files?: unknown[];
      payload_json?: string;
      attachments?: unknown[];
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
      permission_overwrites?: unknown[];
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
      permission_overwrites?: unknown[];
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

  // Listar threads ativas em um servidor
  "GET /guilds/:guild_id/threads/active": {
    response: {
      threads: DiscordChannel[];
      members: unknown[];
      has_more: boolean;
    };
  };

  // Listar threads arquivadas públicas de um canal
  "GET /channels/:channel_id/threads/archived/public": {
    response: {
      threads: DiscordChannel[];
      members: unknown[];
      has_more: boolean;
    };
    searchParams: {
      before?: string;
      limit?: number;
    };
  };

  // Listar threads arquivadas privadas de um canal
  "GET /channels/:channel_id/threads/archived/private": {
    response: {
      threads: DiscordChannel[];
      members: unknown[];
      has_more: boolean;
    };
    searchParams: {
      before?: string;
      limit?: number;
    };
  };

  // Criar thread
  "POST /channels/:channel_id/threads": {
    response: DiscordChannel;
    body: {
      name: string;
      auto_archive_duration?: number;
      type?: number;
      invitable?: boolean;
      rate_limit_per_user?: number;
      applied_tags?: string[];
      message?: {
        content?: string;
        embeds?: unknown[];
      };
    };
  };

  // Entrar em thread
  "PUT /channels/:channel_id/thread-members/@me": {
    response: void;
  };

  // Sair de thread
  "DELETE /channels/:channel_id/thread-members/@me": {
    response: void;
  };

  // Obter usuário atual (bot)
  "GET /users/@me": {
    response: DiscordUser;
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
    body: EditRoleBody;
  };

  // Deletar role
  "DELETE /guilds/:guild_id/roles/:role_id": {
    response: void;
    searchParams: {
      reason?: string;
    };
  };

  // Listar webhooks de um canal
  "GET /channels/:channel_id/webhooks": {
    response: Array<{
      id: string;
      type: number;
      guild_id?: string;
      channel_id: string;
      user?: DiscordUser;
      name?: string;
      avatar?: string;
      token?: string;
      application_id?: string;
      source_guild?: unknown;
      source_channel?: unknown;
      url?: string;
    }>;
  };

  // Listar webhooks de um servidor
  "GET /guilds/:guild_id/webhooks": {
    response: Array<{
      id: string;
      type: number;
      guild_id?: string;
      channel_id: string;
      user?: DiscordUser;
      name?: string;
      avatar?: string;
      token?: string;
      application_id?: string;
      source_guild?: unknown;
      source_channel?: unknown;
      url?: string;
    }>;
  };

  // Criar webhook
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
      source_guild?: unknown;
      source_channel?: unknown;
      url?: string;
    };
    body: {
      name: string;
      avatar?: string;
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
        replied_user?: boolean;
      };
      components?: unknown[];
      files?: unknown[];
      payload_json?: string;
      attachments?: unknown[];
      flags?: number;
      thread_name?: string;
      applied_tags?: string[];
    };
    searchParams: {
      wait?: boolean;
      thread_id?: string;
    };
  };

  // Deletar webhook
  "DELETE /webhooks/:webhook_id/:webhook_token": {
    response: void;
  };
}
