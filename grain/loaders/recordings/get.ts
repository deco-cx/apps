import type { AppContext } from "../../mod.ts";
import type {
  GetRecordingByIdParams,
  GrainRecordingDetailed,
} from "../../client.ts";

// Combine ID with the optional params for Props
export interface Props extends GetRecordingByIdParams {
  /**
   * @description The ID of the recording to fetch.
   */
  id: string;
}

/**
 * @name GetRecording
 * @title Get Recording Details
 * @description Fetches detailed information for a specific recording by its ID.
 */
export default async function getRecordingById(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<GrainRecordingDetailed> {
  const { id, ...params } = props;
  return await ctx.grain.getRecordingById(id, params);
}
