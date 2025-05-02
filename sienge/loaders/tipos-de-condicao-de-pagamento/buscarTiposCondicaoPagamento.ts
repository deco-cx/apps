import { AppContext } from "../../mod.ts";
import {
  createPaymentConditionTypesClient,
  PaymentConditionType,
} from "../../clients/paymentConditionTypes.ts";

export interface Props {
  /**
   * @title Filtro
   * @description Filtro por nome ou descrição do tipo de condição de pagamento
   */
  filter?: string;

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
 * @title Buscar Tipos de Condição de Pagamento
 * @description Retorna uma lista de tipos de condição de pagamento do Sienge com base nos filtros especificados
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<
  { tiposCondicaoPagamento: PaymentConditionType[]; total: number }
> => {
  const paymentConditionTypesClient = createPaymentConditionTypesClient(ctx);

  const response = await paymentConditionTypesClient
    ["GET /payment-condition-types"]({
      filter: props.filter,
      limit: props.limit,
      offset: props.offset,
    });

  const data = await response.json();

  return {
    tiposCondicaoPagamento: data.results,
    total: data.resultSetMetadata.count,
  };
};

export default loader;
