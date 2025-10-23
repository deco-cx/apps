import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @description The Figma file key to get information from
   * @example "FpnkfUhKcNS9S4JQFJexL"
   */
  fileKey: string;
  /**
   * @description The image references to get. If not provided, all images will be returned. But if you can, you should provide this.
   */
  imageRef?: string[];
}

/**
 * @name FILE_IMAGE_FILLS
 * @title File Image Fills
 * @description Gets download URLs for all images present in image fills in a document
 */
export default async function getFileImageFills(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Record<string, string>> {
  const { fileKey } = props;
  if (!ctx.figma) {
    throw new Error("Figma client not found");
  }
  const images = (await ctx.figma.getImageFills(fileKey))?.meta?.images;

  let imagesToReturn: Record<string, string> = {};
  if (props.imageRef) {
    props.imageRef.forEach((ref) => {
      imagesToReturn[ref] = images?.[ref] ?? "";
    });
  } else {
    imagesToReturn = images;
  }

  return imagesToReturn;
}
