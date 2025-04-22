import { AppContext } from "../../mod.ts";
import {
  createProfessionsClient,
  Profession,
} from "../../clients/professions.ts";

export interface Props {
  /**
   * @title Nome da Profissão
   * @description Filtro por nome da profissão
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
 * @title Buscar Profissões
 * @description Retorna uma lista de profissões do Sienge com base nos filtros especificados
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ profissoes: Profession[]; total: number }> => {
  const professionsClient = createProfessionsClient(ctx);

  const response = await professionsClient["GET /professions"]({
    limit: props.limit,
    offset: props.offset,
    name: props.name,
  });

  const data = await response.json();

  return {
    profissoes: data.results,
    total: data.resultSetMetadata.count,
  };
};

export default loader;
