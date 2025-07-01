import type { AppContext } from "../../mod.ts";
import { LiveStream } from "../../utils/types.ts";
import { YOUTUBE_PARTS } from "../../utils/constant.ts";

export interface Props {
  /**
   * @title Title
   * @description Title of the stream
   */
  title: string;

  /**
   * @title Description
   * @description Description of the stream
   */
  description?: string;

  /**
   * @title Ingestion Type
   * @description Type of ingestion, RTMP is the most common standard
   */
  ingestionType?: "rtmp" | "dash" | "webrtc";

  /**
   * @title Resolution
   * @description Resolution, such as "1080p", "720p", etc.
   */
  resolution?: string;

  /**
   * @title Frame Rate
   * @description Frame rate, such as "30fps", "60fps"
   */
  frameRate?: string;

  /**
   * @title Is Reusable
   * @description Indicates if the stream can be reused for multiple broadcasts
   */
  isReusable?: boolean;
}

export interface CreateLiveStreamResult {
  success: boolean;
  message: string;
  stream?: LiveStream;
  error?: unknown;
}

/**
 * @name CREATE_LIVE_STREAM
 * @title Create Video Stream
 * @description Creates a new video stream to use in live broadcasts
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CreateLiveStreamResult> {
  const {
    title,
    description = "",
    ingestionType = "rtmp",
    resolution = "1080p",
    frameRate = "60fps",
    isReusable = true,
  } = props;

  if (!title) {
    ctx.errorHandler.toHttpError(
      new Error("Stream title is required"),
      "Stream title is required",
    );
  }

  try {
    const payload = {
      snippet: {
        title,
        description,
      },
      cdn: {
        ingestionType,
        resolution,
        frameRate,
      },
      contentDetails: {
        isReusable,
      },
    };

    const response = await ctx.client["POST /liveStreams"](
      {
        part:
          `id,${YOUTUBE_PARTS.SNIPPET},cdn,${YOUTUBE_PARTS.CONTENT_DETAILS},${YOUTUBE_PARTS.STATUS}`,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ctx.tokens?.access_token}`,
        },
        body: payload,
      },
    );

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        `Failed to create stream: ${response.statusText}`,
      );
    }

    const stream = await response.json();

    return {
      success: true,
      message: "Stream created successfully",
      stream,
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to create stream",
    );
  }
}
