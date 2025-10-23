export const SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube.force-ssl",
];

export const API_URL = "https://www.googleapis.com/youtube/v3";
export const OAUTH_URL = "https://oauth2.googleapis.com";
export const OAUTH_URL_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";

// Common YouTube API parts
export const YOUTUBE_PARTS = {
  SNIPPET: "snippet",
  CONTENT_DETAILS: "contentDetails",
  STATISTICS: "statistics",
  STATUS: "status",
  ID: "id",
  LOCALIZATIONS: "localizations",
  PLAYER: "player",
  RECORDING_DETAILS: "recordingDetails",
  SUGGESTIONS: "suggestions",
  TOPIC_DETAILS: "topicDetails",
} as const;

// Common default values
export const DEFAULT_MAX_RESULTS = 25;
export const DEFAULT_ORDER = "relevance";
export const DEFAULT_PART = YOUTUBE_PARTS.SNIPPET;

// Common error messages
export const COMMON_ERROR_MESSAGES = {
  MISSING_VIDEO_ID: "Video ID is required",
  MISSING_CHANNEL_ID: "Channel ID is required",
  MISSING_QUERY: "Search query is required",
  MISSING_PLAYLIST_ID: "Playlist ID is required",
  INVALID_PARAMETERS: "Invalid parameters provided",
  AUTHENTICATION_REQUIRED: "Authentication is required for this operation",
} as const;

export const YOUTUBE_ERROR_MESSAGES: Record<string, string> = {
  "400": "Invalid request - check the provided parameters",
  "401": "Authentication token is invalid or expired",
  "403": "Access denied - check YouTube permissions",
  "404": "Resource not found",
  "429": "Request limit exceeded - try again later",
  "500": "YouTube server internal error",
  "503": "Service temporarily unavailable",
  "quotaExceeded": "YouTube API quota exceeded",
  "accessNotConfigured": "YouTube API not configured for this project",
  "insufficientPermissions": "Insufficient permissions for this operation",
  "videoNotFound": "Video not found or private",
  "channelNotFound": "Channel not found",
  "playlistNotFound": "Playlist not found",
};
