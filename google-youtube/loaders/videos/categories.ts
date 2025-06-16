import { AppContext } from "../../mod.ts";
import { YoutubeCategoryListResponse } from "../../utils/types.ts";
import { YOUTUBE_PARTS } from "../../utils/constant.ts";

export interface Props {
  /**
   * @title Region Code
   * @description Country code to fetch video categories for
   */
  regionCode?: string;
}

/**
 * @name GET_VIDEO_CATEGORIES
 * @title List Video Categories
 * @description Retrieves the list of video categories available on YouTube for a specific region
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<YoutubeCategoryListResponse> => {
  const { regionCode = "BR" } = props;

  try {
    const response = await ctx.client["GET /videoCategories"](
      {
        part: YOUTUBE_PARTS.SNIPPET,
        regionCode,
      },
      {
        headers: ctx.tokens?.access_token
          ? { Authorization: `Bearer ${ctx.tokens.access_token}` }
          : {},
      },
    );

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        `Failed to fetch video categories: ${response.statusText}`,
      );
    }

    const categoriesData = await response.json() as YoutubeCategoryListResponse;

    if (categoriesData.items) {
      categoriesData.items.sort((a, b) =>
        parseInt(a.id, 10) - parseInt(b.id, 10)
      );
    }

    return categoriesData;
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to fetch video categories",
    );
  }
};

export default loader;
