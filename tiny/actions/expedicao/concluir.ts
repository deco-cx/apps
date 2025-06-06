import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @title ID do Agrupamento
   * @description Identificador único do agrupamento de expedição
   */
  idAgrupamento: number;
}

/**
 * @title Concluir Agrupamento de Expedição
 * @description Conclui um agrupamento de expedição, finalizando o processo
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idAgrupamento } = props;

    const response = await ctx.api["POST /expedicao/:idAgrupamento/concluir"]({
      idAgrupamento,
    });

    if (!response.ok) {
      throw new Error(
        `Erro ao concluir agrupamento: ${response.status} ${response.statusText}`,
      );
    }
  } catch (error) {
    console.error(
      `Erro ao concluir agrupamento de expedição ID ${props.idAgrupamento}:`,
      error,
    );
    throw error;
  }
};

export default action;
