// ============================
// Spotify API Types
// ============================

export interface SpotifyExternalUrls {
  spotify: string;
}

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyFollowers {
  href: string | null;
  total: number;
}

export interface SpotifyUser {
  display_name: string | null;
  external_urls: SpotifyExternalUrls;
  followers: SpotifyFollowers;
  href: string;
  id: string;
  images: SpotifyImage[];
  type: "user";
  uri: string;
  email?: string;
  country?: string;
  explicit_content?: {
    filter_enabled: boolean;
    filter_locked: boolean;
  };
  product?: string;
}

export interface SpotifyArtist {
  external_urls: SpotifyExternalUrls;
  followers: SpotifyFollowers;
  genres: string[];
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  popularity: number;
  type: "artist";
  uri: string;
}

export interface SpotifySimplifiedArtist {
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  name: string;
  type: "artist";
  uri: string;
}

export interface SpotifyAlbum {
  album_type: "album" | "single" | "compilation";
  total_tracks: number;
  available_markets: string[];
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  release_date: string;
  release_date_precision: "year" | "month" | "day";
  restrictions?: {
    reason: string;
  };
  type: "album";
  uri: string;
  artists: SpotifySimplifiedArtist[];
  tracks: {
    href: string;
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
    items: SpotifySimplifiedTrack[];
  };
  copyrights: {
    text: string;
    type: "C" | "P";
  }[];
  external_ids: {
    isrc?: string;
    ean?: string;
    upc?: string;
  };
  genres: string[];
  label: string;
  popularity: number;
}

export interface SpotifySimplifiedAlbum {
  album_type: "album" | "single" | "compilation";
  total_tracks: number;
  available_markets: string[];
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  release_date: string;
  release_date_precision: "year" | "month" | "day";
  restrictions?: {
    reason: string;
  };
  type: "album";
  uri: string;
  artists: SpotifySimplifiedArtist[];
}

export interface SpotifyTrack {
  album: SpotifySimplifiedAlbum;
  artists: SpotifySimplifiedArtist[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: {
    isrc?: string;
    ean?: string;
    upc?: string;
  };
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  is_playable?: boolean;
  linked_from?: {
    external_urls: SpotifyExternalUrls;
    href: string;
    id: string;
    type: "track";
    uri: string;
  };
  restrictions?: {
    reason: string;
  };
  name: string;
  popularity: number;
  preview_url: string | null;
  track_number: number;
  type: "track";
  uri: string;
  is_local: boolean;
}

export interface SpotifySimplifiedTrack {
  artists: SpotifySimplifiedArtist[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  is_playable?: boolean;
  linked_from?: {
    external_urls: SpotifyExternalUrls;
    href: string;
    id: string;
    type: "track";
    uri: string;
  };
  restrictions?: {
    reason: string;
  };
  name: string;
  preview_url: string | null;
  track_number: number;
  type: "track";
  uri: string;
  is_local: boolean;
}

export interface SpotifyPlaylist {
  collaborative: boolean;
  description: string | null;
  external_urls: SpotifyExternalUrls;
  followers: SpotifyFollowers;
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  owner: SpotifyUser;
  public: boolean | null;
  snapshot_id: string;
  tracks: {
    href: string;
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
    items: SpotifyPlaylistTrack[];
  };
  type: "playlist";
  uri: string;
}

export interface SpotifyPlaylistTrack {
  added_at: string;
  added_by: SpotifyUser;
  is_local: boolean;
  track: SpotifyTrack | null;
}

export interface SpotifyDevice {
  id: string | null;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number | null;
}

export interface SpotifyPlaybackState {
  device: SpotifyDevice;
  repeat_state: "off" | "track" | "context";
  shuffle_state: boolean;
  context: {
    type: "artist" | "playlist" | "album" | "show";
    href: string;
    external_urls: SpotifyExternalUrls;
    uri: string;
  } | null;
  timestamp: number;
  progress_ms: number | null;
  is_playing: boolean;
  item: SpotifyTrack | null;
  currently_playing_type: "track" | "episode" | "ad" | "unknown";
  actions: {
    interrupting_playback?: boolean;
    pausing?: boolean;
    resuming?: boolean;
    seeking?: boolean;
    skipping_next?: boolean;
    skipping_prev?: boolean;
    toggling_repeat_context?: boolean;
    toggling_shuffle?: boolean;
    toggling_repeat_track?: boolean;
    transferring_playback?: boolean;
  };
}

export interface SpotifySearchResult {
  tracks?: {
    href: string;
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
    items: SpotifyTrack[];
  };
  artists?: {
    href: string;
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
    items: SpotifyArtist[];
  };
  albums?: {
    href: string;
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
    items: SpotifySimplifiedAlbum[];
  };
  playlists?: {
    href: string;
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
    items: SpotifyPlaylist[];
  };
}

export interface SpotifyPagingObject<T> {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: T[];
}

// ============================
// Spotify Client Interface
// ============================

export interface SpotifyClient {
  // Albums
  "GET /albums/:id": {
    response: SpotifyAlbum;
    searchParams?: {
      market?: string;
    };
  };

  "GET /albums": {
    response: {
      albums: SpotifyAlbum[];
    };
    searchParams: {
      ids: string;
      market?: string;
    };
  };

  "GET /albums/:id/tracks": {
    response: SpotifyPagingObject<SpotifySimplifiedTrack>;
    searchParams?: {
      market?: string;
      limit?: number;
      offset?: number;
    };
  };

  // Artists
  "GET /artists/:id": {
    response: SpotifyArtist;
  };

  "GET /artists": {
    response: {
      artists: SpotifyArtist[];
    };
    searchParams: {
      ids: string;
    };
  };

  "GET /artists/:id/albums": {
    response: SpotifyPagingObject<SpotifySimplifiedAlbum>;
    searchParams?: {
      include_groups?: string;
      market?: string;
      limit?: number;
      offset?: number;
    };
  };

  "GET /artists/:id/top-tracks": {
    response: {
      tracks: SpotifyTrack[];
    };
    searchParams?: {
      market?: string;
    };
  };

  "GET /artists/:id/related-artists": {
    response: {
      artists: SpotifyArtist[];
    };
  };

  // Tracks
  "GET /tracks/:id": {
    response: SpotifyTrack;
    searchParams?: {
      market?: string;
    };
  };

  "GET /tracks": {
    response: {
      tracks: SpotifyTrack[];
    };
    searchParams: {
      ids: string;
      market?: string;
    };
  };

  // Search
  "GET /search": {
    response: SpotifySearchResult;
    searchParams: {
      q: string;
      type: string;
      market?: string;
      limit?: number;
      offset?: number;
      include_external?: string;
    };
  };

  // User Profile
  "GET /me": {
    response: SpotifyUser;
  };

  "GET /me/playlists": {
    response: SpotifyPagingObject<SpotifyPlaylist>;
    searchParams?: {
      limit?: number;
      offset?: number;
    };
  };

  // Playlists
  "GET /playlists/:playlist_id": {
    response: SpotifyPlaylist;
    searchParams?: {
      market?: string;
      fields?: string;
      additional_types?: string;
    };
  };

  "GET /playlists/:playlist_id/tracks": {
    response: SpotifyPagingObject<SpotifyPlaylistTrack>;
    searchParams?: {
      market?: string;
      fields?: string;
      limit?: number;
      offset?: number;
      additional_types?: string;
    };
  };

  "POST /playlists/:playlist_id/tracks": {
    response: {
      snapshot_id: string;
    };
    body: {
      uris?: string[];
      position?: number;
    };
    searchParams?: {
      uris?: string;
      position?: number;
    };
  };

  "PUT /playlists/:playlist_id/tracks": {
    response: {
      snapshot_id: string;
    };
    body?: {
      uris?: string[];
      range_start?: number;
      insert_before?: number;
      range_length?: number;
      snapshot_id?: string;
    };
    searchParams?: {
      uris?: string;
    };
  };

  "DELETE /playlists/:playlist_id/tracks": {
    response: {
      snapshot_id: string;
    };
    body: {
      tracks: {
        uri: string;
        positions?: number[];
      }[];
      snapshot_id?: string;
    };
  };

  // Library
  "GET /me/albums": {
    response: SpotifyPagingObject<{
      added_at: string;
      album: SpotifyAlbum;
    }>;
    searchParams?: {
      limit?: number;
      offset?: number;
      market?: string;
    };
  };

  "PUT /me/albums": {
    response: void;
    body: {
      ids: string[];
    };
    searchParams?: {
      ids?: string;
    };
  };

  "DELETE /me/albums": {
    response: void;
    body: {
      ids: string[];
    };
    searchParams?: {
      ids?: string;
    };
  };

  "GET /me/albums/contains": {
    response: boolean[];
    searchParams: {
      ids: string;
    };
  };

  "GET /me/tracks": {
    response: SpotifyPagingObject<{
      added_at: string;
      track: SpotifyTrack;
    }>;
    searchParams?: {
      market?: string;
      limit?: number;
      offset?: number;
    };
  };

  "PUT /me/tracks": {
    response: void;
    body: {
      ids: string[];
    };
    searchParams?: {
      ids?: string;
    };
  };

  "DELETE /me/tracks": {
    response: void;
    body: {
      ids: string[];
    };
    searchParams?: {
      ids?: string;
    };
  };

  "GET /me/tracks/contains": {
    response: boolean[];
    searchParams: {
      ids: string;
    };
  };

  // Player
  "GET /me/player": {
    response: SpotifyPlaybackState | null;
    searchParams?: {
      market?: string;
      additional_types?: string;
    };
  };

  "PUT /me/player": {
    response: void;
    body: {
      device_ids: string[];
      play?: boolean;
    };
  };

  "GET /me/player/devices": {
    response: {
      devices: SpotifyDevice[];
    };
  };

  "GET /me/player/currently-playing": {
    response: SpotifyPlaybackState | null;
    searchParams?: {
      market?: string;
      additional_types?: string;
    };
  };

  "PUT /me/player/play": {
    response: void;
    body: {
      context_uri?: string;
      uris?: string[];
      offset?: {
        position?: number;
        uri?: string;
      };
      position_ms?: number;
    };
    searchParams?: {
      device_id?: string;
    };
  };

  "PUT /me/player/pause": {
    response: void;
    searchParams?: {
      device_id?: string;
    };
  };

  "POST /me/player/next": {
    response: void;
    searchParams?: {
      device_id?: string;
    };
  };

  "POST /me/player/previous": {
    response: void;
    searchParams?: {
      device_id?: string;
    };
  };

  "PUT /me/player/seek": {
    response: void;
    searchParams: {
      position_ms: number;
      device_id?: string;
    };
  };

  "PUT /me/player/repeat": {
    response: void;
    searchParams: {
      state: "track" | "context" | "off";
      device_id?: string;
    };
  };

  "PUT /me/player/volume": {
    response: void;
    searchParams: {
      volume_percent: number;
      device_id?: string;
    };
  };

  "PUT /me/player/shuffle": {
    response: void;
    searchParams: {
      state: boolean;
      device_id?: string;
    };
  };

  "GET /me/player/recently-played": {
    response: {
      items: {
        track: SpotifyTrack;
        played_at: string;
        context: {
          type: "artist" | "playlist" | "album" | "show";
          href: string;
          external_urls: SpotifyExternalUrls;
          uri: string;
        } | null;
      }[];
      next: string | null;
      cursors: {
        after: string;
        before: string;
      };
      limit: number;
      href: string;
    };
    searchParams?: {
      limit?: number;
      after?: number;
      before?: number;
    };
  };

  "GET /me/player/queue": {
    response: {
      currently_playing: SpotifyTrack | null;
      queue: SpotifyTrack[];
    };
  };

  "GET /me/top/artists": {
    response: SpotifyPagingObject<SpotifyArtist>;
    searchParams?: {
      time_range?: "short_term" | "medium_term" | "long_term";
      limit?: number;
      offset?: number;
    };
  };

  "GET /me/top/tracks": {
    response: SpotifyPagingObject<SpotifyTrack>;
    searchParams?: {
      time_range?: "short_term" | "medium_term" | "long_term";
      limit?: number;
      offset?: number;
    };
  };

  // Following
  "GET /me/following": {
    response: {
      artists: SpotifyPagingObject<SpotifyArtist>;
    };
    searchParams: {
      type: "artist";
      after?: string;
      limit?: number;
    };
  };

  "PUT /me/following": {
    response: void;
    body: {
      ids: string[];
    };
    searchParams: {
      type: "artist" | "user";
      ids: string;
    };
  };

  "DELETE /me/following": {
    response: void;
    body: {
      ids: string[];
    };
    searchParams: {
      type: "artist" | "user";
      ids: string;
    };
  };

  "GET /me/following/contains": {
    response: boolean[];
    searchParams: {
      type: "artist" | "user";
      ids: string;
    };
  };

  // Browse
  "GET /browse/featured-playlists": {
    response: {
      message: string;
      playlists: SpotifyPagingObject<SpotifyPlaylist>;
    };
    searchParams?: {
      country?: string;
      limit?: number;
      offset?: number;
      timestamp?: string;
    };
  };
}

// Auth client for OAuth token operations
export interface AuthClient {
  "POST /api/token": {
    response: {
      access_token: string;
      token_type: string;
      scope: string;
      expires_in: number;
      refresh_token: string;
    };
    body: {
      grant_type: "authorization_code" | "refresh_token";
      code?: string;
      redirect_uri?: string;
      refresh_token?: string;
    };
  };
}
