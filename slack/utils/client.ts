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
    response: SlackResponse<{
      channels: SlackChannel[];
    }>;
  };
  "POST /chat.postMessage": {
    json: {
      channel: string;
      text: string;
      thread_ts?: string;
      blocks?: unknown[];
    };
    response: SlackResponse<{
      channel: string;
      ts: string;
      message: SlackMessage;
      warning?: string;
      response_metadata?: {
        warnings?: string[];
      };
    }>;
  };
  "POST /reactions.add": {
    json: {
      channel: string;
      ts: string;
      name: string;
    };
    response: SlackResponse<{ channel: string; ts: string }>;
  };
  "GET /conversations.history": {
    searchParams: {
      channel: string;
      limit?: string;
      cursor?: string;
    };
    response: SlackResponse<{
      messages: SlackMessage[];
      has_more?: boolean;
      pin_count?: number;
      channel_actions_ts?: string | null;
      channel_actions_count?: number;
      warning?: string;
    }>;
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
    response: SlackResponse<{
      channel: { id: string };
      no_op?: boolean;
      already_open?: boolean;
      warning?: string;
      response_metadata?: {
        warnings?: string[];
      };
    }>;
  };
  "GET /files.list": {
    searchParams: {
      user: string;
      count?: string;
      page?: string;
      types?: string;
    };
    response: SlackResponse<{
      files: SlackFile[];
      paging: {
        count: number;
        total: number;
        page: number;
        pages: number;
      };
    }>;
  };
  "POST /files.upload": {
    body: FormData;
    response: SlackResponse<{
      file: SlackFile;
      warning?: string;
      response_metadata?: {
        warnings?: string[];
      };
    }>;
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
