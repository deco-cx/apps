import { AppContext } from "../../mod.ts";

interface Props {
  /**
   * @title Device ID
   * @description Device ID to control (optional)
   */
  device_id?: string;
}

/**
 * @title Next Track
 * @description Skip to the next track in playback
 */
export default async function next(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean }> {
  const { device_id } = props;

  const response = await ctx.client["POST /me/player/next"]({
    device_id,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error skipping to next track: ${response.status} - ${errorText}`,
    );
  }

  return { success: true };
}
