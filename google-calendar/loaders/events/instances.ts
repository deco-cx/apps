import { AppContext } from "../../mod.ts";

export interface Props {
  /** ID do calendario */
  calendarId: string;
  /** ID do evento recorrente */
  eventId: string;
  /** Numero maximo de participantes para incluir na resposta */
  maxAttendees?: number;
  /** Numero maximo de instancias para retornar. Default e 250, maximo e 2500 */
  maxResults?: number;
  /** Token especificando qual pagina de resultados retornar */
  pageToken?: string;
  /** Se deve incluir instancias deletadas. Default e false */
  showDeleted?: boolean;
  /** Limite inferior para o horario de inicio de uma instancia para filtrar. Timestamp RFC3339 */
  timeMin?: string;
  /** Limite superior para o horario de inicio de uma instancia para filtrar. Timestamp RFC3339 */
  timeMax?: string;
  /** Fuso horario usado na resposta. Default e o fuso horario do calendario */
  timeZone?: string;
}

/**
 * @title Listar Instancias de Evento Recorrente
 * @description Lista as instancias de um evento recorrente
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
