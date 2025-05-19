import { AppContext } from "../../mod.ts";
import { EtiquetaExpedicaoModel } from "../../types.ts";

export interface Props {
  /**
   * @title ID do Agrupamento
   * @description Identificador único do agrupamento de expedição
   */
  idAgrupamento: number;
}

/**
 * @title Obter Etiquetas de Expedição
 * @description Retorna todas as etiquetas para os objetos em um agrupamento de expedição
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<EtiquetaExpedicaoModel[]> => {
  try {
    const { idAgrupamento } = props;

    const response = await ctx.api["GET /expedicao/:idAgrupamento/etiquetas"]({
      idAgrupamento,
    });

    return await response.json();
  } catch (error) {
    console.error(
      `Erro ao obter etiquetas do agrupamento de expedição ID ${props.idAgrupamento}:`,
      error,
    );
    throw error;
  }
};

export default loader;
