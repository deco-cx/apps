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
  };
  data: T;
}

/**
 * @description A channel in Slack workspace
 */
export interface SlackChannel {
  id: string;
  name: string;
  is_channel: boolean;
  is_private: boolean;
  created: number;
  creator: string;
  is_archived: boolean;
  is_general: boolean;
  members: string[];
  topic: {
    value: string;
    creator: string;
    last_set: number;
  };
  purpose: {
    value: string;
    creator: string;
    last_set: number;
  };
}

/**
 * @description A message in a Slack channel
 */
export interface SlackMessage {
  type: string;
  user: string;
  text: string;
  ts: string;
  thread_ts?: string;
  reply_count?: number;
  reactions?: Array<{
    name: string;
    count: number;
    users: string[];
  }>;
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
 * @description A file in Slack workspace
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
  mode: string;
  editable: boolean;
  is_external: boolean;
  external_type: string;
  size: number;
  url_private: string;
  url_private_download: string;
  permalink: string;
  permalink_public?: string;
  edit_link?: string;
  preview?: string;
  preview_highlight?: string;
  lines?: number;
  lines_more?: number;
  is_public: boolean;
  public_url_shared: boolean;
  display_as_bot: boolean;
  username?: string;
  url?: string;
  thumb_64?: string;
  thumb_80?: string;
  thumb_360?: string;
  thumb_360_gif?: string;
  thumb_360_w?: number;
  thumb_360_h?: number;
  thumb_480?: string;
  thumb_480_w?: number;
  thumb_480_h?: number;
  thumb_160?: string;
  image_exif_rotation?: number;
  original_w?: number;
  original_h?: number;
  channels?: string[];
  groups?: string[];
  ims?: string[];
  comments_count?: number;
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
    limit: number = 1000,
    cursor?: string,
    types: ChannelType[] = ["public_channel", "private_channel"],
  ): Promise<
    { channels: SlackChannel[]; response_metadata?: { next_cursor?: string } }
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

    return response.json();
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

    return response.json();
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
    { channel: string; ts: string; message: SlackMessage; ok: boolean }
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

    return response.json();
  }

  /**
   * @description Opens a direct message conversation with a user
   * @param userId The ID of the user to open a DM conversation with
   */
  async openDmChannel(
    userId: string,
  ): Promise<
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
      body: JSON.stringify({
        users: userId,
      }),
    });

    const result = await response.json();
    return {
      ok: result.ok,
      error: result.error,
      data: {
        channel: result.channel,
        no_op: result.no_op,
        already_open: result.already_open,
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

    return response.json();
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
        timestamp: timestamp,
        name: reaction,
      }),
    });

    return response.json();
  }

  /**
   * @description Gets message history from a channel
   * @param channelId The channel ID
   * @param limit Maximum number of messages to return
   */
  async getChannelHistory(
    channelId: string,
    limit: number = 10,
  ): Promise<SlackResponse<{ messages: SlackMessage[] }>> {
    const params = new URLSearchParams({
      channel: channelId,
      limit: limit.toString(),
    });

    const response = await fetch(
      `https://slack.com/api/conversations.history?${params}`,
      { headers: this.botHeaders },
    );

    return response.json();
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

    return response.json();
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

    return response.json();
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

    return response.json();
  }

  /**
   * @description Tests authentication and returns basic information about the authenticated user/team
   */
  async testAuth(): Promise<SlackResponse<SlackAuthTestResponse>> {
    const response = await fetch("https://slack.com/api/auth.test", {
      headers: this.botHeaders,
    });

    return response.json();
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
    { channel: string; ts: string; message: SlackMessage; ok: boolean }
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
    return response.json();
  }

  /**
   * @description Lists files uploaded by a specific user
   * @param userId The ID of the user whose files to list
   * @param count Maximum number of files to return (default: 20, max: 1000)
   * @param page Page number for pagination (default: 1)
   * @param types Filter by file type (default: 'all')
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
      count: Math.min(count, 1000).toString(),
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
      data: {
        files: result.files || [],
        paging: result.paging || { count: 0, total: 0, page: 1, pages: 0 },
      },
    };
  }

  /**
   * @description Lists all direct message channels
   * @param limit Maximum number of channels to return (default: 100)
   * @param cursor Pagination cursor for next page
   */
  async listDmChannels(
    limit: number = 100,
    cursor?: string,
  ): Promise<SlackResponse<{ channels: SlackChannel[] }>> {
    const params = new URLSearchParams({
      types: "im",
      exclude_archived: "false",
      limit: Math.min(limit, 1000).toString(),
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
   * @description Uploads a file using the new V2 API (files.getUploadURLExternal + files.completeUploadExternal)
   * @param options Upload options including file, filename, channels, etc.
   */
  async uploadFileV2(options: {
    channels: string;
    file: string | Uint8Array | Blob | File;
    filename: string;
    title?: string;
    initial_comment?: string;
    thread_ts?: string;
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
    try {
      // Step 1: Get upload URL
      const uploadUrlResponse = await fetch(
        "https://slack.com/api/files.getUploadURLExternal",
        {
          method: "POST",
          headers: this.botHeaders,
          body: JSON.stringify({
            filename: options.filename,
            length: await this.getFileSize(options.file),
          }),
        },
      );

      const uploadUrlResult = await uploadUrlResponse.json();
      if (!uploadUrlResult.ok) {
        return {
          ok: false,
          error: uploadUrlResult.error || "Failed to get upload URL",
          data: { files: [] },
        };
      }

      // Step 2: Upload file to the obtained URL
      const formData = new FormData();
      let fileBlob: Blob;

      if (typeof options.file === "string") {
        // Handle base64 or data URL
        if (options.file.startsWith("data:")) {
          const response = await fetch(options.file);
          fileBlob = await response.blob();
        } else {
          // Assume base64
          const binaryString = atob(options.file);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          fileBlob = new Blob([bytes]);
        }
      } else if (options.file instanceof Uint8Array) {
        fileBlob = new Blob([new Uint8Array(options.file)]);
      } else {
        fileBlob = options.file as Blob;
      }

      formData.append("file", fileBlob, options.filename);

      const uploadResponse = await fetch(uploadUrlResult.upload_url, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        return {
          ok: false,
          error: "Failed to upload file to external URL",
          data: { files: [] },
        };
      }

      // Step 3: Complete the upload
      const completePayload: Record<string, unknown> = {
        files: [
          {
            id: uploadUrlResult.file_id,
            title: options.title || options.filename,
          },
        ],
        channel_id: options.channels,
      };

      if (options.initial_comment) {
        completePayload.initial_comment = options.initial_comment;
      }

      if (options.thread_ts) {
        completePayload.thread_ts = options.thread_ts;
      }

      const completeResponse = await fetch(
        "https://slack.com/api/files.completeUploadExternal",
        {
          method: "POST",
          headers: this.botHeaders,
          body: JSON.stringify(completePayload),
        },
      );

      const completeResult = await completeResponse.json();

      return {
        ok: completeResult.ok,
        error: completeResult.error,
        data: {
          files: completeResult.files || [],
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
        data: { files: [] },
      };
    }
  }

  /**
   * @description Helper method to get file size
   * @private
   */
  private async getFileSize(
    file: string | Uint8Array | Blob | File,
  ): Promise<number> {
    if (typeof file === "string") {
      if (file.startsWith("data:")) {
        const response = await fetch(file);
        const blob = await response.blob();
        return blob.size;
      } else {
        // Assume base64
        const binaryString = atob(file);
        return binaryString.length;
      }
    } else if (file instanceof Uint8Array) {
      return file.length;
    } else {
      return (file as Blob).size;
    }
  }
}
