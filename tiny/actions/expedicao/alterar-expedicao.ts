import { AppContext } from "../../mod.ts";
import { AlterarExpedicaoRequestModel } from "../../types.ts";

export interface Props extends AlterarExpedicaoRequestModel {
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
 * @title Alterar Expedição
 * @description Altera os dados de uma expedição dentro de um agrupamento
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idAgrupamento, idExpedicao, ...requestBody } = props;

    const response = await ctx.api
      ["PUT /expedicao/:idAgrupamento/expedicao/:idExpedicao"](
        {
          idAgrupamento,
          idExpedicao,
        },
        {
          body: requestBody,
        },
      );

    if (!response.ok) {
      throw new Error(
        `Erro ao alterar expedição: ${response.status} ${response.statusText}`,
      );
    }
  } catch (error) {
    console.error(
      `Erro ao alterar expedição ID ${props.idExpedicao} no agrupamento ID ${props.idAgrupamento}:`,
      error,
    );
    throw error;
  }
};

export default action;
