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
 * @description Client for interacting with Slack APIs
 */
export class SlackClient {
  private botHeaders: { Authorization: string; "Content-Type": string };

  constructor(botToken: string) {
    this.botHeaders = {
      Authorization: `Bearer ${botToken}`,
      "Content-Type": "application/json",
    };
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
  ): Promise<SlackResponse<{ channels: SlackChannel[] }>> {
    const params = new URLSearchParams({
      types: "public_channel",
      exclude_archived: "true",
      limit: Math.min(limit, 200).toString(),
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
   * @description Posts a new message to a channel
   * @param channelId The channel ID to post to
   * @param text The message text
   */
  async postMessage(
    channelId: string,
    text: string,
  ): Promise<
    SlackResponse<{ channel: string; ts: string; message: SlackMessage }>
  > {
    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: this.botHeaders,
      body: JSON.stringify({
        channel: channelId,
        text: text,
      }),
    });

    return response.json();
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
}
