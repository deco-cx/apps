import { AppContext } from "../../mod.ts";
import {
  createBuildingCalendarClient,
  DayOffForDelete,
} from "../../clients/buildingCalendar.ts";

/**
 * Props para remover folgas do calendário de obra
 */
interface Props {
  /**
   * @title ID da Obra
   * @description Código da obra para remover folgas do calendário
   */
  buildingId: number;

  /**
   * @title Datas das Folgas
   * @description Array com as datas das folgas a serem removidas
   */
  datas: string[];
}

/**
 * @title Remover Folgas do Calendário
 * @description Remove folgas do calendário de uma obra específica
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{
  success: boolean;
  message: string;
}> => {
  const client = createBuildingCalendarClient(ctx);

  try {
    const folgas: DayOffForDelete[] = props.datas.map((data) => ({
      date: data,
    }));

    await client["DELETE /building-projects/:buildingId/calendar/days-off"]({
      buildingId: props.buildingId,
    }, {
      body: folgas,
    });

    return {
      success: true,
      message:
        `${folgas.length} folga(s) removida(s) com sucesso do calendário da obra.`,
    };
  } catch (error) {
    console.error("Erro ao remover folgas do calendário de obra:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("422")) {
      return {
        success: false,
        message:
          "Erro: Uma ou mais folgas não foram encontradas no calendário da obra.",
      };
    }

    return {
      success: false,
      message: `Erro ao remover folgas do calendário de obra: ${errorMessage}`,
    };
  }
};

export default action;
