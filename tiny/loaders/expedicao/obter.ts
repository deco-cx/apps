import { AppContext } from "../../mod.ts";
import { AgrupamentoExpedicaoModel } from "../../types.ts";

export interface Props {
  /**
   * @title ID do Agrupamento
   * @description Identificador único do agrupamento de expedição
   */
  idAgrupamento: number;
}

/**
 * @title Obter Agrupamento de Expedição
 * @description Retorna os detalhes de um agrupamento de expedição específico
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<AgrupamentoExpedicaoModel> => {
  try {
    const { idAgrupamento } = props;

    const response = await ctx.api["GET /expedicao/:idAgrupamento"]({
      idAgrupamento,
    });

    return await response.json();
  } catch (error) {
    console.error(
      `Erro ao obter agrupamento de expedição ID ${props.idAgrupamento}:`,
      error,
    );
    throw error;
  }
};

export default loader;
