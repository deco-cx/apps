import type { AppContext } from "../mod.ts";
import type { FigmaFile, FigmaResponse } from "../client.ts";

export interface Props {
  /**
   * @description The Figma file key to get information from
   * @example "FpnkfUhKcNS9S4JQFJexL"
   */
  fileKey: string;

  /**
   * @description Specific version of the file (optional)
   */
  version?: string;

  /**
   * @description Depth of the document tree (optional)
   */
  depth?: number;

  /**
   * @description Include branch data (optional)
   */
  branch_data?: boolean;
}

/**
 * @name FILE_PROFILE
 * @title File Profile
 * @description Gets detailed information about a Figma file, including metadata, document and components
 */
export default async function getFileProfile(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<FigmaResponse<FigmaFile>> {
  const { fileKey, version, depth, branch_data } = props;
  return await ctx.figma.getFile(fileKey, {
    version,
    depth,
    branch_data,
  });
}
