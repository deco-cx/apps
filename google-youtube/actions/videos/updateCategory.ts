import { AppContext } from "../../mod.ts";
import { COMMON_ERROR_MESSAGES, YOUTUBE_PARTS } from "../../utils/constant.ts";

/**
 * Resultado da atualização de categoria de vídeo
 */
export interface UpdateCategoryResult {
  success: boolean;
  video: unknown;
}

export interface UpdateCategoryError {
  message: string;
  error: boolean;
  code?: number;
  details?: unknown;
}

export type UpdateCategoryResponse = UpdateCategoryResult | UpdateCategoryError;

/**
 * Opções para atualização de categoria de vídeo
 */
export interface Props {
  /**
   * @title Video ID
   * @description ID of the video to be updated
   */
  videoId: string;

  /**
   * @title Category ID
   * @description Video category ID
   * Common categories:
   * 1 - Film & Animation
   * 2 - Autos & Vehicles
   * 10 - Music
   * 15 - Pets & Animals
   * 17 - Sports
   * 18 - Short Movies
   * 19 - Travel & Events
   * 20 - Gaming
   * 22 - People & Blogs
   * 23 - Comedy
   * 24 - Entertainment
   * 25 - News & Politics
   * 26 - Howto & Style
   * 27 - Education
   * 28 - Science & Technology
   * 29 - Nonprofits & Activism
   */
  categoryId: string;
}

/**
 * @name UPDATE_VIDEO_CATEGORY
 * @title Update Video Category
 * @description Updates the category of a YouTube video
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<UpdateCategoryResult> {
  if (!props.videoId) {
    ctx.errorHandler.toHttpError(
      new Error(COMMON_ERROR_MESSAGES.MISSING_VIDEO_ID),
      COMMON_ERROR_MESSAGES.MISSING_VIDEO_ID,
    );
  }

  if (!props.categoryId) {
    ctx.errorHandler.toHttpError(
      new Error("Category ID is required"),
      "Category ID is required",
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

    snippet.categoryId = props.categoryId;

    const requestBody = {
      id: props.videoId,
      snippet,
    };

    const updateResponse = await ctx.client["PUT /videos"](
      {
        part: YOUTUBE_PARTS.SNIPPET,
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
        `Failed to update video category: ${updateResponse.statusText}`,
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
      "Failed to process category update",
    );
  }
}
