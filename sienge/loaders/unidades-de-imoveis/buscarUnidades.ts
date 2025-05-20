import { AppContext } from "../../mod.ts";
import { createUnitsClient, GetResponseDocument } from "../../clients/units.ts";

export interface Props {
  /**
   * @title Limite de Resultados
   * @description Quantidade máxima de resultados a serem retornados
   * @default 100
   */
  limit?: number;

  /**
   * @title Deslocamento
   * @description Deslocamento a partir do início da lista
   * @default 0
   */
  offset?: number;

  /**
   * @title ID do Empreendimento
   * @description Filtrar unidades por empreendimento específico
   */
  enterpriseId?: number;

  /**
   * @title Estoque Comercial
   * @description Filtro pelo estoque comercial da unidade
   * @enum ["C", "D", "R", "E", "M", "P", "V", "L", "T"]
   */
  commercialStock?: string;

  /**
   * @title Nome da Unidade
   * @description Filtrar por nome/identificador da unidade
   */
  name?: string;

  /**
   * @title Carregar Dados Adicionais
   * @description Se devem ser carregados dados adicionais como unidades filhas, agrupamentos e valores especiais
   * @enum ["ALL", "NONE"]
   * @default "NONE"
   */
  additionalData?: "ALL" | "NONE";
}

/**
 * @title Buscar Unidades
 * @description Retorna uma lista de unidades imobiliárias com filtros
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<GetResponseDocument> => {
  const unitsClient = createUnitsClient(ctx);

  const response = await unitsClient["GET /units"]({
    limit: props.limit,
    offset: props.offset,
    enterpriseId: props.enterpriseId,
    commercialStock: props.commercialStock,
    name: props.name,
    additionalData: props.additionalData,
  });

  return await response.json();
};

export default loader;
