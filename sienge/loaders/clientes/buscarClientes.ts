import { AppContext } from "../../mod.ts";
import { createCustomersClient, Customer } from "../../clients/customers.ts";

export interface Props {
  /**
   * @title CPF
   * @description CPF do cliente (somente números)
   */
  cpf?: string;

  /**
   * @title CNPJ
   * @description CNPJ do cliente (somente números)
   */
  cnpj?: string;

  /**
   * @title ID Internacional
   * @description Informação da identificação internacional
   */
  internationalId?: string;

  /**
   * @title Somente Ativos
   * @description Filtrar apenas clientes ativos
   */
  onlyActive?: boolean;

  /**
   * @title ID do Empreendimento
   * @description ID do empreendimento para filtrar clientes
   */
  enterpriseId?: number;

  /**
   * @title Criados Após
   * @description Data inicial para filtrar clientes pela data de criação (yyyy-MM-dd)
   */
  createdAfter?: string;

  /**
   * @title Criados Antes
   * @description Data final para filtrar clientes pela data de criação (yyyy-MM-dd)
   */
  createdBefore?: string;

  /**
   * @title Modificados Após
   * @description Data inicial para filtrar clientes pela data de última alteração (yyyy-MM-dd)
   */
  modifiedAfter?: string;

  /**
   * @title Modificados Antes
   * @description Data final para filtrar clientes pela data de última alteração (yyyy-MM-dd)
   */
  modifiedBefore?: string;

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
 * @title Buscar Clientes
 * @description Retorna uma lista de clientes do Sienge com base nos filtros especificados
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ clientes: Customer[]; total: number }> => {
  const customersClient = createCustomersClient(ctx);

  const response = await customersClient["GET /customers"]({
    cpf: props.cpf,
    cnpj: props.cnpj,
    internationalId: props.internationalId,
    onlyActive: props.onlyActive,
    enterpriseId: props.enterpriseId,
    createdAfter: props.createdAfter,
    createdBefore: props.createdBefore,
    modifiedAfter: props.modifiedAfter,
    modifiedBefore: props.modifiedBefore,
    limit: props.limit,
    offset: props.offset,
  });

  const responseData = await response.json();

  return {
    clientes: responseData.data,
    total: responseData.total,
  };
};

export default loader;
