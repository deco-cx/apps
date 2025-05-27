import { AppContext } from "../../mod.ts";
import {
  createCitiesClient,
  GetResponseDocument,
} from "../../clients/cities.ts";

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
   * @title Nome do Município
   * @description Filtrar por nome do município
   */
  name?: string;

  /**
   * @title UF
   * @description Filtrar por sigla da unidade federativa
   */
  stateCode?: string;
}

/**
 * @title Buscar Municípios
 * @description Retorna uma lista de municípios com filtros
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<GetResponseDocument> => {
  const citiesClient = createCitiesClient(ctx);

  const response = await citiesClient["GET /cities"]({
    limit: props.limit,
    offset: props.offset,
    name: props.name,
    stateCode: props.stateCode,
  });

  const data = await response.json();
  return data;
};

export default loader;
