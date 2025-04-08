import type { AppContext } from "../mod.ts";
import type { FigmaResponse } from "../client.ts";

export interface Props {
  /**
   * @description A chave do arquivo Figma para obter informações
   * @example "FpnkfUhKcNS9S4JQFJexL"
   */
  fileKey: string;

  /**
   * @description IDs dos nós que você deseja obter imagens
   * @example ["1:2", "1:3"]
   */
  nodeIds: string[];

  /**
   * @description Fator de escala da imagem (opcional)
   * @example 1
   */
  scale?: number;

  /**
   * @description Formato da imagem (opcional)
   * @example "png"
   */
  format?: "jpg" | "png" | "svg" | "pdf";

  /**
   * @description Renderizar elementos de texto como contornos em SVGs (opcional)
   */
  svg_outline_text?: boolean;

  /**
   * @description Incluir atributos de ID para todos os elementos SVG (opcional)
   */
  svg_include_id?: boolean;

  /**
   * @description Incluir atributos de ID de nó para todos os elementos SVG (opcional)
   */
  svg_include_node_id?: boolean;

  /**
   * @description Simplificar traços internos/externos e usar o atributo de traço se possível (opcional)
   */
  svg_simplify_stroke?: boolean;

  /**
   * @description Excluir conteúdo que se sobrepõe ao nó da renderização (opcional)
   */
  contents_only?: boolean;

  /**
   * @description Usar as dimensões completas do nó independentemente de ser cortado ou o espaço ao redor estar vazio (opcional)
   */
  use_absolute_bounds?: boolean;

  /**
   * @description Versão específica do arquivo (opcional)
   */
  version?: string;
}

/**
 * @name FILE_IMAGES
 * @title Imagens do Arquivo
 * @description Obtém imagens de nós específicos de um arquivo do Figma
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
