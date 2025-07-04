import { AppContext } from "../../mod.ts";
import { CalendarListParams } from "../../utils/types.ts";

type Props = CalendarListParams;

export default async function list(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const response = await ctx.client["GET /users/me/calendarList"]({
    ...props,
  });

  if (!response.ok) {
    throw new Error(`Failed to get calendar list: ${response.status}`);
  }

  return await response.json();
}
