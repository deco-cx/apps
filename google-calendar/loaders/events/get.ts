import { AppContext } from "../../mod.ts";

export interface Props {
  /** ID do calendario */
  calendarId: string;
  /** ID do evento */
  eventId: string;
  /** Numero maximo de participantes para incluir na resposta */
  maxAttendees?: number;
  /** Fuso horario usado na resposta. Padrao e o fuso horario do calendario */
  timeZone?: string;
  /** Se deve sempre incluir um valor no campo email para o organizador, criador e participantes */
  alwaysIncludeEmail?: boolean;
}

/**
 * @title Buscar Evento
 * @description Busca os detalhes de um evento especifico
 */
export default async function getEvent(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const { calendarId, eventId, ...searchParams } = props;

  const response = await ctx.client
    ["GET /calendars/:calendarId/events/:eventId"]({
      calendarId,
      eventId,
      ...searchParams,
    });

  if (!response.ok) {
    throw new Error(
      `Failed to get event: ${response.status} ${response.statusText}`,
    );
  }

  return await response.json();
}
