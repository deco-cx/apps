import { AppContext } from "../../mod.ts";
import { ListagemSeparacaoResponseModel } from "../../types.ts";

export interface Props {
  /**
   * @title Número
   * @description Filtrar por número da separação
   */
  numero?: string;

  /**
   * @title Situação
   * @description Filtrar por situação da separação
   */
  situacao?: string;

  /**
   * @title Data Inicial
   * @description Filtrar por data inicial de criação
   */
  dataInicial?: string;

  /**
   * @title Data Final
   * @description Filtrar por data final de criação
   */
  dataFinal?: string;

  /**
   * @title ID do Vendedor
   * @description Filtrar por ID do vendedor
   */
  idVendedor?: number;

  /**
   * @title ID do Cliente
   * @description Filtrar por ID do cliente
   */
  idCliente?: number;

  /**
   * @title CPF/CNPJ
   * @description Filtrar por CPF ou CNPJ do cliente
   */
  cpfCnpj?: string;

  /**
   * @title Ordenação
   * @description Ordenar resultados de forma crescente ou decrescente
   */
  orderBy?: "asc" | "desc";

  /**
   * @title Limite
   * @description Limite de registros por página
   * @default 100
   */
  limit?: number;

  /**
   * @title Offset
   * @description Deslocamento para paginação
   * @default 0
   */
  offset?: number;
}

/**
 * @title Listar Separações
 * @description Lista todas as separações com filtragem e paginação
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ListagemSeparacaoResponseModel> => {
  try {
    const {
      numero,
      situacao,
      dataInicial,
      dataFinal,
      idVendedor,
      idCliente,
      cpfCnpj,
      orderBy,
      limit = 100,
      offset = 0,
    } = props;

    // Pass search parameters to the API
    const response = await ctx.api["GET /separacao"]({
      numero,
      situacao,
      dataInicial,
      dataFinal,
      idVendedor,
      idCliente,
      cpfCnpj,
      orderBy,
      limit,
      offset,
    });

    return await response.json();
  } catch (error) {
    console.error("Erro ao listar separações:", error);
    throw error;
  }
};

export default loader;
