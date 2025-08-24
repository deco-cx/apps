import type { AppContext } from "../mod.ts";
import type {
  FigmaComponent,
  FigmaComponentSet,
  FigmaNode,
  FigmaResponse,
  FigmaStyle,
} from "../utils/client.ts";

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

  /**
   * @description Specific version of the file (optional)
   */
  version?: string;

  /**
   * @description Depth of the document tree (optional)
   */
  depth?: number;

  /**
   * @description Include geometry data (optional)
   */
  geometry?: "paths";
}

interface FileNodesResponse {
  nodes: Record<string, {
    document: FigmaNode;
    components: Record<string, FigmaComponent>;
    componentSets: Record<string, FigmaComponentSet>;
    styles: Record<string, FigmaStyle>;
    schemaVersion: number;
  }>;
}

/**
 * @name FILE_NODES
 * @title File Nodes
 * @description Gets specific nodes from a Figma file, including metadata and detailed information
 */
export default async function getFileNodes(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<FigmaResponse<FileNodesResponse>> {
  const { fileKey, nodeIds, version, depth, geometry } = props;
  const response = await ctx.client["GET /v1/files/:fileKey/nodes"]({
    fileKey,
    ids: nodeIds.join(","),
    version,
    depth,
    geometry,
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
