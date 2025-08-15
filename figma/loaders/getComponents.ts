import type { AppContext } from "../mod.ts";
import type { FigmaFile, FigmaResponse } from "../utils/client.ts";

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
  const response = await ctx.client["GET /v1/files/:fileKey"]({
    fileKey,
    version,
    depth,
    branch_data,
  });

  if (!response.ok) {
    return {
      err: `HTTP ${response.status}: ${response.statusText}`,
      status: response.status,
    };
  }

  const data = await response.json();

  // Return only the components of the file
  return {
    status: response.status,
    data: {
      ...data,
      document: data.document,
      components: data.components,
      componentSets: data.componentSets,
    },
  };
}
