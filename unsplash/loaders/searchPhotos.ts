import type { AppContext } from "../mod.ts";
import type {
  SimpleUnsplashSearchResult,
  UnsplashPhotoUrls,
  UnsplashSearchResult,
} from "../utils/types.ts";

/**
 * @name UNSPLASH_SEARCH_PHOTOS
 * @description Search photos on Unsplash by terms
 */
export interface Props {
  /**
   * @description Search query
   */
  query: string;

  /**
   * @description Page number for pagination
   * @default 1
   */
  page?: number;

  /**
   * @description Number of photos per page
   * @default 10
   */
  perPage?: number;

  /**
   * @description Photo orientation
   */
  orientation?: "landscape" | "portrait" | "squarish";

  /**
   * @description Collection IDs to filter results (comma separated)
   */
  collections?: string;

  /**
   * @description Content filter
   */
  contentFilter?: "low" | "high";

  /**
   * @description Color filter (e.g. black_and_white, black, white, yellow, etc.)
   */
  color?: string;

  /**
   * @description Response detail level
   * @default "simple"
   */
  responseType?: "full" | "simple" | "urls";
}

export type ReturnType = UnsplashSearchResult | SimpleUnsplashSearchResult | {
  total: number;
  total_pages: number;
  results: UnsplashPhotoUrls[];
};

/**
 * @title Search Photos
 */
export default async function searchPhotos(
  {
    query,
    page = 1,
    perPage = 10,
    orientation,
    collections,
    contentFilter,
    color,
    responseType = "simple",
  }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ReturnType> {
  const { unsplashClient } = ctx;

  try {
    switch (responseType) {
      case "full":
        return await unsplashClient.searchPhotos(query, page, perPage, {
          orientation,
          collections,
          contentFilter,
          color,
        });
      case "simple":
        return await unsplashClient.searchPhotosSimple(query, page, perPage, {
          orientation,
          collections,
          contentFilter,
          color,
        });
      case "urls":
        return await unsplashClient.searchPhotosUrls(query, page, perPage, {
          orientation,
          collections,
          contentFilter,
          color,
        });
      default:
        return await unsplashClient.searchPhotosSimple(query, page, perPage, {
          orientation,
          collections,
          contentFilter,
          color,
        });
    }
  } catch (error) {
    console.error("Error searching photos:", error);
    throw error;
  }
}
