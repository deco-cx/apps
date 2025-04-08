import type { AppContext } from "../mod.ts";
import type { FigmaResponse, FigmaFile } from "../client.ts";

export interface Props {
  /**
   * @description A chave do arquivo Figma para obter informações
   * @example "FpnkfUhKcNS9S4JQFJexL"
   */
  fileKey: string;

  /**
   * @description Versão específica do arquivo (opcional)
   */
  version?: string;

  /**
   * @description Profundidade da árvore do documento (opcional)
   */
  depth?: number;

  /**
   * @description Incluir dados de branches (opcional)
   */
  branch_data?: boolean;
}

/**
 * @name FILE_COMPONENTS
 * @title Componentes do Arquivo
 * @description Obtém os componentes de um arquivo do Figma, incluindo metadados e informações detalhadas
 */
export default async function getFileComponents(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<FigmaResponse<FigmaFile>> {
  const { fileKey, version, depth, branch_data } = props;
  const response = await ctx.figma.getFile(fileKey, {
    version,
    depth,
    branch_data,
  });
  
  // Se houver erro na resposta, retorna a resposta original
  if (response.err) {
    return response;
  }
  
  // Se não houver dados, retorna a resposta original
  if (!response.data) {
    return response;
  }
  
  // Retorna apenas os componentes do arquivo
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