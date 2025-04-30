import { AppContext } from "../../mod.ts";
import {
  createCustomerTypesClient,
  CustomerType,
} from "../../clients/customerTypes.ts";

export interface Props {
  /**
   * @title ID do Tipo de Cliente
   * @description Filtro por código do tipo de cliente
   */
  id?: number;

  /**
   * @title Descrição
   * @description Filtro por descrição do tipo de cliente
   */
  description?: string;

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
 * @title Buscar Tipos de Clientes
 * @description Retorna uma lista de tipos de clientes do Sienge com base nos filtros especificados
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ tiposClientes: CustomerType[]; total: number }> => {
  const customerTypesClient = createCustomerTypesClient(ctx);

  const response = await customerTypesClient["GET /customer-types"]({
    limit: props.limit,
    offset: props.offset,
    id: props.id,
    description: props.description,
  });

  const data = await response.json();

  return {
    tiposClientes: data.results,
    total: data.resultSetMetadata.count,
  };
};

export default loader;
