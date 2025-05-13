import { AppContext } from "../../mod.ts";
import {
  Calendar,
  createBuildingCalendarClient,
  PutCalendarResponse,
} from "../../clients/buildingCalendar.ts";

/**
 * Props para atualização de calendário de obra
 */
interface Props {
  /**
   * @title ID da Obra
   * @description Código da obra para atualização do calendário
   */
  buildingId: number;

  /**
   * @title Data de Início
   * @description Data de início da obra no formato yyyy-MM-dd
   */
  projectStartDate: string;

  /**
   * @title Data de Término
   * @description Data de término da obra no formato yyyy-MM-dd
   */
  projectFinishDate: string;

  /**
   * @title Considerar Feriados e Folgas do Cadastro Geral
   * @description Indica se os feriados e folgas do cadastro geral devem ser considerados
   */
  considerHolidaysAndDaysOffInGeneralRegister: boolean;

  /**
   * @title Considerar Sábados como Dia de Trabalho
   * @description Indica se os sábados são considerados dias de trabalho
   */
  considerSaturdaysAsWorkingDay: boolean;

  /**
   * @title Considerar Domingos como Dia de Trabalho
   * @description Indica se os domingos são considerados dias de trabalho
   */
  considerSundaysAsWorkingDay: boolean;
}

/**
 * @title Atualizar Calendário de Obra
 * @description Atualiza o calendário de uma obra específica
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{
  success: boolean;
  message: string;
  data?: PutCalendarResponse;
}> => {
  const client = createBuildingCalendarClient(ctx);

  try {
    const calendar: Calendar = {
      projectStartDate: props.projectStartDate,
      projectFinishDate: props.projectFinishDate,
      considerHolidaysAndDaysOffInGeneralRegister:
        props.considerHolidaysAndDaysOffInGeneralRegister,
      considerSaturdaysAsWorkingDay: props.considerSaturdaysAsWorkingDay,
      considerSundaysAsWorkingDay: props.considerSundaysAsWorkingDay,
    };

    const response = await client
      ["PUT /building-projects/:buildingId/calendar"]({
        buildingId: props.buildingId,
      }, {
        body: calendar,
      });

    const result = await response.json();

    return {
      success: true,
      message: "Calendário de obra atualizado com sucesso.",
      data: result,
    };
  } catch (error) {
    console.error("Erro ao atualizar calendário de obra:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `Erro ao atualizar calendário de obra: ${errorMessage}`,
    };
  }
};

export default action;
