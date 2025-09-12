import type { AppContext } from "../mod.ts";
import type { FigmaResponse } from "../client.ts";

export interface Props {
  /**
   * @description The Figma file key to get information from
   * @example "FpnkfUhKcNS9S4JQFJexL"
   */
  fileKey: string;
  /**
   * @description IDs of the nodes you want to get
   * @example ["1:2", "1:3"]
   */
  nodeIds: string[];
}

/**
 * @name FILE_GET_IMAGE_SPECIFIC_NODE
 * @title File Get Image Specific Node
 * @description Gets download URLs for specific node images
 */
export default async function getFileImageSpecificNode(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<
  FigmaResponse<{
    images: Record<string, string>;
  }>
> {
  const { fileKey, nodeIds } = props;
  if (!ctx.figma) {
    throw new Error("Figma client not found");
  }
  return await ctx.figma.getImageFromNode(fileKey, nodeIds);
}
