import { AppContext } from "../../mod.ts";

export interface Props {
  /** ID do calendário de origem */
  calendarId: string;
  /** ID do evento a ser movido */
  eventId: string;
  /** ID do calendário de destino */
  destination: string;
  /** Se deve enviar notificações sobre a mudança. Default é false */
  sendNotifications?: boolean;
}

/**
 * @title Mover Evento
 * @description Move um evento de um calendário para outro
 */
export default async function moveEvent(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const { calendarId, eventId, destination, sendNotifications = false } = props;

  const response = await ctx.client
    ["POST /calendars/:calendarId/events/:eventId/move"]({
      calendarId,
      eventId,
      destination,
      sendNotifications,
    });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to move event: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  return await response.json();
}
