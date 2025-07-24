import { AppContext } from "../../mod.ts";

export interface Props {
  /** ID do calendario onde criar o evento */
  calendarId: string;
  /** Texto descrevendo o evento (ex: "Reuniao com cliente amanha as 14h") */
  text: string;
  /** Se deve enviar notificacoes sobre a criacao do evento. Default e false */
  sendNotifications?: boolean;
  /** Se deve adicionar automaticamente um link do Google Meet. Default é false */
  addGoogleMeet?: boolean;
}

/**
 * @title Adicionar Evento Rapido
 * @description Cria um evento rapidamente usando texto natural com opção de adicionar Google Meet
 */
export default async function quickAddEvent(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const { calendarId, text, sendNotifications = false, addGoogleMeet = false } =
    props;

  // Primeiro cria o evento com quickAdd
  const quickAddResponse = await ctx.client
    ["POST /calendars/:calendarId/events/quickAdd"]({
      calendarId,
      text,
      sendNotifications: !addGoogleMeet, // Evita notificação dupla se vai adicionar Meet
    });

  if (!quickAddResponse.ok) {
    const errorText = await quickAddResponse.text();
    throw new Error(
      `Failed to quick add event: ${quickAddResponse.status} ${quickAddResponse.statusText} - ${errorText}`,
    );
  }

  const createdEvent = await quickAddResponse.json();

  // Se deve adicionar Google Meet, atualiza o evento
  if (addGoogleMeet) {
    const updateResponse = await ctx.client
      ["PATCH /calendars/:calendarId/events/:eventId"]({
        calendarId,
        eventId: createdEvent.id,
        conferenceDataVersion: 1,
        sendNotifications,
      }, {
        body: {
          conferenceData: {
            createRequest: {
              requestId: `meet-${Date.now()}-${
                Math.random().toString(36).substr(2, 9)
              }`,
              conferenceSolutionKey: {
                type: "hangoutsMeet",
              },
            },
          },
        },
      });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(
        `Failed to add Google Meet to event: ${updateResponse.status} ${updateResponse.statusText} - ${errorText}`,
      );
    }

    const updatedEvent = await updateResponse.json();

    return {
      ...updatedEvent,
      meetLink: updatedEvent.conferenceData?.entryPoints?.find(
        // deno-lint-ignore no-explicit-any
        (ep: any) => ep.entryPointType === "video",
      )?.uri,
    };
  }

  return createdEvent;
}
