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
 * @name FILE_COMPONENTS
 * @title File Components
 * @description Gets the components of a Figma file, including metadata and detailed information
 */
export default async function getFileComponents(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<FigmaResponse<FigmaFile>> {
  const { fileKey, version, depth, branch_data } = props;
  if (!ctx.figma) {
    throw new Error("Figma client not found");
  }
  const response = await ctx.figma.getFile(fileKey, {
    version,
    depth,
    branch_data,
  });

  // If there's an error in the response, return the original response
  if (response.err) {
    return response;
  }

  // If there's no data, return the original response
  if (!response.data) {
    return response;
  }

  // Return only the components of the file
  return {
    ...response,
    data: {
      ...response.data,
      document: response.data.document,
      components: response.data.components,
      componentSets: response.data.componentSets,
    },
  };
}
