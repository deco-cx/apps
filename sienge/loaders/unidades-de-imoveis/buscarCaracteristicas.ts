import { AppContext } from "../../mod.ts";
import {
  createUnitsClient,
  GetAllUnitCharacteristicsResponseDocument,
} from "../../clients/units.ts";

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
}

/**
 * @title Buscar Características de Unidades
 * @description Retorna todas as características cadastradas para unidades imobiliárias
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<GetAllUnitCharacteristicsResponseDocument> => {
  const unitsClient = createUnitsClient(ctx);

  const response = await unitsClient["GET /units/characteristics"]({
    limit: props.limit,
    offset: props.offset,
  });

  const data = await response.json();
  return data;
};

export default loader;
