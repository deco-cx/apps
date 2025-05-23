export interface SlackUrlVerification {
  token: string;
  challenge: string;
  type: "url_verification";
}

export interface SlackEventCallback {
  token: string;
  team_id: string;
  context_team_id: string;
  context_enterprise_id: string | null;
  api_app_id: string;
  event: SlackEvent;
  type: "event_callback";
  event_id: string;
  event_time: number;
  authorizations: SlackAuthorization[];
  is_ext_shared_channel: boolean;
  event_context: string;
}

export interface SlackEvent {
  user: string;
  type: "message";
  ts: string;
  client_msg_id?: string;
  text: string;
  team: string;
  blocks?: unknown[];
  channel: string;
  event_ts: string;
  channel_type: string;
  bot_id?: string;
  bot_profile?: { user_id: string; [key: string]: unknown };
  files?: SlackFile[];
  [key: string]: unknown;
}

export interface SlackFile {
  id: string;
  name: string;
  mimetype: string;
  url_private: string;
  [key: string]: unknown;
}

export interface SlackAuthorization {
  enterprise_id: string | null;
  team_id: string;
  user_id: string;
  is_bot: boolean;
  is_enterprise_install: boolean;
}

export interface Attachment {
  name: string;
  contentType: string;
  url: string;
}

export type SlackWebhookProps = SlackUrlVerification | SlackEventCallback;
