import { type MatchContext } from "@deco/deco/blocks";
import { parseAuthCookie } from "../utils/vtexId.ts";

/**
 * @title {{{match}}}
 */
export interface Props {
  /**
   * @title Match mode
   * @description "day" matches exact birthday, "week" matches the calendar week (Sun-Sat) containing the birthday, "month" matches entire birth month
   * @default day
   */
  match?: "day" | "month" | "week";
}

/**
 * @title Birthday
 * @description Target users based on their birth date
 * @icon calendar-event
 */
const MatchBirthday = async (
  props: Props,
  { request, invoke }: MatchContext,
): Promise<boolean> => {
  const { match = "day" } = props;

  const payload = parseAuthCookie(request.headers);
  if (!payload?.sub || !payload?.userId) return false;

  try {
    // deno-lint-ignore no-explicit-any
    const profile = await (invoke as any).vtex.loaders.profile
      .getCurrentProfile({}) as { birthDate?: string } | null;

    if (!profile?.birthDate) {
      return false;
    }

    const birthDate = new Date(profile.birthDate);
    const today = new Date();

    const birthMonth = birthDate.getUTCMonth();
    const birthDay = birthDate.getUTCDate();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();

    switch (match) {
      case "month":
        return birthMonth === todayMonth;

      case "day":
        return birthMonth === todayMonth && birthDay === todayDay;

      case "week": {
        const currentYear = today.getFullYear();
        const birthdayThisYear = new Date(
          currentYear,
          birthMonth,
          birthDay,
        );
        const weekStart = new Date(birthdayThisYear);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        return today >= weekStart && today <= weekEnd;
      }

      default:
        return birthMonth === todayMonth && birthDay === todayDay;
    }
  } catch {
    return false;
  }
};

export default MatchBirthday;
