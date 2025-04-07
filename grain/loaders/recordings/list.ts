import type { AppContext } from "../../mod.ts";
import type { GetRecordingsParams, GrainRecordingBasic } from "../../client.ts";

// Use the GetRecordingsParams interface directly for Props
export type Props = GetRecordingsParams;

/**
 * @name GetRecordings
 * @title List Recordings
 * @description Fetches a list of recordings accessible by the authenticated user. Supports pagination and optional data includes.
 */
export default async function listRecordings(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ recordings: GrainRecordingBasic[]; cursor: string | null }> {
  return await ctx.grain.getRecordings(props);
}
