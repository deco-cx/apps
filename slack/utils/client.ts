import {
  SlackChannel,
  SlackFile,
  SlackMessage,
  SlackResponse,
  SlackUser,
  SlackUserProfile,
} from "../client.ts";

// Slack API Client Interface for OAuth
export interface SlackApiClient {
  "GET /conversations.list": {
    searchParams: {
      types?: string;
      exclude_archived?: string;
      limit?: string;
      team_id?: string;
      cursor?: string;
    };
    response: SlackResponse<{ channels: SlackChannel[] }>;
  };
  "POST /chat.postMessage": {
    json: {
      channel: string;
      text: string;
      thread_ts?: string;
    };
    response: SlackResponse<
      { channel: string; ts: string; message: SlackMessage }
    >;
  };
  "POST /reactions.add": {
    json: {
      channel: string;
      timestamp: string;
      name: string;
    };
    response: SlackResponse<{ channel: string; ts: string }>;
  };
  "GET /conversations.history": {
    searchParams: {
      channel: string;
      limit?: string;
    };
    response: SlackResponse<{ messages: SlackMessage[] }>;
  };
  "GET /conversations.replies": {
    searchParams: {
      channel: string;
      ts: string;
    };
    response: SlackResponse<{ messages: SlackMessage[] }>;
  };
  "GET /users.list": {
    searchParams: {
      limit?: string;
      team_id?: string;
      cursor?: string;
    };
    response: SlackResponse<{ members: SlackUser[] }>;
  };
  "GET /users.profile.get": {
    searchParams: {
      user: string;
    };
    response: SlackResponse<{ profile: SlackUserProfile }>;
  };
  "POST /conversations.open": {
    json: {
      users: string;
    };
    response: SlackResponse<{ channel: { id: string } }>;
  };
  "GET /files.info": {
    searchParams: {
      file: string;
    };
    response: SlackResponse<{ file: SlackFile }>;
  };
}

// OAuth response type for Slack
export interface SlackOAuthResponse {
  ok: boolean;
  access_token: string;
  token_type: string;
  scope: string;
  bot_user_id: string;
  app_id: string;
  team: {
    name: string;
    id: string;
  };
  enterprise?: {
    name: string;
    id: string;
  };
  authed_user: {
    id: string;
    scope: string;
    access_token: string;
    token_type: string;
  };
}

// Auth client for token operations
export interface SlackAuthClient {
  "POST /oauth.v2.access": {
    searchParams: {
      code: string;
      client_id: string;
      client_secret: string;
      redirect_uri: string;
    };
    response: SlackOAuthResponse;
  };
}
