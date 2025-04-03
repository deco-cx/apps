import type { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description The ID of the recording to fetch the SRT transcript for.
   */
  id: string;
}

/**
 * @name GetTranscriptSrt
 * @title Get Recording Transcript (SRT)
 * @description Fetches the transcript for a specific recording in SRT format. Requires a paid Grain seat for the authenticated user.
 */
export default async function getRecordingTranscriptSrt(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<string> {
  return await ctx.grain.getRecordingTranscriptSrt(props.id);
}
