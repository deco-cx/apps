import { AppContext } from "../../mod.ts";

type Props = {
  calendarId: string;
};

export default async function get(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const response = await ctx.client["GET /calendars/:calendarId"]({
    ...props,
  });

  if (!response.ok) {
    throw new Error(`Failed to get calendar: ${response.status}`);
  }
  return response.json();
}
