import type { AppContext } from "../mod.ts";
import type { FigmaResponse } from "../utils/client.ts";
import { simplifyNode } from "../utils/simplifier.ts";

import type {
  FigmaComponent,
  FigmaComponentSet,
  FigmaNode,
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

  // Simplify the nodes
  const simplifiedNodes: Record<string, SimplifiedNodeData | null> = {};

  for (const [nodeId, nodeData] of Object.entries(data.nodes)) {
    if (!nodeData) {
      simplifiedNodes[nodeId] = null;
      continue;
    }

    const node = nodeData as {
      document: FigmaNode;
      components: Record<string, FigmaComponent>;
      componentSets: Record<string, FigmaComponentSet>;
      styles: Record<string, FigmaStyle>;
      schemaVersion: number;
    };

    simplifiedNodes[nodeId] = {
      document: simplifyNode(node.document),
      components: node.components || {},
      componentSets: node.componentSets || {},
      styles: node.styles || {},
      schemaVersion: node.schemaVersion || 0,
    };
  }

  // Return the simplified nodes
  return {
    status: response.status,
    data: {
      nodes: simplifiedNodes,
    },
  };
}
