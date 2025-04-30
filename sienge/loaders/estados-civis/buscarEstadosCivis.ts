import { AppContext } from "../../mod.ts";
import {
  createCivilStatusClient,
  GetResponseDocument,
} from "../../clients/civilStatus.ts";

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
   * @title Descrição
   * @description Filtrar por descrição do estado civil
   */
  description?: string;
}

/**
 * @title Buscar Estados Civis
 * @description Retorna uma lista de estados civis com filtros
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<GetResponseDocument> => {
  const civilStatusClient = createCivilStatusClient(ctx);

  const response = await civilStatusClient["GET /civil-status"]({
    limit: props.limit,
    offset: props.offset,
    description: props.description,
  });

  const data = await response.json();
  return data;
};

export default loader;
