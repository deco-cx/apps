import { AppContext } from "../../mod.ts";
import { ListagemOrdemCompraResponseModel } from "../../types.ts";

export interface Props {
  /**
   * @title Situação
   * @description Filtrar por situação da ordem de compra
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
   * @title ID do Fornecedor
   * @description Filtrar por ID do fornecedor
   */
  idFornecedor?: number;

  /**
   * @title CPF/CNPJ
   * @description Filtrar por CPF ou CNPJ do fornecedor
   */
  cpfCnpj?: string;

  /**
   * @title Número
   * @description Filtrar por número da ordem de compra
   */
  numero?: string;

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
 * @title Listar Ordens de Compra
 * @description Lista todas as ordens de compra com filtragem e paginação
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ListagemOrdemCompraResponseModel> => {
  try {
    const {
      situacao,
      dataInicial,
      dataFinal,
      idFornecedor,
      cpfCnpj,
      numero,
      orderBy,
      limit = 100,
      offset = 0,
    } = props;

    // Pass search parameters to the API
    const response = await ctx.api["GET /ordem-compra"]({
      situacao,
      dataInicial,
      dataFinal,
      idFornecedor,
      cpfCnpj,
      numero,
      orderBy,
      limit,
      offset,
    });

    return await response.json();
  } catch (error) {
    console.error("Erro ao listar ordens de compra:", error);
    throw error;
  }
};

export default loader;
