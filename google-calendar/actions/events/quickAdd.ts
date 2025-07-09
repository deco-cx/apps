import { AppContext } from "../../mod.ts";

export interface Props {
  /** ID do calendario onde criar o evento */
  calendarId: string;
  /** Texto descrevendo o evento (ex: "Reuniao com cliente amanha as 14h") */
  text: string;
  /** Se deve enviar notificacoes sobre a criacao do evento. Default e false */
  sendNotifications?: boolean;
}

/**
 * @title Adicionar Evento Rapido
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
