import type { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description The ID of the recording to fetch the VTT transcript for.
   */
  id: string;
}

/**
 * @name GetTranscriptVtt
 * @title Get Recording Transcript (VTT)
 * @description Fetches the transcript for a specific recording in VTT format. Requires a paid Grain seat for the authenticated user.
 */
export default async function getRecordingTranscriptVtt(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<string> {
  return await ctx.grain.getRecordingTranscriptVtt(props.id);
}
