import type { AppContext } from "../mod.ts";
import type {
  SimpleUnsplashPhoto,
  UnsplashPhoto,
  UnsplashPhotoUrls,
} from "../utils/types.ts";

/**
 * @name UNSPLASH_LIST_PHOTOS
 * @description Lists photos from Unsplash with pagination
 */
export interface Props {
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
   * @description Response detail level
   * @default "simple"
   */
  responseType?: "full" | "simple" | "urls";
}

export type ReturnType =
  | UnsplashPhoto[]
  | SimpleUnsplashPhoto[]
  | UnsplashPhotoUrls[];

/**
 * @title List Photos
 */
export default async function listPhotos(
  { page = 1, perPage = 10, responseType = "simple" }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ReturnType> {
  const { unsplashClient } = ctx;

  try {
    switch (responseType) {
      case "full":
        return await unsplashClient.listPhotos(page, perPage);
      case "simple":
        return await unsplashClient.listPhotosSimple(page, perPage);
      case "urls":
        return await unsplashClient.listPhotosUrls(page, perPage);
      default:
        return await unsplashClient.listPhotosSimple(page, perPage);
    }
  } catch (error) {
    console.error("Error listing photos:", error);
    throw error;
  }
}
