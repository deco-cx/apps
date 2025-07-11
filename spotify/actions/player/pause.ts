import { AppContext } from "../../mod.ts";

interface Props {
  /**
   * @title Device ID
   * @description Device ID where to pause playback (optional)
   */
  device_id?: string;
}

/**
 * @title Pause
 * @description Pause playback on Spotify
 */
export default async function pause(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean }> {
  const { device_id } = props;

  const response = await ctx.client["PUT /me/player/pause"]({
    device_id,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error pausing playback: ${response.status} - ${errorText}`,
    );
  }

  return { success: true };
}
