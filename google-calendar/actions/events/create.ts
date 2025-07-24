import { AppContext } from "../../mod.ts";
import { CreateEventParams, Event } from "../../utils/types.ts";

export interface Props extends Omit<CreateEventParams, "calendarId"> {
  /** ID do calendario onde criar o evento */
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
  /** Se deve adicionar automaticamente um link do Google Meet. Default é false */
  addGoogleMeet?: boolean;
}

/**
 * @title Criar Evento
 * @description Cria um novo evento no calendario especificado com opção de adicionar Google Meet
 */
export default async function createEvent(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const { calendarId, event, addGoogleMeet = false, ...searchParams } = props;

  // Configura o Google Meet automaticamente se solicitado
  const eventWithMeet: Event = {
    ...event,
    conferenceData: addGoogleMeet
      ? {
        createRequest: {
          requestId: `meet-${Date.now()}-${
            Math.random().toString(36).substr(2, 9)
          }`,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      }
      : event.conferenceData,
  } as Event;

  const response = await ctx.client["POST /calendars/:calendarId/events"]({
    calendarId,
    conferenceDataVersion: addGoogleMeet ? 1 : undefined,
    ...searchParams,
  }, {
    body: eventWithMeet,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create event: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  const createdEvent = await response.json();

  return {
    ...createdEvent,
    meetLink: addGoogleMeet && createdEvent.conferenceData?.entryPoints?.find(
      // deno-lint-ignore no-explicit-any
      (ep: any) => ep.entryPointType === "video",
    )?.uri,
  };
}
