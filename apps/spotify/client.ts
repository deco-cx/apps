// Spotify API client types
export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  followers: {
    total: number;
  };
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  country: string;
  product: string;
}

export interface SpotifyDevice {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
}

export interface SpotifyPlaylistTrack {
  added_at: string;
  added_by: {
    id: string;
    display_name: string;
  };
  is_local: boolean;
  track: {
    id: string;
    name: string;
    uri: string;
    duration_ms: number;
    explicit: boolean;
    artists: Array<{
      id: string;
      name: string;
      uri: string;
    }>;
    album: {
      id: string;
      name: string;
      uri: string;
    };
  };
}

export interface SpotifyPlayback {
  device: SpotifyDevice;
  shuffle_state: boolean;
  repeat_state: string;
  timestamp: number;
  context: {
    type: string;
    uri: string;
  } | null;
  progress_ms: number;
  item: {
    id: string;
    name: string;
    uri: string;
    duration_ms: number;
    explicit: boolean;
    artists: Array<{
      id: string;
      name: string;
      uri: string;
    }>;
    album: {
      id: string;
      name: string;
      uri: string;
    };
  } | null;
  is_playing: boolean;
}

export interface AddTracksRequest {
  uris: string[];
  position?: number;
}

export interface PlayRequest {
  context_uri?: string;
  uris?: string[];
  offset?: {
    position?: number;
    uri?: string;
  };
  position_ms?: number;
}

export interface SpotifyClient {
  "GET /me": {
    response: SpotifyUser;
  };

  "GET /me/player/devices": {
    response: {
      devices: SpotifyDevice[];
    };
  };

  "GET /me/player": {
    response: SpotifyPlayback;
  };

  "PUT /me/player/play": {
    response: void;
    body: PlayRequest;
    searchParams?: {
      device_id?: string;
    };
  };

  "POST /playlists/:playlist_id/tracks": {
    response: {
      snapshot_id: string;
    };
    body: AddTracksRequest;
  };

  "PUT /me/albums": {
    response: void;
    body: {
      ids: string[];
    };
  };
}