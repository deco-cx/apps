import { AppContext } from "../../mod.ts";
import { Event, UpdateEventParams } from "../../utils/types.ts";

export interface Props
  extends Omit<UpdateEventParams, "calendarId" | "eventId"> {
  /** ID do calendario */
  calendarId: string;
  /** ID do evento a ser atualizado */
  eventId: string;
  /** Dados atualizados do evento */
  event: Partial<
    Omit<
      Event,
      | "id"
      | "etag"
      | "created"
      | "updated"
      | "htmlLink"
      | "iCalUID"
      | "sequence"
      | "kind"
    >
  >;
  /** Se deve fazer uma atualizacao completa (PUT) ou parcial (PATCH). Default e PATCH */
  fullUpdate?: boolean;
}

/**
 * @title Atualizar Evento
 * @description Atualiza um evento existente no calendario
 */
export default async function updateEvent(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const { calendarId, eventId, event, fullUpdate = false, ...searchParams } =
    props;

  const endpoint = fullUpdate
    ? "PUT /calendars/:calendarId/events/:eventId"
    : "PATCH /calendars/:calendarId/events/:eventId";

  const response = await ctx.client[endpoint]({
    calendarId,
    eventId,
    ...searchParams,
  }, {
    body: event as Event,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to update event: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  return await response.json();
}
