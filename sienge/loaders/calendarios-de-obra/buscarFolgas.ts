import { AppContext } from "../../mod.ts";
import {
  createBuildingCalendarClient,
  DayOff,
  ResultSetMetadata,
} from "../../clients/buildingCalendar.ts";

/**
 * Props para busca de folgas do calendário de obra
 */
interface Props {
  /**
   * @title ID da Obra
   * @description Código da obra para busca de folgas no calendário
   */
  buildingId: number;

  /**
   * @title Offset
   * @description Deslocamento para paginação dos resultados (padrão: 0)
   */
  offset?: number;

  /**
   * @title Limite
   * @description Quantidade máxima de resultados a serem retornados (máximo: 200, padrão: 100)
   */
  limit?: number;
}

/**
 * @title Buscar Folgas do Calendário
 * @description Retorna as folgas configuradas no calendário de uma obra
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{
  metadata: ResultSetMetadata;
  folgas: DayOff[];
}> => {
  const client = createBuildingCalendarClient(ctx);

  try {
    const response = await client
      ["GET /building-projects/:buildingId/calendar/days-off"]({
        buildingId: props.buildingId,
        offset: props.offset,
        limit: props.limit,
      });

    const result = await response.json();

    return {
      metadata: result.resultSetMetadata,
      folgas: result.results,
    };
  } catch (error) {
    console.error("Erro ao buscar folgas do calendário:", error);
    throw new Error(
      `Erro ao buscar folgas do calendário: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

export default loader;
