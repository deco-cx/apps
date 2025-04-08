import type { AppContext } from "../mod.ts";
import type { FigmaNode, FigmaResponse } from "../client.ts";

export interface Props {
  /**
   * @description A chave do arquivo Figma para obter informações
   * @example "FpnkfUhKcNS9S4JQFJexL"
   */
  fileKey: string;

  /**
   * @description IDs dos nós que você deseja obter
   * @example ["1:2", "1:3"]
   */
  nodeIds: string[];

  /**
   * @description Versão específica do arquivo (opcional)
   */
  version?: string;

  /**
   * @description Profundidade da árvore do documento (opcional)
   */
  depth?: number;

  /**
   * @description Incluir dados de geometria (opcional)
   */
  geometry?: "paths";
}

/**
 * @name FILE_NODES
 * @title Nós do Arquivo
 * @description Obtém nós específicos de um arquivo do Figma, incluindo metadados e informações detalhadas
 */
export default async function getFileNodes(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<
  FigmaResponse<{
    nodes: Record<string, {
      document: FigmaNode;
      components: Record<string, any>;
      componentSets: Record<string, any>;
      styles: Record<string, any>;
      schemaVersion: number;
    }>;
  }>
> {
  const { fileKey, nodeIds, version, depth, geometry } = props;
  return await ctx.figma.getFileNodes(fileKey, nodeIds, {
    version,
    depth,
    geometry,
  });
}
