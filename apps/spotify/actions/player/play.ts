import { AppContext } from "../../mod.ts";
import { PlayRequest } from "../../client.ts";

interface Props {
  /**
   * @title Context URI
   * @description Spotify URI of the context to play (album, artist, playlist)
   */
  contextUri?: string;

  /**
   * @title Track URIs
   * @description Comma-separated list of Spotify track URIs to play
   */
  trackUris?: string;

  /**
   * @title Position
   * @description Position to start playback at (in milliseconds)
   */
  positionMs?: number;

  /**
   * @title Device ID
   * @description The device ID to play on (optional)
   */
  deviceId?: string;

  /**
   * @title Offset Position
   * @description Position in playlist/album to start at
   */
  offsetPosition?: number;

  /**
   * @title Offset URI
   * @description URI to start playback at
   */
  offsetUri?: string;
}

/**
 * @title Start/Resume Playback
 * @description Start or resume playback on the user's active device
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  const { 
    contextUri, 
    trackUris, 
    positionMs, 
    deviceId, 
    offsetPosition, 
    offsetUri 
  } = props;

  // Create properly typed request body
  const body: PlayRequest = {};

  if (contextUri) {
    body.context_uri = contextUri;
  }

  if (trackUris) {
    body.uris = trackUris.split(",").map((uri) => uri.trim());
  }

  if (positionMs !== undefined) {
    body.position_ms = positionMs;
  }

  if (offsetPosition !== undefined || offsetUri) {
    body.offset = {};
    if (offsetPosition !== undefined) {
      body.offset.position = offsetPosition;
    }
    if (offsetUri) {
      body.offset.uri = offsetUri;
    }
  }

  const searchParams = deviceId ? { device_id: deviceId } : undefined;

  await ctx.state.api["PUT /me/player/play"](
    searchParams || {},
    { body }
  );
};

export default action;