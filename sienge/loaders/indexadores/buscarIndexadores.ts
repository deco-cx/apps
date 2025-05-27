import { AppContext } from "../../mod.ts";
import { createIndexersClient, Indexer } from "../../clients/indexers.ts";

export interface Props {
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
 * @title Buscar Indexadores
 * @description Retorna uma lista de indexadores financeiros do Sienge
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ indexadores: Indexer[]; total: number }> => {
  const indexersClient = createIndexersClient(ctx);

  const response = await indexersClient["GET /indexers"]({
    limit: props.limit,
    offset: props.offset,
  });

  const data = await response.json();

  return {
    indexadores: data.results,
    total: data.resultSetMetadata.count,
  };
};

export default loader;
