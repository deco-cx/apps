import { AppContext } from "../../mod.ts";

interface Props {
  /**
   * @title Position (ms)
   * @description Position in milliseconds to seek to in the track
   */
  position_ms: number;

  /**
   * @title Device ID
   * @description Device ID to control (optional)
   */
  device_id?: string;
}

/**
 * @title Seek Track Position
 * @description Seek to a specific position in the current track
 */
export default async function seek(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean }> {
  const { position_ms, device_id } = props;

  if (position_ms < 0) {
    throw new Error("Position must be greater than or equal to 0");
  }

  const response = await ctx.client["PUT /me/player/seek"]({
    position_ms,
    device_id,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error seeking position: ${response.status} - ${errorText}`,
    );
  }

  return { success: true };
}
