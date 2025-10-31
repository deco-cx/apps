import { OAuthClients } from "../mcp/utils/types.ts";
import { SlackApiClient, SlackAuthClient } from "./utils/client.ts";

/**
 * @description Response from Slack API with success/error information
 */
export interface SlackResponse<T = unknown> {
  ok: boolean;
  error?: string;
  response_metadata?: {
    next_cursor?: string;
    warnings?: string[];
  };
  data: T;
}

/**
 * @description A channel in Slack workspace
 */
export interface SlackChannel {
  id: string;
  name?: string;
  is_channel?: boolean;
  is_private?: boolean;
  created: number;
  creator?: string;
  is_archived: boolean;
  is_general?: boolean;
  members?: string[];
  topic?: {
    value: string;
    creator: string;
    last_set: number;
  };
  purpose?: {
    value: string;
    creator: string;
    last_set: number;
  };
  // DM specific fields
  is_im?: boolean;
  is_org_shared?: boolean;
  context_team_id?: string;
  updated?: number;
  user?: string;
  is_user_deleted?: boolean;
  priority?: number;
}

/**
 * @description A message in a Slack channel
 */
export interface SlackMessage {
  type: string;
  user?: string;
  text: string;
  ts: string;
  thread_ts?: string;
  reply_count?: number;
  reply_users_count?: number;
  latest_reply?: string;
  reply_users?: string[];
  is_locked?: boolean;
  subscribed?: boolean;
  files?: SlackFile[];
  reactions?: Array<{
    name: string;
    count: number;
    users: string[];
  }>;
  blocks?: Array<{
    type: string;
    block_id: string;
    elements: Array<{
      type: string;
      elements?: Array<{
        type: string;
        text: string;
      }>;
    }>;
  }>;
  subtype?: string;
  edited?: {
    user: string;
    ts: string;
  };
  team?: string;
  bot_id?: string;
  app_id?: string;
  bot_profile?: SlackBotProfile;
  assistant_app_thread?: {
    title: string;
    title_blocks: Array<{
      type: string;
      block_id: string;
      elements: Array<{
        type: string;
        elements: Array<{
          type: string;
          text: string;
        }>;
      }>;
    }>;
    artifacts: unknown[];
    context: Record<string, unknown>;
  };
  [key: string]: unknown;
}

/**
 * @description A bot profile in Slack
 */
export interface SlackBotProfile {
  id: string;
  app_id: string;
  user_id: string;
  name: string;
  icons: {
    image_36: string;
    image_48: string;
    image_72: string;
  };
  deleted: boolean;
  updated: number;
  team_id: string;
}

/**
 * @description A file in Slack
 */
export interface SlackFile {
  id: string;
  created: number;
  timestamp: number;
  name: string;
  title: string;
  mimetype: string;
  filetype: string;
  pretty_type: string;
  user: string;
  user_team?: string;
  editable: boolean;
  size: number;
  mode: string;
  is_external: boolean;
  external_type: string;
  is_public: boolean;
  public_url_shared: boolean;
  display_as_bot: boolean;
  username: string;
  url_private: string;
  url_private_download: string;
  media_display_type?: string;
  thumb_64?: string;
  thumb_80?: string;
  thumb_360?: string;
  thumb_360_w?: number;
  thumb_360_h?: number;
  thumb_480?: string;
  thumb_480_w?: number;
  thumb_480_h?: number;
  thumb_160?: string;
  thumb_720?: string;
  thumb_720_w?: number;
  thumb_720_h?: number;
  thumb_800?: string;
  thumb_800_w?: number;
  thumb_800_h?: number;
  thumb_960?: string;
  thumb_960_w?: number;
  thumb_960_h?: number;
  thumb_1024?: string;
  thumb_1024_w?: number;
  thumb_1024_h?: number;
  thumb_tiny?: string;
  image_exif_rotation?: number;
  original_w?: number;
  original_h?: number;
  permalink: string;
  permalink_public?: string;
  channels?: string[];
  groups?: string[];
  ims?: string[];
  comments_count?: number;
  is_starred?: boolean;
}

/**
 * @description A user profile in Slack
 */
export interface SlackUserProfile {
  avatar_hash: string;
  status_text: string;
  status_emoji: string;
  real_name: string;
  display_name: string;
  real_name_normalized: string;
  display_name_normalized: string;
  email: string;
  image_original: string;
  team: string;
}

/**
 * @description A user in Slack workspace
 */
export interface SlackUser {
  id: string;
  team_id: string;
  name: string;
  deleted: boolean;
  real_name: string;
  profile: SlackUserProfile;
  is_admin: boolean;
  is_owner: boolean;
  is_bot: boolean;
}

/**
 * @description Response from Slack auth.test endpoint
 */
export interface SlackAuthTestResponse {
  ok: boolean;
  url: string;
  team: string;
  user: string;
  team_id: string;
  user_id: string;
  bot_id?: string;
  is_enterprise_install?: boolean;
  enterprise_id?: string;
}

export type ChannelType = "public_channel" | "private_channel" | "mpim" | "im";

/**
 * @description Response from files.getUploadURLExternal endpoint
 */
export interface SlackUploadURLResponse {
  ok: boolean;
  error?: string;
  upload_url?: string;
  file_id?: string;
}

/**
 * @description Response from files.completeUploadExternal endpoint
 */
export interface SlackCompleteUploadResponse {
  ok: boolean;
  error?: string;
  files?: Array<{
    id: string;
    title?: string;
    name?: string;
    mimetype?: string;
    filetype?: string;
    permalink?: string;
    url_private?: string;
  }>;
  response_metadata?: {
    warnings?: string[];
  };
}

/**
 * @description Client for interacting with Slack APIs
 */
export class SlackClient {
  private botHeaders: { Authorization: string; "Content-Type": string };
  private oauthClient?: OAuthClients<SlackApiClient, SlackAuthClient>;

  constructor(
    botToken: string,
    oauthClient?: OAuthClients<SlackApiClient, SlackAuthClient>,
  ) {
    this.botHeaders = {
      Authorization: `Bearer ${botToken}`,
      "Content-Type": "application/json; charset=utf-8",
    };
    this.oauthClient = oauthClient;
  }

  /**
   * @description Lists all public channels in the workspace
   * @param teamId The Slack workspace/team ID
   * @param limit Maximum number of channels to return
   * @param cursor Pagination cursor for next page
   */
  async getChannels(
    teamId: string,
    limit: number = 100,
    cursor?: string,
    types: ChannelType[] = ["public_channel", "private_channel"],
  ): Promise<
    SlackResponse<{
      channels: SlackChannel[];
    }>
  > {
    const params = new URLSearchParams({
      types: types.join(","),
      exclude_archived: "false",
      limit: Math.min(limit, 1000).toString(),
      team_id: teamId,
    });

    if (cursor) {
      params.append("cursor", cursor);
    }

    const response = await fetch(
      `https://slack.com/api/conversations.list?${params}`,
      { headers: this.botHeaders },
    );

    const result = await response.json();
    return {
      ok: result.ok,
      error: result.error,
      response_metadata: result.response_metadata,
      data: {
        channels: result.channels || [],
      },
    };
  }

  /**
   * @description Joins a Slack channel
   * @param channelId The ID of the channel to join
   */
  async joinChannel(
    channelId: string,
  ): Promise<SlackResponse<{ channel: SlackChannel }>> {
    const response = await fetch("https://slack.com/api/conversations.join", {
      method: "POST",
      headers: this.botHeaders,
      body: JSON.stringify({
        channel: channelId,
      }),
    });

    const result = await response.json();
    return {
      ok: result.ok,
      error: result.error,
      response_metadata: result.response_metadata,
      data: {
        channel: result.channel,
      },
    };
  }

  /**
   * @description Posts a new message to a channel
   * @param channelId The channel ID to post to
   * @param text The message text
   * @param opts Optional parameters: thread_ts for threading, blocks for Block Kit formatting
   */
  async postMessage(
    channelId: string,
    text: string,
    opts: { thread_ts?: string; blocks?: unknown[] } = {},
  ): Promise<
    SlackResponse<{
      channel: string;
      ts: string;
      message: SlackMessage;
      warning?: string;
    }>
  > {
    const payload: Record<string, unknown> = {
      channel: channelId,
      text: text,
      ...opts,
    };
    // Remove text if blocks are provided and text is empty (Slack requires at least one of them)
    if (opts.blocks && opts.blocks.length > 0 && !text) {
      delete payload.text;
    }
    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: this.botHeaders,
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return {
      ok: result.ok,
      error: result.error,
      response_metadata: result.response_metadata,
      data: {
        channel: result.channel,
        ts: result.ts,
        message: result.message,
        warning: result.warning,
      },
    };
  }

  /**
   * @description Posts a reply to a thread
   * @param channelId The channel ID containing the thread
   * @param threadTs The timestamp of the parent message
   * @param text The reply text
   */
  async postReply(
    channelId: string,
    threadTs: string,
    text: string,
  ): Promise<
    SlackResponse<{ channel: string; ts: string; message: SlackMessage }>
  > {
    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: this.botHeaders,
      body: JSON.stringify({
        channel: channelId,
        thread_ts: threadTs,
        text: text,
      }),
    });

    const result = await response.json();
    return {
      ok: result.ok,
      error: result.error,
      response_metadata: result.response_metadata,
      data: {
        channel: result.channel,
        ts: result.ts,
        message: result.message,
      },
    };
  }

  /**
   * @description Adds a reaction emoji to a message
   * @param channelId The channel ID containing the message
   * @param timestamp The timestamp of the message
   * @param reaction The name of the emoji reaction (without ::)
   */
  async addReaction(
    channelId: string,
    timestamp: string,
    reaction: string,
  ): Promise<SlackResponse<{ channel: string; ts: string }>> {
    const response = await fetch("https://slack.com/api/reactions.add", {
      method: "POST",
      headers: this.botHeaders,
      body: JSON.stringify({
        channel: channelId,
        timestamp,
        name: reaction,
      }),
    });

    const result = await response.json();
    return {
      ok: result.ok,
      error: result.error,
      response_metadata: result.response_metadata,
      data: {
        channel: result.channel || channelId,
        ts: result.ts || timestamp,
      },
    };
  }

  /**
   * @description Gets message history from a channel
   * @param channelId The channel ID
   * @param limit Maximum number of messages to return
   * @param cursor Pagination cursor for next page
   */
  async getChannelHistory(
    channelId: string,
    limit: number = 10,
    cursor?: string,
  ): Promise<
    SlackResponse<{
      messages: SlackMessage[];
      has_more?: boolean;
      pin_count?: number;
      channel_actions_ts?: string | null;
      channel_actions_count?: number;
      warning?: string;
    }>
  > {
    const params = new URLSearchParams({
      channel: channelId,
      limit: limit.toString(),
    });

    if (cursor) {
      params.append("cursor", cursor);
    }

    const response = await fetch(
      `https://slack.com/api/conversations.history?${params}`,
      { headers: this.botHeaders },
    );

    const result = await response.json();
    return {
      ok: result.ok,
      error: result.error,
      response_metadata: result.response_metadata,
      data: {
        messages: result.messages || [],
        has_more: result.has_more,
        pin_count: result.pin_count,
        channel_actions_ts: result.channel_actions_ts,
        channel_actions_count: result.channel_actions_count,
        warning: result.warning,
      },
    };
  }

  /**
   * @description Gets all replies in a thread
   * @param channelId The channel ID containing the thread
   * @param threadTs The timestamp of the parent message
   */
  async getThreadReplies(
    channelId: string,
    threadTs: string,
  ): Promise<SlackResponse<{ messages: SlackMessage[] }>> {
    const params = new URLSearchParams({
      channel: channelId,
      ts: threadTs,
    });

    const response = await fetch(
      `https://slack.com/api/conversations.replies?${params}`,
      { headers: this.botHeaders },
    );

    const result = await response.json();
    return {
      ok: result.ok,
      error: result.error,
      response_metadata: result.response_metadata,
      data: {
        messages: result.messages || [],
      },
    };
  }

  /**
   * @description Lists all users in the workspace
   * @param teamId The Slack workspace/team ID
   * @param limit Maximum number of users to return
   * @param cursor Pagination cursor for next page
   */
  async getUsers(
    teamId: string,
    limit: number = 100,
    cursor?: string,
  ): Promise<SlackResponse<{ members: SlackUser[] }>> {
    const params = new URLSearchParams({
      limit: Math.min(limit, 200).toString(),
      team_id: teamId,
    });

    if (cursor) {
      params.append("cursor", cursor);
    }

    const response = await fetch(`https://slack.com/api/users.list?${params}`, {
      headers: this.botHeaders,
    });

    const result = await response.json();
    return {
      ok: result.ok,
      error: result.error,
      response_metadata: result.response_metadata,
      data: {
        members: result.members || [],
      },
    };
  }

  /**
   * @description Gets detailed profile information for a user
   * @param userId The ID of the user
   */
  async getUserProfile(
    userId: string,
  ): Promise<SlackResponse<{ profile: SlackUserProfile }>> {
    const params = new URLSearchParams({
      user: userId,
      include_labels: "true",
    });

    const response = await fetch(
      `https://slack.com/api/users.profile.get?${params}`,
      { headers: this.botHeaders },
    );

    const result = await response.json();
    return {
      ok: result.ok,
      error: result.error,
      response_metadata: result.response_metadata,
      data: {
        profile: result.profile || {},
      },
    };
  }

  /**
   * @description Tests authentication and returns basic information about the authenticated user/team
   */
  async testAuth(): Promise<SlackResponse<SlackAuthTestResponse>> {
    const response = await fetch("https://slack.com/api/auth.test", {
      headers: this.botHeaders,
    });

    const result = await response.json();
    return {
      ok: result.ok,
      error: result.error,
      response_metadata: result.response_metadata,
      data: result,
    };
  }

  /**
   * @description Updates an existing message in a channel
   * @param channelId The channel ID containing the message
   * @param ts The timestamp of the message to update
   * @param text The new message text
   * @param opts Optional parameters: thread_ts for threading, blocks for Block Kit formatting
   */
  async updateMessage(
    channelId: string,
    ts: string,
    text: string,
    opts: { thread_ts?: string; blocks?: unknown[] } = {},
  ): Promise<
    SlackResponse<{
      channel: string;
      ts: string;
      message: SlackMessage;
    }>
  > {
    const payload: Record<string, unknown> = {
      channel: channelId,
      ts: ts,
      text: text,
      ...opts,
    };
    // Remove text if blocks are provided and text is empty (Slack requires at least one of them)
    if (opts.blocks && opts.blocks.length > 0 && !text) {
      delete payload.text;
    }
    const response = await fetch("https://slack.com/api/chat.update", {
      method: "POST",
      headers: this.botHeaders,
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return {
      ok: result.ok,
      error: result.error,
      response_metadata: result.response_metadata,
      data: {
        channel: result.channel,
        ts: result.ts,
        message: result.message,
      },
    };
  }

  /**
   * @description Opens a direct message channel with a user
   * @param userId The user ID to open a DM with
   */
  async openDmChannel(userId: string): Promise<
    SlackResponse<{
      channel?: { id: string };
      no_op?: boolean;
      already_open?: boolean;
      warning?: string;
    }>
  > {
    const response = await fetch("https://slack.com/api/conversations.open", {
      method: "POST",
      headers: this.botHeaders,
      body: JSON.stringify({ users: userId }),
    });

    const result = await response.json();
    return {
      ok: result.ok,
      error: result.error,
      response_metadata: result.response_metadata,
      data: {
        channel: result.channel,
        no_op: result.no_op,
        already_open: result.already_open,
        warning: result.warning,
      },
    };
  }

  /**
   * @description Lists all direct message channels for the bot
   * @param limit Maximum number of DMs to return
   * @param cursor Pagination cursor for next page
   */
  async listDmChannels(
    limit: number = 100,
    cursor?: string,
  ): Promise<SlackResponse<{ channels: SlackChannel[] }>> {
    const params = new URLSearchParams({
      types: "im",
      limit: Math.min(limit, 100).toString(),
    });

    if (cursor) {
      params.append("cursor", cursor);
    }

    const response = await fetch(
      `https://slack.com/api/conversations.list?${params}`,
      { headers: this.botHeaders },
    );

    const result = await response.json();
    return {
      ok: result.ok,
      error: result.error,
      response_metadata: result.response_metadata,
      data: {
        channels: result.channels || [],
      },
    };
  }

  /**
   * @description Lists files uploaded by a specific user
   * @param userId The user ID whose files to list
   * @param count Maximum number of files to return
   * @param page Page number for pagination
   * @param types Filter by file type
   */
  async listUserFiles(
    userId: string,
    count: number = 20,
    page: number = 1,
    types: string = "all",
  ): Promise<
    SlackResponse<{
      files: SlackFile[];
      paging: {
        count: number;
        total: number;
        page: number;
        pages: number;
      };
    }>
  > {
    const params = new URLSearchParams({
      user: userId,
      count: count.toString(),
      page: page.toString(),
      types: types,
    });

    const response = await fetch(
      `https://slack.com/api/files.list?${params}`,
      { headers: this.botHeaders },
    );

    const result = await response.json();
    return {
      ok: result.ok,
      error: result.error,
      response_metadata: result.response_metadata,
      data: {
        files: result.files || [],
        paging: result.paging || {
          count: 0,
          total: 0,
          page: 1,
          pages: 0,
        },
      },
    };
  }

  /**
   * @description Uploads a file to Slack using the new v2 API (files.getUploadURLExternal + files.completeUploadExternal)
   * @param options Upload options including channel, file, filename, etc.
   */
  async uploadFileV2(options: {
    channels?: string;
    file: Uint8Array | Blob | string | File;
    filename: string;
    title?: string;
    thread_ts?: string;
    initial_comment?: string;
  }): Promise<
    SlackResponse<{
      files: Array<{
        id: string;
        title?: string;
        name?: string;
        mimetype?: string;
        filetype?: string;
        permalink?: string;
        url_private?: string;
      }>;
    }>
  > {
    // Convert file to Blob/Uint8Array for size calculation
    let fileBlob: Blob;
    let fileSize: number;

    if (typeof options.file === "string") {
      // Handle base64 or data URL
      let input = options.file;
      let mime: string | undefined;
      const m = /^data:([^;]+);base64,/.exec(input);
      if (m) {
        mime = m[1];
        input = input.slice(m[0].length);
      }
      const bytes = Uint8Array.from(atob(input), (c) => c.charCodeAt(0));
      fileBlob = new Blob([bytes], mime ? { type: mime } : undefined);
      fileSize = bytes.byteLength;
    } else if (options.file instanceof Uint8Array) {
      fileBlob = new Blob([new Uint8Array(options.file)]);
      fileSize = options.file.byteLength;
    } else {
      // Assume it's a Blob or File
      fileBlob = options.file as Blob;
      fileSize = (options.file as Blob).size;
    }

    // Step 1: Get upload URL
    const getUrlResponse = await fetch(
      "https://slack.com/api/files.getUploadURLExternal",
      {
        method: "POST",
        headers: this.botHeaders,
        body: JSON.stringify({
          filename: options.filename,
          length: fileSize,
        }),
      },
    );

    const getUrlResult: SlackUploadURLResponse = await getUrlResponse.json();
    if (!getUrlResult.ok) {
      return {
        ok: false,
        error: getUrlResult.error || "Failed to get upload URL",
        data: { files: [] },
      };
    }

    if (!getUrlResult.upload_url || !getUrlResult.file_id) {
      return {
        ok: false,
        error: "Invalid response from files.getUploadURLExternal",
        data: { files: [] },
      };
    }

    // Step 2: Upload file to the provided URL (no authorization header)
    const uploadResponse = await fetch(getUrlResult.upload_url, {
      method: "POST",
      body: fileBlob,
    });

    if (!uploadResponse.ok) {
      return {
        ok: false,
        error: `File upload failed: ${uploadResponse.statusText}`,
        data: { files: [] },
      };
    }

    // Step 3: Complete the upload
    const completePayload: Record<string, unknown> = {
      files: [{
        id: getUrlResult.file_id,
        title: options.title || options.filename,
      }],
    };

    if (options.channels) {
      completePayload.channel_id = options.channels;
    }

    if (options.thread_ts) {
      completePayload.thread_ts = options.thread_ts;
    }

    if (options.initial_comment) {
      completePayload.initial_comment = options.initial_comment;
    }

    const completeResponse = await fetch(
      "https://slack.com/api/files.completeUploadExternal",
      {
        method: "POST",
        headers: this.botHeaders,
        body: JSON.stringify(completePayload),
      },
    );

    const completeResult: SlackCompleteUploadResponse = await completeResponse
      .json();

    return {
      ok: completeResult.ok,
      error: completeResult.error,
      response_metadata: completeResult.response_metadata,
      data: {
        files: completeResult.files || [],
      },
    };
  }

  /**
   * @description Uploads a file to Slack using the legacy files.upload API
   * @deprecated This method uses files.upload which will be sunset on November 12, 2025. Use uploadFileV2 instead.
   * @param options Upload options including channels, file, filename, etc.
   */
  async uploadFile(options: {
    channels: string;
    file: string | File;
    filename: string;
    title?: string;
    initial_comment?: string;
    filetype?: string;
    thread_ts?: string;
  }): Promise<
    SlackResponse<{
      file?: SlackFile;
      warning?: string;
    }>
  > {
    // Deprecation warning
    console.warn(
      "⚠️  DEPRECATION WARNING: files.upload API will be sunset on November 12, 2025. " +
        "Please migrate to uploadFileV2() which uses the new files.getUploadURLExternal + files.completeUploadExternal flow. " +
        "See: https://docs.slack.dev/reference/methods/files.getUploadURLExternal",
    );

    const formData = new FormData();
    formData.append("channels", options.channels);
    formData.append("filename", options.filename);

    if (options.title) {
      formData.append("title", options.title);
    }

    if (options.initial_comment) {
      formData.append("initial_comment", options.initial_comment);
    }

    if (options.filetype) {
      formData.append("filetype", options.filetype);
    }

    if (options.thread_ts) formData.append("thread_ts", options.thread_ts);

    // Handle file content
    if (typeof options.file === "string") {
      // Accept raw base64 or data URL: data:<mime>;base64,<data>
      let input = options.file;
      let mime: string | undefined;
      const m = /^data:([^;]+);base64,/.exec(input);
      if (m) {
        mime = m[1];
        input = input.slice(m[0].length);
      }
      const bytes = Uint8Array.from(atob(input), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], mime ? { type: mime } : undefined);
      formData.append("file", blob, options.filename);
    } else {
      formData.append("file", options.file, options.filename);
    }

    const response = await fetch("https://slack.com/api/files.upload", {
      method: "POST",
      headers: {
        Authorization: this.botHeaders.Authorization,
      },
      body: formData,
    });

    const result = await response.json();
    return {
      ok: result.ok,
      error: result.error,
      response_metadata: result.response_metadata,
      data: {
        file: result.file,
        warning: result.warning,
      },
    };
  }
}
