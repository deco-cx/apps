// deno-lint-ignore-file no-explicit-any
// Discord API client interface for MCP binding

export interface DiscordWebhookPayload {
  id: string;
  type: number;
  token: string;
  application_id?: string;
  guild_id?: string;
  channel_id?: string;
  member?: any;
  user?: any;
  data?: any;
  message?: any;
  // ...other Discord interaction fields
}

export interface DiscordClient {
  // Send a message to a Discord webhook
  "POST /webhooks/:webhookId/:webhookToken": {
    response: any;
    body: {
      content: string;
      username?: string;
      avatar_url?: string;
      embeds?: any[];
      // ...other Discord message fields
    };
  };
  // OAuth token exchange
  "POST /oauth2/token": {
    response: {
      access_token: string;
      token_type: string;
      expires_in: number;
      refresh_token: string;
      scope: string;
    };
    body: {
      client_id: string;
      client_secret: string;
      grant_type: string;
      code: string;
      redirect_uri: string;
    };
  };
}
