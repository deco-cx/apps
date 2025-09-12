import type { AppContext } from "../mod.ts";
import type { FigmaResponse } from "../client.ts";

export interface Props {
  /**
   * @description The Figma file key to get information from
   * @example "FpnkfUhKcNS9S4JQFJexL"
   */
  fileKey: string;

  /**
   * @description IDs of the nodes you want to get images from
   * @example ["1:2", "1:3"]
   */
  nodeIds: string[];

  /**
   * @description Image scale factor (optional)
   * @example 1
   */
  scale?: number;

  /**
   * @description Image format (optional)
   * @example "png"
   */
  format?: "jpg" | "png" | "svg" | "pdf";

  /**
   * @description Render text elements as outlines in SVGs (optional)
   */
  svg_outline_text?: boolean;

  /**
   * @description Include ID attributes for all SVG elements (optional)
   */
  svg_include_id?: boolean;

  /**
   * @description Include node ID attributes for all SVG elements (optional)
   */
  svg_include_node_id?: boolean;

  /**
   * @description Simplify inner/outer strokes and use stroke attribute if possible (optional)
   */
  svg_simplify_stroke?: boolean;

  /**
   * @description Exclude content that overlaps with the node from rendering (optional)
   */
  contents_only?: boolean;

  /**
   * @description Use the complete dimensions of the node regardless of whether it is cropped or the surrounding space is empty (optional)
   */
  use_absolute_bounds?: boolean;

  /**
   * @description Specific version of the file (optional)
   */
  version?: string;
}

/**
 * @name FILE_IMAGES
 * @title File Images
 * @description Renders images from a file
 */
export default async function getFileImages(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<
  FigmaResponse<{
    images: Record<string, string | null>;
  }>
> {
  const {
    fileKey,
    nodeIds,
    scale,
    format,
    svg_outline_text,
    svg_include_id,
    svg_include_node_id,
    svg_simplify_stroke,
    contents_only,
    use_absolute_bounds,
    version,
  } = props;

  if (!ctx.figma) {
    throw new Error("Figma client not found");
  }

  return await ctx.figma.getImages(fileKey, nodeIds, {
    scale,
    format,
    svg_outline_text,
    svg_include_id,
    svg_include_node_id,
    svg_simplify_stroke,
    contents_only,
    use_absolute_bounds,
    version,
  });
}
