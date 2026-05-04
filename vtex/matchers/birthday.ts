import { AppContext } from "../mod.ts";
import { parseCookie } from "../utils/vtexId.ts";

interface Profile {
  birthDate: string | null;
}

/**
 * @title {{{match}}}
 */
export interface Props {
  /**
   * @title Match mode
   * @description "day" matches exact day, "week" matches 7 days around birthday, "month" matches entire birth month
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
  req: Request,
  ctx: AppContext,
): Promise<boolean> => {
  const { match = "day" } = props;
  const { io } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    return false;
  }

  try {
    const query = "query getUserProfile { profile { birthDate }}";

    const { profile } = await io.query<{ profile: Profile }, null>(
      { query },
      { headers: { cookie } },
    );

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
        // Get the Sunday that starts the birthday week
        const weekStart = new Date(birthdayThisYear);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        // Saturday that ends the birthday week
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
