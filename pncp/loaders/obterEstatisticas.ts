import { AppContext } from "../mod.ts";
import { PNCPEstatisticas } from "../client.ts";

export interface Props {
  /**
   * @title Data Inicial
   * @description Data inicial para filtrar estatísticas (formato YYYY-MM-DD)
   */
  data_inicial?: string;

  /**
   * @title Data Final
   * @description Data final para filtrar estatísticas (formato YYYY-MM-DD)
   */
  data_final?: string;

  /**
   * @title UF
   * @description UF para filtrar estatísticas
   */
  uf?: string;
}

/**
 * @title Obter Estatísticas do PNCP
 * @description Obtém estatísticas gerais do Portal Nacional de Contratações Públicas
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<PNCPEstatisticas> => {
  const response = await ctx.api["GET /api/estatisticas"]({
    ...props,
  });

  return response;
};

export default loader;