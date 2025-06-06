import { AppContext } from "../mod.ts";
import type { GetGenerationResultResponseBody } from "../client.ts";

export interface Props {
  /**
   * @title Task ID
   * @description The ID of the video generation task.
   */
  generationId: string;
  /**
   * @title Presigned URL
   * @description The presigned URL used to upload the video if it is available.
   */
  presignedUrl: string;
}

const POLLING_INTERVAL_MS = 2000; // Poll every 2 seconds

export interface Result {
  state: "success" | "in-progress" | "failed";
  resultUrl?: string;
  originalUrl?: string;
}

/**
 * @title Get Generation Result
 * @description Retrieves the status and results (video URL, cover URL) of a Vidu generation task, polling until completion or failure.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Result> => {
  let data: GetGenerationResultResponseBody | Result;

  while (true) {
    const response = await ctx.api["GET /ent/v2/tasks/:id/creations"]({
      id: props.generationId,
    });

    data = await response.json();

    if (data.state === "success") {
      if (data.creations?.[0]?.url) {
        const response = await fetch(data.creations[0].url);
        await fetch(props.presignedUrl, {
          method: "PUT",
          body: response.body,
        });

        return {
          state: "success",
          resultUrl: props.presignedUrl.replace("_presigned/", ""),
          originalUrl: data.creations[0].url,
        };
      }

      break;
    }

    if (data.state === "failed") {
      throw new Error("Video generation failed");
    }

    if (data.state === "queueing" || data.state === "processing") {
      await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS));
    } else {
      console.warn(`Unexpected task state: ${data.state}`);
      break;
    }
  }

  return data as Result;
};

export default loader;
