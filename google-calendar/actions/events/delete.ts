import { AppContext } from "../../mod.ts";

export interface Props {
  /** ID do calendario */
  calendarId: string;
  /** ID do evento a ser deletado */
  eventId: string;
  /** Se deve enviar notificacoes sobre a exclusao do evento. Default e false */
  sendNotifications?: boolean;
  /** Convidados que devem receber notificacoes sobre a exclusao do evento */
  sendUpdates?: "all" | "externalOnly" | "none";
}

/**
 * @title Deletar Evento
 * @description Deleta um evento do calendario
 */
export default async function deleteEvent(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const { calendarId, eventId, ...searchParams } = props;

  const response = await ctx.client
    ["DELETE /calendars/:calendarId/events/:eventId"]({
      calendarId,
      eventId,
      ...searchParams,
    });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to delete event: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  return { success: true, message: "Event deleted successfully" };
}
