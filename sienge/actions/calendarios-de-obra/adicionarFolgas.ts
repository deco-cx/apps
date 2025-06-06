import { AppContext } from "../../mod.ts";
import {
  createBuildingCalendarClient,
  DayOff,
} from "../../clients/buildingCalendar.ts";

/**
 * Props para adicionar folgas no calendário de obra
 */
interface Props {
  /**
   * @title ID da Obra
   * @description Código da obra para adicionar folgas no calendário
   */
  buildingId: number;

  /**
   * @title Folgas
   * @description Array de folgas a serem adicionadas no calendário
   */
  folgas: Array<{
    /**
     * @title Data da Folga
     * @description Data da folga no formato yyyy-MM-dd
     */
    date: string;

    /**
     * @title Descrição
     * @description Descrição ou nome da folga
     */
    description: string;
  }>;
}

/**
 * @title Adicionar Folgas no Calendário
 * @description Adiciona folgas ao calendário de uma obra específica
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
    const folgas: DayOff[] = props.folgas.map((folga) => ({
      date: folga.date,
      description: folga.description,
    }));

    await client["POST /building-projects/:buildingId/calendar/days-off"]({
      buildingId: props.buildingId,
    }, {
      body: folgas,
    });

    return {
      success: true,
      message:
        `${folgas.length} folga(s) adicionada(s) com sucesso ao calendário da obra.`,
    };
  } catch (error) {
    console.error("Erro ao adicionar folgas ao calendário de obra:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("422")) {
      return {
        success: false,
        message:
          "Erro: Uma ou mais folgas estão fora do período de execução da obra.",
      };
    }

    return {
      success: false,
      message:
        `Erro ao adicionar folgas ao calendário de obra: ${errorMessage}`,
    };
  }
};

export default action;
