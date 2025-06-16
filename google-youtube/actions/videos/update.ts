import { AppContext } from "../../mod.ts";
import { COMMON_ERROR_MESSAGES, YOUTUBE_PARTS } from "../../utils/constant.ts";

/**
 * Opções para atualização de vídeo
 */
export interface Props {
  /**
   * @title Video ID
   * @description ID of the video to be updated
   */
  videoId: string;

  /**
   * @title Title
   * @description New title for the video
   */
  title?: string;

  /**
   * @title Description
   * @description New description for the video
   */
  description?: string;

  /**
   * @title Tags
   * @description New tags for the video
   */
  tags?: string[] | undefined;

  /**
   * @title Privacy Status
   * @description New privacy status for the video
   */
  privacyStatus?: "public" | "private" | "unlisted";
}

export interface UpdateVideoResult {
  success: boolean;
  video: unknown;
}

export interface UpdateVideoError {
  message: string;
  error: boolean;
  code?: number;
  details?: unknown;
}

export type UpdateVideoResponse = UpdateVideoResult | UpdateVideoError;

/**
 * @name UPDATE_VIDEO
 * @title Update YouTube Video
 * @description Updates video information like title, description, tags and privacy status
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<UpdateVideoResult> {
  if (!props.videoId) {
    ctx.errorHandler.toHttpError(
      new Error(COMMON_ERROR_MESSAGES.MISSING_VIDEO_ID),
      COMMON_ERROR_MESSAGES.MISSING_VIDEO_ID,
    );
  }

  try {
    const getResponse = await ctx.client["GET /videos"](
      {
        part: `${YOUTUBE_PARTS.SNIPPET},${YOUTUBE_PARTS.STATUS}`,
        id: props.videoId,
      },
      {
        headers: ctx.tokens?.access_token
          ? { Authorization: `Bearer ${ctx.tokens.access_token}` }
          : {},
      },
    );

    if (!getResponse.ok) {
      ctx.errorHandler.toHttpError(
        getResponse,
        `Failed to get video data: ${getResponse.statusText}`,
      );
    }

    const videoData = await getResponse.json();

    if (!videoData.items || videoData.items.length === 0) {
      ctx.errorHandler.toHttpError(
        new Error("Video not found"),
        `Video not found: ${props.videoId}`,
      );
    }

    const currentVideo = videoData.items[0];
    const snippet = { ...currentVideo.snippet };
    const status = { ...currentVideo.status };

    if (props.title !== undefined) snippet.title = props.title;
    if (props.description !== undefined) {
      snippet.description = props.description;
    }
    if (props.tags !== undefined) {
      snippet.tags = Array.isArray(props.tags) ? props.tags : [props.tags];
    }
    if (props.privacyStatus !== undefined) {
      status.privacyStatus = props.privacyStatus;
    }

    const requestBody = {
      id: props.videoId,
      snippet,
      status,
    };

    const updateResponse = await ctx.client["PUT /videos"](
      {
        part: `${YOUTUBE_PARTS.SNIPPET},${YOUTUBE_PARTS.STATUS}`,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ctx.tokens?.access_token}`,
        },
        body: requestBody,
      },
    );

    if (!updateResponse.ok) {
      ctx.errorHandler.toHttpError(
        updateResponse,
        `Failed to update video: ${updateResponse.statusText}`,
      );
    }

    const updatedVideoData = await updateResponse.json();

    return {
      success: true,
      video: updatedVideoData,
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to process video update",
    );
  }
}
