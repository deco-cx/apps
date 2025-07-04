import { AppContext } from "../../mod.ts";

export interface Props {
  /** ID do calendário */
  calendarId: string;
  /** ID do evento recorrente */
  eventId: string;
  /** Número máximo de participantes para incluir na resposta */
  maxAttendees?: number;
  /** Número máximo de instâncias para retornar. Default é 250, máximo é 2500 */
  maxResults?: number;
  /** Token especificando qual página de resultados retornar */
  pageToken?: string;
  /** Se deve incluir instâncias deletadas. Default é false */
  showDeleted?: boolean;
  /** Limite inferior para o horário de início de uma instância para filtrar. Timestamp RFC3339 */
  timeMin?: string;
  /** Limite superior para o horário de início de uma instância para filtrar. Timestamp RFC3339 */
  timeMax?: string;
  /** Fuso horário usado na resposta. Default é o fuso horário do calendário */
  timeZone?: string;
}

/**
 * @title Listar Instâncias de Evento Recorrente
 * @description Lista as instâncias de um evento recorrente
 */
export default async function listEventInstances(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const { calendarId, eventId, ...searchParams } = props;

  const response = await ctx.client
    ["GET /calendars/:calendarId/events/:eventId/instances"]({
      calendarId,
      eventId,
      ...searchParams,
    });

  if (!response.ok) {
    throw new Error(
      `Failed to list event instances: ${response.status} ${response.statusText}`,
    );
  }

  return await response.json();
}
