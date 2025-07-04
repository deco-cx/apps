import { AppContext } from "../../mod.ts";

export interface Props {
  /** ID do calendário onde criar o evento */
  calendarId: string;
  /** Texto descrevendo o evento (ex: "Reunião com cliente amanhã às 14h") */
  text: string;
  /** Se deve enviar notificações sobre a criação do evento. Default é false */
  sendNotifications?: boolean;
}

/**
 * @title Adicionar Evento Rápido
 * @description Cria um evento rapidamente usando texto natural
 */
export default async function quickAddEvent(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const { calendarId, text, sendNotifications = false } = props;

  const response = await ctx.client
    ["POST /calendars/:calendarId/events/quickAdd"]({
      calendarId,
      text,
      sendNotifications,
    });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to quick add event: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  return await response.json();
}
