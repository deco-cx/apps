import { AppContext } from "../../mod.ts";

export interface FreeBusyRequestItem {
  /** ID do calendario */
  id: string;
}

export interface Props {
  /** Limite inferior do intervalo de tempo para a consulta. Timestamp RFC3339 */
  timeMin: string;
  /** Limite superior do intervalo de tempo para a consulta. Timestamp RFC3339 */
  timeMax: string;
  /** Fuso horario usado na resposta. Default e UTC */
  timeZone?: string;
  /** Maximo de expansoes de eventos por calendario. Default e 50 */
  calendarExpansionMax?: number;
  /** Maximo de eventos por resposta. Default e 250 */
  groupExpansionMax?: number;
  /** Lista de calendarios e/ou grupos para consultar */
  items: FreeBusyRequestItem[];
}

/**
 * @title Consultar Disponibilidade (Livre/Ocupado)
 * @description Retorna informacoes de livre/ocupado para um conjunto de calendarios
 */
export default async function getFreeBusy(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const response = await ctx.client["POST /freeBusy"]({}, {
    body: props,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to get free/busy information: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  return await response.json();
}
