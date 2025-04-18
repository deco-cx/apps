import { AppContext } from "../mod.ts";
import type {
  TextToVideoModel,
  TextToVideoRequestBody,
  TextToVideoResponseBody,
} from "../client.ts";
import { PREVIEW_URL } from "../loaders/resultPreview.ts";

export type Props = TextToVideoRequestBody;

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
 * @title Text to Video
 * @description Generates a video from a text prompt using the Vidu API. The result will be available in a preview page.
 * @name TEXT_TO_VIDEO
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<TextToVideoResponseBody | Result> => {
  const payload = {
    ...props,
    model: props.model ?? "vidu1.5" as TextToVideoModel,
  };

  const response = await ctx.api["POST /ent/v2/text2video"]({}, {
    body: payload,
  });

  const result = await response.json();

  if (result.state !== "failed") {
    return {
      status: "success",
      previewUrl:
        `${PREVIEW_URL}&generationId=${result.task_id}&presignedUrl=${props.presignedUrl}&installId=${ctx.installId}`,
      message:
        "Video generation started. The video will be available at the previewUrl.",
    };
  }

  return response.json();
};

export default action;
