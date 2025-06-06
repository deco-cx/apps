import { AppContext } from "../../mod.ts";
import {
  Calendar,
  createBuildingCalendarClient,
} from "../../clients/buildingCalendar.ts";

/**
 * Props para busca de calendário de obra
 */
interface Props {
  /**
   * @title ID da Obra
   * @description Código da obra para busca do calendário
   */
  buildingId: number;
}

/**
 * @title Buscar Calendário de Obra
 * @description Retorna o calendário de uma obra específica
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Calendar> => {
  const client = createBuildingCalendarClient(ctx);

  try {
    const response = await client
      ["GET /building-projects/:buildingId/calendar"]({
        buildingId: props.buildingId,
      });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Erro ao buscar calendário de obra:", error);
    throw new Error(
      `Erro ao buscar calendário de obra: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

export default loader;
