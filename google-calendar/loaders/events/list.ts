import { AppContext } from "../../mod.ts";
import { EventsListParams } from "../../utils/types.ts";

export interface Props extends EventsListParams {}

/**
 * @title Lista Eventos
 * @description Lista eventos de um calendario especifico
 */
export default async function listEvents(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const { calendarId, ...searchParams } = props;

  const response = await ctx.client["GET /calendars/:calendarId/events"]({
    calendarId,
    ...searchParams,
  });

  if (!response.ok) {
    throw new Error(
      `Failed to list events: ${response.status} ${response.statusText}`,
    );
  }

  return await response.json();
}
