import { AppContext } from "../mod.ts";
import { PNCPDocumento } from "../client.ts";

export interface Props {
  /**
   * @title ID do Documento
   * @description Identificador único do documento
   */
  id: string;
}

/**
 * @title Obter Documento do PNCP
 * @description Obtém os detalhes de um documento específico no Portal Nacional de Contratações Públicas
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<PNCPDocumento> => {
  const { id } = props;

  const response = await ctx.api["GET /api/documento/:id"]({
    id,
  });

  return response;
};

export default loader;