import type { AppContext } from "../mod.ts";
import type {
  SimpleUnsplashPhoto,
  UnsplashPhoto,
  UnsplashPhotoUrls,
} from "../utils/types.ts";

/**
 * @name UNSPLASH_GET_PHOTO
 * @description Gets a specific photo from Unsplash by ID
 */
export interface Props {
  /**
   * @description Unsplash photo ID
   */
  id: string;

  /**
   * @description Response detail level
   * @default "simple"
   */
  responseType?: "full" | "simple" | "urls";
}

export type ReturnType =
  | UnsplashPhoto
  | SimpleUnsplashPhoto
  | UnsplashPhotoUrls;

/**
 * @title Get Photo by ID
 */
export default async function getPhoto(
  { id, responseType = "simple" }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ReturnType> {
  const { unsplashClient } = ctx;

  try {
    switch (responseType) {
      case "full":
        return await unsplashClient.getPhoto(id);
      case "simple":
        return await unsplashClient.getPhotoSimple(id);
      case "urls":
        return await unsplashClient.getPhotoUrls(id);
      default:
        return await unsplashClient.getPhotoSimple(id);
    }
  } catch (error) {
    console.error("Error getting photo:", error);
    throw error;
  }
}
