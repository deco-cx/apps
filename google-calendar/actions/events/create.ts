import { AppContext } from "../../mod.ts";
import { CreateEventParams, Event } from "../../utils/types.ts";

export interface Props extends Omit<CreateEventParams, "calendarId"> {
  /** ID do calendário onde criar o evento */
  calendarId: string;
  /** Dados do evento a ser criado */
  event: Omit<
    Event,
    | "id"
    | "etag"
    | "created"
    | "updated"
    | "htmlLink"
    | "iCalUID"
    | "sequence"
    | "kind"
  >;
}

/**
 * @title Criar Evento
 * @description Cria um novo evento no calendário especificado
 */
export default async function createEvent(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const { calendarId, event, ...searchParams } = props;

  const response = await ctx.client["POST /calendars/:calendarId/events"]({
    calendarId,
    ...searchParams,
  }, {
    body: event as Event,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create event: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  return await response.json();
}
