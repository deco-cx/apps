/** An ISO 8601 date or date-time carrying no timezone designator. */
const ISO_WITHOUT_TIMEZONE =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?)?$/;

/**
 * Parses a CMS-authored date or date-time into a timestamp.
 *
 * `BlogPost.date` may be a bare `YYYY-MM-DD` or a full ISO 8601 timestamp, and
 * `scheduledDatetime` is a date-time that may or may not carry an offset.
 *
 * Anything without a timezone designator is pinned to UTC, so the result never
 * depends on the machine timezone. That matters for both shapes: per spec a
 * bare date is already UTC, but an offset-less datetime is parsed as *local*
 * time, which would otherwise reorder posts near a day boundary from one
 * server to the next — and, for a scheduled post, move its go-live instant.
 *
 * Unparseable values fall back to 0 instead of leaking NaN into a comparator
 * (a NaN result is treated as 0, so the post would never move). Callers that
 * compare against "now" must reject 0 explicitly rather than let it through as
 * a very old date.
 */
export const dateToTime = (date: string) =>
  new Date(
    ISO_WITHOUT_TIMEZONE.test(date)
      ? `${date.includes("T") ? date : `${date}T00:00:00`}Z`
      : date,
  ).getTime() || 0;

/**
 * An ISO 8601 date, optionally with a time and an offset. Anchored, grouped and
 * deliberately narrow: `Date` accepts far more than this, and the extras are the
 * problem — see `scheduledTime`.
 */
const STRICT_ISO =
  /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?)?(Z|[+-]\d{2}:\d{2})?$/;

const lastDayOfMonth = (year: number, month: number) =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

/**
 * Parses a scheduled go-live instant, or returns `null` if the value isn't one.
 *
 * Publishing needs a stricter parse than sorting does, because here a
 * misreading doesn't reorder a list — it puts a post on the live site at the
 * wrong moment. `Date` is lenient in two ways that both do exactly that:
 *
 * - It accepts non-ISO strings and parses them in *server-local* time, so
 *   `"Sep 1 2026"` would go live at a different instant on every machine —
 *   silently defeating the UTC pinning this module exists to guarantee. Worse,
 *   it accepts strings that aren't dates in any useful sense: `"0"` is the year
 *   2000, i.e. already live.
 * - It rolls calendar overflow forward instead of rejecting it, so a typo'd
 *   `"2026-02-31"` publishes on March 3rd.
 *
 * So the shape is matched against an anchored ISO pattern and the fields are
 * range-checked before `Date` ever sees them. Anything else is `null`, and
 * callers treat `null` as "not live" — a schedule we can't read is one we must
 * not act on.
 *
 * A bare `YYYY-MM-DD` is accepted as midnight UTC: unlike the cases above it's
 * an unambiguous ISO form, and rejecting it would strand a post forever over a
 * missing time. `null` is used rather than 0 so that the Unix epoch stays a
 * representable instant instead of being indistinguishable from a failure.
 */
export const scheduledTime = (value: string): number | null => {
  const match = STRICT_ISO.exec(value);

  if (!match) {
    return null;
  }

  const [, ...groups] = match;
  const [year, month, day] = groups.slice(0, 3).map(Number);
  const [hour, minute, second] = groups.slice(3, 6).map((part) =>
    Number(part ?? 0)
  );

  if (
    month < 1 || month > 12 ||
    day < 1 || day > lastDayOfMonth(year, month) ||
    hour > 23 || minute > 59 || second > 59
  ) {
    return null;
  }

  // Only pin UTC when the value carries no designator of its own; `dateToTime`
  // isn't reused here because its 0-on-failure fallback is precisely the
  // ambiguity this function exists to remove.
  const parsed = new Date(
    groups[6] ? value : `${value.includes("T") ? value : `${value}T00:00:00`}Z`,
  ).getTime();

  // Still reachable despite the checks above — an out-of-range offset such as
  // `+99:00` matches the pattern but is not a real instant.
  return Number.isNaN(parsed) ? null : parsed;
};
