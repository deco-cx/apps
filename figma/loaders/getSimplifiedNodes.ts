import type { AppContext } from "../mod.ts";
import type { FigmaResponse } from "../client.ts";
import { simplifyNode } from "../utils/simplifier.ts";
import type {
  FigmaComponent,
  FigmaComponentSet,
  FigmaNode,
  FigmaStyle,
} from "../client.ts";

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

interface SimplifiedNodeData {
  document: Partial<FigmaNode> | null;
  components: Record<string, FigmaComponent>;
  componentSets: Record<string, FigmaComponentSet>;
  styles: Record<string, FigmaStyle>;
  schemaVersion: number;
}

interface FileNodesResponse {
  nodes: Record<string, SimplifiedNodeData | null>;
}

/**
 * @name FILE_SIMPLIFIED_NODES
 * @title Simplified File Nodes
 * @description Gets specific nodes from a Figma file in simplified format
 */
export default async function getFileSimplifiedNodes(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<FigmaResponse<FileNodesResponse>> {
  const { fileKey, nodeIds, version, depth, geometry } = props;
  if (!ctx.figma) {
    throw new Error("Figma client not found");
  }
  const client = ctx.figma;
  const response = await client.getFileNodes(fileKey, nodeIds, {
    version,
    depth,
    geometry,
  });

  // If there's an error in the response, return the original response
  if (response.err || !response.data) {
    return response;
  }

  // Simplify the nodes
  const simplifiedNodes: Record<string, SimplifiedNodeData | null> = {};

  for (const [nodeId, nodeData] of Object.entries(response.data.nodes)) {
    if (!nodeData) {
      simplifiedNodes[nodeId] = null;
      continue;
    }

    simplifiedNodes[nodeId] = {
      document: simplifyNode(nodeData.document),
      components: nodeData.components || {},
      componentSets: nodeData.componentSets || {},
      styles: nodeData.styles || {},
      schemaVersion: nodeData.schemaVersion || 0,
    };
  }

  // Return the simplified nodes
  return {
    ...response,
    data: {
      nodes: simplifiedNodes,
    },
  };
}
