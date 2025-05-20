import { AppContext } from "../../mod.ts";
import {
  createPropertyTypesClient,
  PropertyType,
} from "../../clients/propertyTypes.ts";

export interface Props {
  /**
   * @title Nome
   * @description Filtro por nome do tipo de imóvel
   */
  name?: string;

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
 * @title Buscar Tipos de Imóveis
 * @description Retorna uma lista de tipos de imóveis do Sienge com base nos filtros especificados
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ tiposImoveis: PropertyType[]; total: number }> => {
  const propertyTypesClient = createPropertyTypesClient(ctx);

  const response = await propertyTypesClient["GET /property-types"]({
    name: props.name,
    limit: props.limit,
    offset: props.offset,
  });

  const data = await response.json();

  return {
    tiposImoveis: data.results,
    total: data.resultSetMetadata.count,
  };
};

export default loader;
