export const SPOTIFY_SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-read-playback-position",
  "user-top-read",
  "user-library-read",
  "user-library-modify",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-follow-read",
  "user-follow-modify",
  "streaming",
];

export const SPOTIFY_SCOPES_STRING = SPOTIFY_SCOPES.join(" ");

export const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";
export const SPOTIFY_OAUTH_AUTHORIZE_URL =
  "https://accounts.spotify.com/authorize";
export const SPOTIFY_OAUTH_TOKEN_URL = "https://accounts.spotify.com/api/token";
