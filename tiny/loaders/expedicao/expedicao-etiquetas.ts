import { AppContext } from "../../mod.ts";
import { EtiquetaExpedicaoModel } from "../../types.ts";

export interface Props {
  /**
   * @title ID do Agrupamento
   * @description Identificador único do agrupamento de expedição
   */
  idAgrupamento: number;

  /**
   * @title ID da Expedição
   * @description Identificador único da expedição dentro do agrupamento
   */
  idExpedicao: number;
}

/**
 * @title Obter Etiquetas de Expedição Específica
 * @description Retorna as etiquetas para uma expedição específica dentro de um agrupamento
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<EtiquetaExpedicaoModel[]> => {
  try {
    const { idAgrupamento, idExpedicao } = props;

    const response = await ctx.api
      ["GET /expedicao/:idAgrupamento/expedicao/:idExpedicao/etiquetas"]({
        idAgrupamento,
        idExpedicao,
      });

    return await response.json();
  } catch (error) {
    console.error(
      `Erro ao obter etiquetas da expedição ID ${props.idExpedicao} no agrupamento ID ${props.idAgrupamento}:`,
      error,
    );
    throw error;
  }
};

export default loader;
