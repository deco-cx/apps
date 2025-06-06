import { AppContext } from "../mod.ts";
import type {
  StartEndToVideoRequestBody,
  StartEndToVideoResponseBody,
} from "../client.ts";
import { PREVIEW_URL } from "../loaders/resultPreview.ts";
import { getInstallId } from "../utils.ts";

export type Props = StartEndToVideoRequestBody;

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
 * @title Start-End to Video
 * @name START_END_TO_VIDEO
 * @description Generates a video that smoothly transitions from a start frame to an end frame using the Vidu API.
 *
 * This action requires exactly two images:
 * - The first image is used as the starting frame of the video
 * - The second image is used as the ending frame of the video
 *
 * The model will create a smooth, fluid transition between these two frames.
 * For best results:
 * - The pixel density of both images should be similar (ratio between 0.8 and 1.25)
 * - The prompt should describe the desired motion/transition between frames
 * - The subjects in both images should be related for more coherent results
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<StartEndToVideoResponseBody | Result> => {
  // Validate that exactly 2 images are provided
  if (props.images.length !== 2) {
    throw new Error(
      "Start-End to Video requires exactly 2 images - the first is used as the start frame and the second as the end frame.",
    );
  }

  const url = new URL(req.url);
  const installId = getInstallId(url);

  const payload = {
    ...props,
    model: props.model ?? "vidu2.0",
  } as unknown as StartEndToVideoRequestBody; // Type assertion to satisfy TypeScript

  const response = await ctx.api["POST /ent/v2/start-end2video"]({}, {
    body: payload,
  });

  const result = await response.json();

  if (result.state !== "failed") {
    return {
      status: "success",
      previewUrl:
        `${PREVIEW_URL}&generationId=${result.task_id}&presignedUrl=${props.presignedUrl}&installId=${installId}`,
      message:
        "Video generation started. The video will transition smoothly from the start frame to the end frame and will be available at the previewUrl.",
    };
  }

  return result;
};

export default action;
