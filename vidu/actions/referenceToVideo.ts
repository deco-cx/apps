import { AppContext } from "../mod.ts";
import type {
  ReferenceToVideoRequestBody,
  ReferenceToVideoResponseBody,
} from "../client.ts";

export type Props = ReferenceToVideoRequestBody;

const PREVIEW_URL =
  "https://localhost-franca--mcp.deco.site/live/invoke/vidu/loaders/resultPreview.ts?appName=site-apps-deco-vidu-ts&installId=cdc1a2d0-079a-4c50-9683-e8ac15326ec0";

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
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ReferenceToVideoResponseBody | Result> => {
  console.log({ props, ctx });

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
        `${PREVIEW_URL}&generationId=${result.task_id}&presignedUrl=${props.presignedUrl}`,
      message:
        "Video generation started. The video will be available at the previewUrl.",
    };
  }

  return result;
};

export default action;
