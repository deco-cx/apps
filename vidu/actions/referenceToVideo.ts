import { AppContext } from "../mod.ts";
import type {
  ReferenceToVideoRequestBody,
  ReferenceToVideoResponseBody,
} from "../client.ts";
import { PREVIEW_URL } from "../loaders/resultPreview.ts";
import { getInstallId } from "../utils.ts";
export type Props = ReferenceToVideoRequestBody;

export interface Result {
  /**
   * @title Status
   * @description The status of the action.
   */
  status: "success";
  /**
   * @title Preview URL
   * @description The URL of the preview of the video. Render this URL in the UI to show the user the preview of the video.
   */
  previewUrl: string;
  /**
   * @title Message
   * @description A message to the user.
   */
  message: string;
}

/**
 * @title Reference to Video
 * @description Generates a video from reference images using the Vidu API. Allows for consistent subjects across the generated video.
 * @name REFERENCE_TO_VIDEO
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ReferenceToVideoResponseBody | Result> => {
  const url = new URL(req.url);
  const installId = getInstallId(url);

  const payload = {
    ...props,
    model: props.model ?? "vidu2.0",
  } as unknown as ReferenceToVideoRequestBody; // Type assertion to satisfy TypeScript

  const response = await ctx.api["POST /ent/v2/reference2video"]({}, {
    body: payload,
  });

  const result = await response.json();

  if (result.state !== "failed") {
    return {
      status: "success",
      previewUrl:
        `${PREVIEW_URL}&generationId=${result.task_id}&presignedUrl=${props.presignedUrl}&installId=${installId}`,
      message:
        "Video generation started. The video will be available at the previewUrl.",
    };
  }

  return result;
};

export default action;
