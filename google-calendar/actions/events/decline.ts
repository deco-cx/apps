import { AppContext } from "../../mod.ts";
import { EventAttendee } from "../../utils/types.ts";

export interface Props {
  /** ID do calendario */
  calendarId: string;
  /** ID do evento para negar o convite */
  eventId: string;
  /** Email do participante que está negando (opcional, usa o usuário atual se não fornecido) */
  attendeeEmail?: string;
  /** Comentário opcional sobre a negação */
  comment?: string;
  /** Se deve enviar notificações sobre a negação. Default é true */
  sendNotifications?: boolean;
  /** Convidados que devem receber notificações sobre a negação */
  sendUpdates?: "all" | "externalOnly" | "none";
}

/**
 * @title Negar Convite de Evento
 * @description Nega um convite de evento sem excluir o evento do calendario
 */
export default async function declineEvent(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const {
    calendarId,
    eventId,
    attendeeEmail,
    comment,
    sendNotifications = true,
    sendUpdates = "all",
  } = props;

  // Primeiro, busca o evento atual para obter os dados dos participantes
  const getResponse = await ctx.client
    ["GET /calendars/:calendarId/events/:eventId"]({
      calendarId,
      eventId,
    });

  if (!getResponse.ok) {
    throw new Error(
      `Failed to get event: ${getResponse.status} ${getResponse.statusText}`,
    );
  }

  const event = await getResponse.json();

  if (!event.attendees || event.attendees.length === 0) {
    throw new Error(
      "Este evento não possui participantes para negar o convite",
    );
  }

  // Encontra o participante que está negando o convite
  // Se não foi fornecido email, usa o primeiro participante marcado como 'self'
  let targetAttendee: EventAttendee | undefined = undefined;

  if (attendeeEmail) {
    targetAttendee = event.attendees.find((attendee: EventAttendee) =>
      attendee.email === attendeeEmail
    );
  } else {
    // Procura pelo participante que é o próprio usuário
    targetAttendee = event.attendees.find((attendee: EventAttendee) =>
      attendee.self === true
    );
  }

  if (!targetAttendee) {
    throw new Error(
      attendeeEmail
        ? `Participante com email ${attendeeEmail} não encontrado no evento`
        : "Não foi possível identificar o participante atual no evento",
    );
  }

  // Atualiza o status de resposta para 'declined'
  const updatedAttendees = event.attendees.map((attendee: EventAttendee) => {
    if (attendee.email === targetAttendee!.email) {
      return {
        ...attendee,
        responseStatus: "declined" as const,
        comment: comment || attendee.comment,
      };
    }
    return attendee;
  });

  // Atualiza o evento com o novo status de resposta
  const updateResponse = await ctx.client
    ["PATCH /calendars/:calendarId/events/:eventId"]({
      calendarId,
      eventId,
      sendNotifications,
      sendUpdates,
    }, {
      body: {
        attendees: updatedAttendees,
      },
    });

  if (!updateResponse.ok) {
    const errorText = await updateResponse.text();
    throw new Error(
      `Failed to decline event invitation: ${updateResponse.status} ${updateResponse.statusText} - ${errorText}`,
    );
  }

  const updatedEvent = await updateResponse.json();

  return {
    success: true,
    message: "Convite negado com sucesso",
    event: updatedEvent,
    declinedAttendee: targetAttendee.email,
  };
}
