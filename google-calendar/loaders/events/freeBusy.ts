import { AppContext } from "../../mod.ts";

export interface FreeBusyRequestItem {
  /** ID do calendário */
  id: string;
}

export interface Props {
  /** Limite inferior do intervalo de tempo para a consulta. Timestamp RFC3339 */
  timeMin: string;
  /** Limite superior do intervalo de tempo para a consulta. Timestamp RFC3339 */
  timeMax: string;
  /** Fuso horário usado na resposta. Default é UTC */
  timeZone?: string;
  /** Máximo de expansões de eventos por calendário. Default é 50 */
  calendarExpansionMax?: number;
  /** Máximo de eventos por resposta. Default é 250 */
  groupExpansionMax?: number;
  /** Lista de calendários e/ou grupos para consultar */
  items: FreeBusyRequestItem[];
}

/**
 * @title Consultar Disponibilidade (Livre/Ocupado)
 * @description Retorna informações de livre/ocupado para um conjunto de calendários
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
    throw new Error(`Failed to get free/busy information: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
} 