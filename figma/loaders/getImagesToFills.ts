import type { AppContext } from "../mod.ts";
import type { FigmaResponse } from "../utils/client.ts";

export interface Props {
  /**
   * @description The Figma file key to get information from
   * @example "FpnkfUhKcNS9S4JQFJexL"
   */
  fileKey: string;
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
): Promise<
  FigmaResponse<{
    images: Record<string, string>;
  }>
> {
  const { fileKey } = props;
  const response = await ctx.client["GET /v1/files/:fileKey/images"]({
    fileKey,
  });

  if (!response.ok) {
    return {
      err: `HTTP ${response.status}: ${response.statusText}`,
      status: response.status,
    };
  }

  const data = await response.json();

  return {
    status: response.status,
    data: data,
  };
}
