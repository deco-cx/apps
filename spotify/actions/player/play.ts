import { AppContext } from "../../mod.ts";

interface Props {
  /**
   * @title Device ID
   * @description Device ID where to start playback (optional)
   */
  device_id?: string;

  /**
   * @title Context URI
   * @description Context URI (album, playlist, artist)
   */
  context_uri?: string;

  /**
   * @title URIs
   * @description List of track URIs to play
   */
  uris?: string[];

  /**
   * @title Offset Position
   * @description Initial position in the list
   */
  offset_position?: number;

  /**
   * @title Offset URI
   * @description Initial track URI
   */
  offset_uri?: string;

  /**
   * @title Position MS
   * @description Position in milliseconds to start playback
   */
  position_ms?: number;
}

/**
 * @title Play
 * @description Start or resume playback on Spotify
 */
export default async function play(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean }> {
  const {
    device_id,
    context_uri,
    uris,
    offset_position,
    offset_uri,
    position_ms,
  } = props;

  const body: any = {};

  if (context_uri) {
    body.context_uri = context_uri;
  }

  if (uris && uris.length > 0) {
    body.uris = uris;
  }

  if (offset_position !== undefined || offset_uri) {
    body.offset = {};
    if (offset_position !== undefined) body.offset.position = offset_position;
    if (offset_uri) body.offset.uri = offset_uri;
  }

  if (position_ms !== undefined) {
    body.position_ms = position_ms;
  }

  const response = await ctx.api["PUT /me/player/play"](
    { device_id },
    Object.keys(body).length > 0 ? body : undefined,
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error starting playback: ${response.status} - ${errorText}`,
    );
  }

  return { success: true };
}
