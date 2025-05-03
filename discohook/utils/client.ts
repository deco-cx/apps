import { DiscordMessage, DiscordWebhookResponse } from "./types.ts";

export interface DiscordWebhookClient {
  "POST /:webhookId/:webhookToken": {
    searchParams: {
      wait: boolean;
      thread_id?: string;
    };
    response: DiscordWebhookResponse;
    body: DiscordMessage;
  };
}
