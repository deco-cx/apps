import { AppContext } from "../../mod.ts";
import {
  createAccountsReceivableClient,
  Installment,
} from "../../clients/accountsReceivable.ts";

export interface Props {
  /**
   * @title ID do Título
   * @description Código único do título no contas a receber
   */
  receivableBillId: number;

  /**
   * @title ID do Portador (Incluir)
   * @description Filtrar por portadores específicos (opcional)
   */
  carrierIdIn?: number;

  /**
   * @title IDs dos Portadores (Excluir)
   * @description Lista de IDs de portadores para excluir da consulta, separados por vírgula (opcional)
   */
  carrierIdNotIn?: string;

  /**
   * @title Limite
   * @description Quantidade máxima de resultados a serem retornados (máx: 200)
   * @default 100
   */
  limit?: number;

  /**
   * @title Deslocamento
   * @description Índice inicial para paginação dos resultados
   * @default 0
   */
  offset?: number;
}

/**
 * @title Buscar Parcelas do Título
 * @description Retorna as parcelas de um título específico do contas a receber
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ parcelas: Installment[]; total: number }> => {
  const accountsReceivableClient = createAccountsReceivableClient(ctx);

  // Converter string de IDs em array de números quando fornecido
  const carrierIdNotIn = props.carrierIdNotIn
    ? props.carrierIdNotIn.split(",").map((id) => parseInt(id.trim(), 10))
    : undefined;

  const response = await accountsReceivableClient
    ["GET /accounts-receivable/receivable-bills/:receivableBillId/installments"](
      {
        receivableBillId: props.receivableBillId,
        carrierIdIn: props.carrierIdIn,
        carrierIdNotIn,
        limit: props.limit,
        offset: props.offset,
      },
    );

  const responseData = await response.json();

  return {
    parcelas: responseData.results,
    total: responseData.resultSetMetadata.count,
  };
};

export default loader;
